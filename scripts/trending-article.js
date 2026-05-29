#!/usr/bin/env node
/**
 * Trending AI article generator — runs daily at 4:00 AM
 *
 * Writes general, accessible articles about current AI trends,
 * how the world is changing with AI, new models/agents in the news,
 * and practical AI knowledge for everyday readers.
 *
 * Cron (server):
 *   0 4 * * * node /home/ec2-user/aiinsightsblog-svc/scripts/trending-article.js >> /home/ec2-user/logs/trending-article.log 2>&1
 */

'use strict';

const https = require('node:https');
const http  = require('node:http');
const fs    = require('node:fs');
const path  = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_BASE   = 'http://localhost:8000/api/v1';
const WEB_PUBLIC = process.env.WEB_PUBLIC_DIR || '/home/ec2-user/aiinsightsblogs-web/public';
const IMAGES_DIR = path.join(WEB_PUBLIC, 'assets', 'blog-images');

const PROVIDER = {
  provider: 'groq',
  model:    'llama-3.3-70b-versatile',
  baseUrl:  'api.groq.com',
  path:     '/openai/v1/chat/completions',
  apiKey:   () => process.env.GROQ_API_KEY,
};

// ── Categories (same as main app) ─────────────────────────────────────────────
const CATEGORIES = {
  'ai-agents': {
    id: 'cat-1', name: 'AI Agents', slug: 'ai-agents', color: '#0ea5e9', dark: '#0369a1',
    baseTags: ['AI Agents', 'Autonomous AI', 'AI Trends 2025', 'Artificial Intelligence', 'Future of AI', 'AI News'],
  },
  'llms': {
    id: 'cat-2', name: 'Large Language Models', slug: 'llms', color: '#10b981', dark: '#047857',
    baseTags: ['Large Language Models', 'LLM', 'ChatGPT', 'Claude', 'Gemini', 'AI Trends 2025', 'Artificial Intelligence', 'AI News'],
  },
  'generative-ai': {
    id: 'cat-3', name: 'Generative AI', slug: 'generative-ai', color: '#f59e0b', dark: '#b45309',
    baseTags: ['Generative AI', 'AI Image Generation', 'AI Video', 'AI Trends 2025', 'Artificial Intelligence', 'AI News'],
  },
  'robotics': {
    id: 'cat-4', name: 'Robotics', slug: 'robotics', color: '#ef4444', dark: '#b91c1c',
    baseTags: ['Robotics', 'AI Robots', 'Humanoid Robots', 'AI Trends 2025', 'Artificial Intelligence', 'AI News'],
  },
  'machine-learning': {
    id: 'cat-5', name: 'Machine Learning', slug: 'machine-learning', color: '#ec4899', dark: '#be185d',
    baseTags: ['Machine Learning', 'AI Tools', 'Data Science', 'AI Trends 2025', 'Artificial Intelligence', 'AI News'],
  },
  'computer-vision': {
    id: 'cat-6', name: 'Computer Vision', slug: 'computer-vision', color: '#8b5cf6', dark: '#6d28d9',
    baseTags: ['Computer Vision', 'AI Vision', 'AI Applications', 'AI Trends 2025', 'Artificial Intelligence', 'AI News'],
  },
};

