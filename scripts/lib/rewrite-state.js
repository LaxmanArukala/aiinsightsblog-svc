'use strict';

/**
 * State for the "rewrite every existing article through the quality gate" pass.
 *
 * Queue membership is decided by explicit columns, not by timestamps:
 *   pending  = published, rewritten = false, no revision waiting, never reviewed
 * A rewrite is stored as a `revision` beside the live article, so the article leaves
 * the queue the moment one is submitted, and `rewrite_reviewed_at` keeps it out once
 * you approve or reject. (An earlier version compared updated_at against a start date,
 * which misread ~200 articles that an unrelated 2026-06 script had touched.)
 *
 * The pass is rate-limited to REWRITE_PER_DAY articles across all cron runs, because
 * every rewrite has to be reviewed by hand.
 *
 * While anything is still pending, both cron scripts skip new-article generation.
 * daily-article.js writes the status file; trending-article.js reads it.
 */

const fs   = require('node:fs');
const path = require('node:path');

const DATA_DIR    = path.join(__dirname, '..', 'data');
const STATE_FILE  = path.join(DATA_DIR, 'rewrite-state.json');
const STATUS_FILE = path.join(DATA_DIR, 'rewrite-status.json');

const REWRITE_PER_DAY = Number(process.env.REWRITE_PER_DAY) || 6;
const MAX_FAILURES    = Number(process.env.REWRITE_MAX_FAILURES) || 3;

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const readState  = () => readJson(STATE_FILE, {});
const writeState = (state) => writeJson(STATE_FILE, state);

const readFailures  = () => readState().failures ?? {};
const writeFailures = (failures) => writeState({ ...readState(), failures });

const today = () => new Date().toISOString().slice(0, 10);

/** How many more articles may be rewritten today (UTC day). */
function remainingToday() {
  const { quotaDate, quotaUsed = 0 } = readState();
  const used = quotaDate === today() ? quotaUsed : 0;
  return Math.max(0, REWRITE_PER_DAY - used);
}

/** Record `n` rewrites submitted today against the daily quota. */
function consumeQuota(n) {
  if (n <= 0) return;
  const state = readState();
  const used  = state.quotaDate === today() ? (state.quotaUsed ?? 0) : 0;
  writeState({ ...state, quotaDate: today(), quotaUsed: used + n });
}

/** Articles still needing a rewrite, most-viewed first. */
function pendingRewrites(articles, failures) {
  return articles
    .filter(a =>
      a.status === 'published' &&
      !a.rewritten &&
      !a.revision &&
      !a.rewrite_reviewed_at &&
      (failures[a.id] ?? 0) < MAX_FAILURES)
    .sort((a, b) => (b.views - a.views) || (new Date(a.published_at) - new Date(b.published_at)));
}

function writeStatus(active, pending) {
  writeJson(STATUS_FILE, { rewriteActive: active, pending, updatedAt: new Date().toISOString() });
}

/** True while articles are still waiting to be rewritten (new articles must wait). */
function rewriteInProgress() {
  return readJson(STATUS_FILE, { rewriteActive: false }).rewriteActive === true;
}

module.exports = {
  REWRITE_PER_DAY, MAX_FAILURES,
  readFailures, writeFailures, pendingRewrites, writeStatus, rewriteInProgress,
  remainingToday, consumeQuota,
};
