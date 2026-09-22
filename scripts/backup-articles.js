#!/usr/bin/env node
/**
 * Full article backup → JSON.
 *
 * Dumps every blog row (including pending_review and rejected) to a timestamped
 * file under backups/. Run before anything that rewrites or deletes content.
 *
 *   node scripts/backup-articles.js                 # → backups/articles-<ISO>.json
 *   API_BASE=https://api.aiinsightsblogs.com/api/v1 node scripts/backup-articles.js
 */

'use strict';

const fs    = require('node:fs');
const path  = require('node:path');
const http  = require('node:http');
const https = require('node:https');

const API_BASE   = process.env.API_BASE || 'http://localhost:8000/api/v1';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const PAGE_SIZE  = 100;

function log(msg) { process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`); }

function httpGet(url) {
  const client = url.startsWith('https:') ? https : http;
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`Bad JSON from ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

/**
 * One full sweep of the list endpoint, merged into `byId`.
 *
 * GET /blogs orders by published_at with no tiebreaker, so rows with equal
 * timestamps can swap between pages: a single sweep may repeat one row and miss
 * another. Sweeping again under a different sort shakes out a different ordering,
 * so repeated passes converge on the full set.
 */
async function sweep(sort, byId) {
  let page = 1;
  let total = null;
  while (true) {
    const res   = await httpGet(`${API_BASE}/blogs?limit=${PAGE_SIZE}&page=${page}&status=all&sort=${sort}`);
    const blogs = res.data?.data ?? [];
    total ??= res.data?.meta?.total ?? null;
    if (blogs.length === 0) break;
    for (const b of blogs) byId.set(b.id, b);
    if (blogs.length < PAGE_SIZE) break;
    page++;
  }
  return total;
}

async function main() {
  log(`Backing up from ${API_BASE}`);

  const byId = new Map();
  let total = null;

  for (const sort of ['oldest', 'latest', 'most_viewed', 'top_rated', 'trending', 'most_liked']) {
    total = (await sweep(sort, byId)) ?? total;
    log(`  after "${sort}" sweep: ${byId.size}${total ? `/${total}` : ''} unique`);
    if (total !== null && byId.size >= total) break;
  }

  const all = [...byId.values()];

  // A short count means pagination dropped rows; a partial file must not look complete.
  if (total !== null && all.length < total) {
    throw new Error(`Incomplete backup: got ${all.length} of ${total} articles after all sweeps. Nothing written.`);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  const file  = path.join(BACKUP_DIR, `articles-${stamp}.json`);

  const payload = {
    exported_at: new Date().toISOString(),
    source:      API_BASE,
    count:       all.length,
    articles:    all,
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));

  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(1);
  log(`✓ ${all.length} article(s) → ${file} (${mb} MB)`);
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