// ── Trending topic pools (general knowledge, current trends) ──────────────────
const TOPICS = {
  'ai-agents': [
    'How AI Agents Are Replacing Entire Business Workflows in 2025',
    'The Rise of Autonomous AI: What It Means for Your Job',
    'How Companies Are Using AI Agents to Run 24/7 Without Human Oversight',
    'AI Agents vs Chatbots: What Is the Real Difference?',
    'How OpenAI\'s Operator and Similar AI Agents Are Changing the Internet',
    'Why Every Business Will Have an AI Agent by 2026',
    'How AI Agents Are Revolutionizing Customer Service Worldwide',
    'The Battle of AI Agent Frameworks: Which One Is Winning in 2025?',
    'Can AI Agents Be Trusted? The Safety Debate Explained',
    'How AI Agents Are Being Used in Scientific Research Right Now',
    'From Chatbots to AI Employees: The Evolution of Conversational AI',
    'How AI Agents Are Transforming Software Development Teams',
    'Real-World AI Agent Use Cases That Are Already Saving Companies Millions',
    'Why AI Agents Are the Next Big Platform Shift After Smartphones',
    'How AI Agents Handle Complex Multi-Step Tasks Autonomously',
    'The Companies Leading the AI Agent Race in 2025',
    'AI Agents in Healthcare: Scheduling, Diagnosis Support, and More',
    'How AI Personal Assistants Are Becoming True Digital Employees',
    'The Role of AI Agents in Modern Supply Chain Management',
    'AI Agents and the Future of Remote Work',
  ],
  'llms': [
    'GPT-5, Claude 4, and Gemini Ultra: The Race for the Best LLM in 2025',
    'How Large Language Models Are Changing the Way We Search the Web',
    'What Happens When AI Knows More Than Any Human Expert?',
    'Why Everyone Is Talking About Context Windows in AI Models',
    'How Claude, ChatGPT, and Gemini Are Being Used in Real Workplaces Today',
    'The Real Cost of Running AI: How Companies Afford LLMs',
    'How LLMs Are Being Used to Write Laws, Contracts, and Medical Reports',
    'The Problem with AI Hallucinations and How Companies Are Fixing It',
    'Open Source vs Closed AI Models: Which Side Is Winning?',
    'How LLMs Are Transforming the Education System Globally',
    'Why Smaller AI Models Are Beating Bigger Ones in 2025',
    'How AI Language Models Are Being Used in Journalism',
    'The Rise of Multilingual AI: Breaking Language Barriers Worldwide',
    'How Businesses Are Saving Millions Using AI for Content Creation',
    'What Does It Actually Mean When an AI "Understands" Something?',
    'How AI Models Are Being Fine-Tuned for Specific Industries',
    'The Impact of AI on the Publishing and Writing Industry',
    'How AI Is Changing the Legal Profession Forever',
    'Why AI Literacy Is Becoming as Important as Computer Literacy',
    'How LLMs Are Helping Scientists Discover New Drugs Faster',
  ],
  'generative-ai': [
    'How AI-Generated Content Is Flooding the Internet in 2025',
    'The Creative Economy in the Age of Generative AI',
    'How Designers and Artists Are Adapting to AI Image Generation',
    'AI Video Generation: How Hollywood Is Responding to Sora and Runway',
    'The Copyright War: Who Owns AI-Generated Content?',
    'How Generative AI Is Changing Advertising and Marketing Forever',
    'AI Music Is Here: How Suno and Udio Are Disrupting the Music Industry',
    'How AI is Being Used to Create Entire Video Games',
    'The Dark Side of Generative AI: Deepfakes and Misinformation',
    'How AI Is Transforming the Fashion and Product Design Industry',
    'Why Brands Are Using AI Avatars Instead of Human Influencers',
    'The Future of Film: AI Directors, Writers, and Actors',
    'How Generative AI Is Accelerating Drug Discovery in 2025',
    'AI-Generated News: The Future of Journalism or Its Downfall?',
    'How Small Businesses Are Using Generative AI to Compete with Big Brands',
    'The Rise of AI-Powered Personalized Content at Scale',
    'How Generative AI Is Changing the Architecture and Interior Design World',
    'AI in E-Commerce: Personalized Product Images Generated on the Fly',
    'How Generative AI Is Being Used to Restore Historical Artifacts',
    'The Ethical Debate Around AI-Generated Art and Its Impact on Human Creators',
  ],
  'robotics': [
    'Humanoid Robots Are Now Working in Real Factories: What This Means',
    'Tesla Optimus, Figure 02, and the Humanoid Robot Race of 2025',
    'How AI-Powered Robots Are Solving the Global Labor Shortage',
    'The Rise of Domestic Robots: When Will One Be in Every Home?',
    'How Robots Are Transforming Warehousing and Logistics Globally',
    'AI Robots in Healthcare: From Surgery Assistance to Elder Care',
    'How Agricultural Robots Are Solving the Global Food Crisis',
    'The Military AI Race: Autonomous Drones and Robot Soldiers',
    'How Boston Dynamics and Its Rivals Are Changing the Robotics Industry',
    'Why 2025 Is the Tipping Point for Robotics Adoption in Manufacturing',
    'How AI Robots Are Being Used in Disaster Relief and Search and Rescue',
    'The Rise of Robot Teachers: AI in Physical Education Spaces',
    'How Delivery Robots Are Changing Urban Infrastructure',
    'Robot Rights: The Philosophical Debate We Need to Have Now',
    'How AI-Powered Drones Are Revolutionizing the Construction Industry',
    'The Role of Robotics in Space Exploration in 2025',
    'How Micro-Robots Are Being Developed for Use Inside the Human Body',
    'AI Robots in Retail: Replacing Cashiers or Helping Customers?',
    'The Economics of Robots: When Does Buying a Robot Pay Off?',
    'How Countries Are Competing to Lead the Global Robotics Industry',
  ],
  'machine-learning': [
    'How AI Is Predicting Climate Change Better Than Any Model Before',
    'The AI Boom in Finance: Trading, Fraud Detection, and Risk Management',
    'How Machine Learning Is Transforming Healthcare Diagnostics',
    'AI in Cybersecurity: How Models Are Fighting Hackers in Real Time',
    'How Streaming Platforms Use AI to Keep You Watching Longer',
    'The Role of Machine Learning in the 2025 Global Energy Transition',
    'How AI Is Being Used to Predict Natural Disasters Earlier',
    'Why Data Privacy Is the Biggest Challenge Facing AI in 2025',
    'How AI Is Helping Governments Make Better Policy Decisions',
    'The AI Job Market in 2025: What Skills Are Actually in Demand',
    'How Machine Learning Is Changing Sports Performance and Analytics',
    'AI in Agriculture: How Smart Farming Is Feeding the World',
    'How Machine Learning Is Revolutionizing Drug Development Timelines',
    'The Role of AI in Fighting Misinformation and Fake News',
    'How AI Is Being Used to Make Cities Smarter and More Efficient',
    'Machine Learning in Supply Chain: Predicting Disruptions Before They Happen',
    'How AI Is Helping Tackle Mental Health Crises Worldwide',
    'The Economics of AI: How Much Is the AI Industry Worth in 2025?',
    'How AI Is Transforming the Insurance Industry',
    'AI and the Future of Work: Which Jobs Are Safe and Which Are Not',
  ],
  'computer-vision': [
    'How AI Cameras Are Making Cities Safer Through Smart Surveillance',
    'How Facial Recognition Is Being Used and Abused Around the World',
    'The Rise of Visual AI: How Computers Are Learning to See Better Than Humans',
    'How AI Vision Is Revolutionizing Quality Control in Manufacturing',
    'Self-Driving Cars in 2025: How Close Are We Really?',
    'How AI Vision Is Being Used to Monitor Deforestation from Space',
    'Retail AI: How Stores Are Using Computer Vision to Track Everything',
    'How AI Is Helping Doctors Read Medical Images More Accurately',
    'The Role of Computer Vision in Smart Traffic Management Systems',
    'How AI Vision Models Are Being Used to Help Visually Impaired People',
    'How AI Cameras in Smartphones Have Changed Photography Forever',
    'The Privacy War Against Facial Recognition Technology',
    'How Computer Vision Is Transforming the Construction Industry',
    'AI in Sports Broadcasting: Real-Time Analysis and Smart Camera Systems',
    'How AI Vision Is Being Used to Combat Wildlife Poaching',
    'The Use of AI Vision in Border Control and Immigration Systems',
    'How Augmented Reality and Computer Vision Are Merging in 2025',
    'AI Eye Tracking: How Technology Is Reading Human Attention and Emotion',
    'How AI Vision Systems Are Improving Road Safety Globally',
    'The Role of Computer Vision in the Metaverse and Virtual Reality',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) { process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`); }

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── SVG Generator ─────────────────────────────────────────────────────────────
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function generateSVG(title, category) {
  const lines    = wrapText(title, 32);
  let fontSize = 54;
  if (lines.length > 3)      fontSize = 42;
  else if (lines.length > 2) fontSize = 48;
  const lineH    = fontSize * 1.3;
  const totalH   = lines.length * lineH;
  const startY   = (630 - totalH) / 2 + fontSize * 0.8;
  const safe     = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const textEls  = lines.map((line, i) =>
    `<text x="600" y="${startY + i * lineH}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" filter="url(#shadow)">${safe(line)}</text>`
  ).join('\n  ');

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f1a"/>
      <stop offset="100%" style="stop-color:${category.dark}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${category.color};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:${category.color};stop-opacity:0.03"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.7)"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <circle cx="1050" cy="100" r="220" fill="${category.color}" opacity="0.06"/>
  <circle cx="150"  cy="530" r="160" fill="${category.color}" opacity="0.06"/>
  ${textEls}
</svg>`;
}

function saveImage(slug, title, category) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const fileName = `${slug}.svg`;
  const filePath = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, generateSVG(title, category), 'utf8');
  return `/assets/blog-images/${fileName}`;
}

