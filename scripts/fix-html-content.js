#!/usr/bin/env node
'use strict';

const https = require('node:https');
const http  = require('node:http');
const path  = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_BASE = 'http://localhost:8000/api/v1';

const ARTICLES = [
  { id: '61e29669-4b6e-4690-ad4b-04b36732bb4e', title: 'Revolutionizing 3D Object Generation: A Deep Dive into NeRF and Gaussian Splatting' },
  { id: '7d1c8fca-cb1d-4178-b696-f99ac5e887dc', title: 'Unlocking Efficient AI: Speculative Decoding for Faster LLM Inference' },
  { id: '6a795547-e420-40b4-b45f-3cb64c3ad544', title: 'Revolutionizing Human-Machine Interaction: How AI Agents Use Tool Calling to Interact with the Real World' },
];

function log(msg) { process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function callGroq(title) {
  return new Promise((resolve, reject) => {
    const prompt = `Generate a complete, high-quality, in-depth blog post about: "${title}".

Return ONLY a valid JSON object with one field:
- content: Full blog post in HTML format, minimum 1000 words. Use <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>, <blockquote>, <code>, <pre> tags. Include intro, 4-5 detailed sections with subheadings, and a conclusion. Do NOT include <html>, <head>, <body>, or <img> tags.

Rules: Return raw JSON only. No code fences. No markdown wrapper.`;

    const body = JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens:  8000,
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const ESCAPE_MAP = { '\n': String.raw`\n`, '\r': String.raw`\r`, '\t': String.raw`\t` };
function sanitize(str) {
  let inString = false, escaped = false;
  return [...str].map(ch => {
    if (escaped)     { escaped = false; return ch; }
    if (ch === '\\') { escaped = true;  return ch; }
    if (ch === '"')  { inString = !inString; return ch; }
    return (inString && ESCAPE_MAP[ch]) ? ESCAPE_MAP[ch] : ch;
  }).join('');
}

function extractContent(text) {
  const sources = [text];
  const block = text.match(/```(?:json)?\s*([\s\S]*)```/);
  if (block) sources.push(block[1]);
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s !== -1 && e !== -1) sources.push(text.slice(s, e + 1));

  const allCandidates = sources.flatMap(raw => [raw, sanitize(raw)]);
  for (const candidate of allCandidates) {
    try { return JSON.parse(candidate).content; } catch (error_) { log(`parse attempt: ${error_.message}`); }
  }
  throw new Error(`Could not parse content from: ${text.slice(0, 200)}`);
}

function httpPut(id, content) {
  return new Promise((resolve, reject) => {
    // Fetch existing blog first
    http.get(`${API_BASE}/blogs/${id}`, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const blog = JSON.parse(d).data;
        const payload = JSON.stringify({ ...blog, content });
        const urlObj = new URL(`${API_BASE}/blogs/${id}`);
        const req = http.request({
          method: 'PUT', hostname: urlObj.hostname, port: urlObj.port,
          path: urlObj.pathname,
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        }, (res2) => {
          let d2 = '';
          res2.on('data', c => d2 += c);
          res2.on('end', () => resolve({ status: res2.statusCode, body: JSON.parse(d2) }));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    }).on('error', reject);
  });
}

async function main() {
  log('=== Fixing last 3 articles to HTML content ===');

  for (let i = 0; i < ARTICLES.length; i++) {
    const { id, title } = ARTICLES[i];
    if (i > 0) { log('Waiting 35s for rate limit...'); await sleep(35000); }

    log(`\n[${i + 1}/3] "${title}"`);
    log('Generating HTML content with Groq...');

    let content;
    try {
      const raw = await callGroq(title);
      content = extractContent(raw);
      log(`Content generated (${content.length} chars)`);
    } catch (err) {
      log(`ERROR: ${err.message}`);
      continue;
    }

    try {
      const res = await httpPut(id, content);
      if (res.status === 200) {
        log(`✓ Updated! ID: ${id}`);
      } else {
        log(`Save failed (HTTP ${res.status}): ${JSON.stringify(res.body)}`);
      }
    } catch (err) {
      log(`ERROR saving: ${err.message}`);
    }
  }

  log('\n=== Done ===');
}

main().catch(err => { log(`FATAL: ${err.message}`); process.exit(1); });
