'use strict';

/**
 * State for the one-off "rewrite every existing article through the quality gate" pass.
 *
 * An article is pending when it was last updated before REWRITE_START and has no rewrite
 * waiting for approval. A rewrite is stored as a revision next to the live article; approving
 * or rejecting it bumps updated_at, so the article then drops out of the pending list. Only failures need remembering, so an article the gate rejects every time
 * cannot block new-article generation forever.
 *
 * While the pass is running, both cron scripts skip new-article generation.
 * daily-article.js writes the status file; trending-article.js reads it.
 */

const fs   = require('node:fs');
const path = require('node:path');

const DATA_DIR    = path.join(__dirname, '..', 'data');
const STATE_FILE  = path.join(DATA_DIR, 'rewrite-state.json');
const STATUS_FILE = path.join(DATA_DIR, 'rewrite-status.json');

const REWRITE_START     = new Date(process.env.REWRITE_START || '2026-09-22T00:00:00Z');
const REWRITE_PER_RUN   = Number(process.env.REWRITE_PER_RUN) || 8;
const MAX_FAILURES      = Number(process.env.REWRITE_MAX_FAILURES) || 3;

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const readFailures  = () => readJson(STATE_FILE, { failures: {} }).failures ?? {};
const writeFailures = (failures) => writeJson(STATE_FILE, { failures });

/** Articles that still need the rewrite (most-viewed first). One already waiting for approval is not pending. */
function pendingRewrites(articles, failures) {
  return articles
    .filter(a => a.status === 'published' && !a.revision && new Date(a.updated_at) < REWRITE_START && (failures[a.id] ?? 0) < MAX_FAILURES)
    .sort((a, b) => (b.views - a.views) || (new Date(a.published_at) - new Date(b.published_at)));
}

function writeStatus(active, pending) {
  writeJson(STATUS_FILE, { rewriteActive: active, pending, updatedAt: new Date().toISOString() });
}

/** True while the rewrite pass is running (new articles must wait). */
function rewriteInProgress(now = new Date()) {
  if (now < REWRITE_START) return false;
  return readJson(STATUS_FILE, { rewriteActive: false }).rewriteActive === true;
}

module.exports = {
  REWRITE_START, REWRITE_PER_RUN, MAX_FAILURES,
  readFailures, writeFailures, pendingRewrites, writeStatus, rewriteInProgress,
};