// ── AI caller ─────────────────────────────────────────────────────────────────
function callAIOnce(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:       PROVIDER.model,
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens:  8000,
    });

    const req = https.request({
      hostname: PROVIDER.baseUrl,
      path:     PROVIDER.path,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${PROVIDER.apiKey()}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(`groq error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          resolve(parsed.choices?.[0]?.message?.content ?? '');
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callAI(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await callAIOnce(prompt);
    } catch (err) {
      const isRateLimit = err.message.toLowerCase().includes('rate limit') || err.message.includes('429');
      if (isRateLimit && i < retries - 1) {
        log(`Rate limited, retrying in 35s... (attempt ${i + 1}/${retries})`);
        await sleep(35000);
      } else {
        throw err;
      }
    }
  }
}

const ESCAPE_MAP = { '\n': String.raw`\n`, '\r': String.raw`\r`, '\t': String.raw`\t` };

function sanitizeJSON(str) {
  let inString = false, escaped = false;
  return [...str].map(ch => {
    if (escaped)     { escaped = false; return ch; }
    if (ch === '\\') { escaped = true;  return ch; }
    if (ch === '"')  { inString = !inString; return ch; }
    return (inString && ESCAPE_MAP[ch]) ? ESCAPE_MAP[ch] : ch;
  }).join('');
}

function extractJSON(text) {
  const sources = [text];
  const block = text.match(/```(?:json)?\s*([\s\S]*)```/);
  if (block) sources.push(block[1]);
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s !== -1 && e !== -1) sources.push(text.slice(s, e + 1));

  for (const raw of sources) {
    for (const candidate of [raw, sanitizeJSON(raw)]) {
      try { return JSON.parse(candidate); } catch (err) { log(`JSON parse attempt failed: ${err.message}`); }
    }
  }
  throw new Error(`Could not extract JSON: ${text.slice(0, 300)}`);
}

async function generateArticle(topic) {
  const prompt = `Write an engaging, reader-friendly blog post about: "${topic}".

This article is for a general audience curious about AI trends — not just developers. Write like a journalist or tech writer explaining complex ideas simply.

Return ONLY a valid JSON object with these exact fields:
- title: A compelling, curiosity-driven headline (string)
- slug: URL-friendly slug, lowercase, hyphens only (string)
- excerpt: A hook-style 2-3 sentence summary that makes the reader want to read more, under 300 characters (string)
- tags: Array of 10-15 SEO tags — mix of specific topic keywords, industry terms, trend keywords, and broad AI terms like "AI 2025", "future of AI", "AI trends" (array of strings)
- content: Full article in HTML format, minimum 1000 words. Use <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>, <blockquote> tags. Style: conversational, engaging, journalistic. Include real-world examples, current context, impact on people and industries, expert perspectives, and a forward-looking conclusion. Do NOT include <html>, <head>, <body>, or <img> tags.

Rules: Return raw JSON only. No code fences. No markdown wrapper.`;

  const raw    = await callAI(prompt);
  const parsed = extractJSON(raw);

  if (!parsed.title || !parsed.slug || !parsed.content || !parsed.excerpt) {
    throw new Error(`Incomplete article fields: ${JSON.stringify(Object.keys(parsed))}`);
  }
  if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) parsed.tags = [];

  return parsed;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj  = new URL(url);
    const req = http.request({
      method: 'POST', hostname: urlObj.hostname, port: urlObj.port, path: urlObj.pathname,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function fetchExistingTitles() {
  const titles = new Set();
  let page = 1;
  while (true) {
    const res   = await httpGet(`${API_BASE}/blogs?limit=100&page=${page}`);
    const blogs = res.data?.data ?? [];
    if (blogs.length === 0) break;
    blogs.forEach(b => titles.add(b.title.toLowerCase().trim()));
    if (blogs.length < 100) break;
    page++;
  }
  return titles;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('=== Trending article generation started ===');

  if (!PROVIDER.apiKey()) {
    log('ERROR: GROQ_API_KEY is not set');
    process.exit(1);
  }

  const existingTitles = await fetchExistingTitles();
  log(`Existing articles: ${existingTitles.size}`);

  let published = 0;
  const catSlugs = Object.keys(CATEGORIES);

  for (let i = 0; i < catSlugs.length; i++) {
    if (i > 0) { log('Waiting 40s for Groq TPM limit...'); await sleep(40000); }

    const catSlug  = catSlugs[i];
    const category = CATEGORIES[catSlug];
    log(`\n── Category: ${category.name} ──`);

    const unused = TOPICS[catSlug].filter(t => !existingTitles.has(t.toLowerCase().trim()));
    if (unused.length === 0) {
      log(`⚠ All trending topics exhausted for ${category.name}, skipping.`);
      continue;
    }

    const topic = pick(unused);
    log(`Topic: "${topic}"`);

    let article;
    try {
      article = await generateArticle(topic);
      log(`Generated: "${article.title}"`);
    } catch (err) {
      log(`ERROR generating article: ${err.message}`);
      continue;
    }

    if (existingTitles.has(article.title.toLowerCase().trim())) {
      log('Duplicate title detected, skipping.');
      continue;
    }

    article.content = article.content
      .replaceAll(/!\[.*?\]\(.*?\)/g, '')
      .replaceAll(/<img[^>]*>/gi, '');

    const slug = `${slugify(article.title)}-${Date.now()}`;
    let imageUrl = '';
    try {
      imageUrl = saveImage(slug, article.title, category);
      log(`Image saved: ${imageUrl}`);
    } catch (err) {
      log(`Warning: image save failed (${err.message}), continuing.`);
    }

    const words    = article.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
    const readTime = Math.max(3, Math.round(words / 200));

    const payload = {
      title:          article.title,
      slug,
      excerpt:        article.excerpt,
      content:        article.content,
      thumbnail:      imageUrl,
      featured_image: imageUrl,
      category:       { id: category.id, name: category.name, slug: category.slug, color: category.color },
      tags:           [...new Set([...category.baseTags, ...article.tags])],
      published_at:   new Date().toISOString(),
      read_time:      readTime,
      featured:       false,
      trending:       true,
      rating:         0,
      review_count:   0,
    };

    try {
      const res = await httpPost(`${API_BASE}/blogs`, payload);
      if (res.status !== 201) {
        log(`Save failed (HTTP ${res.status}): ${JSON.stringify(res.body)}`);
        continue;
      }
      existingTitles.add(article.title.toLowerCase().trim());
      log(`✓ Published! ID: ${res.body.data?.id} | Read time: ${readTime} min`);
      published++;
    } catch (err) {
      log(`ERROR saving article: ${err.message}`);
    }
  }

  log(`\n=== Done — ${published} trending article(s) published ===`);
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
