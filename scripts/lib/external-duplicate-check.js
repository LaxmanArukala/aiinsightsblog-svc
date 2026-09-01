'use strict';
/**
 * Checks whether a candidate article topic has already been covered by
 * major AI news RSS feeds or public social discussion (Hacker News, Reddit)
 * before we spend a generation call on it.
 *
 * No API keys required — RSS feeds and the HN Algolia / Reddit public JSON
 * endpoints are all unauthenticated. Twitter/X and LinkedIn are not checked
 * here since their APIs require paid/authenticated access this project
 * doesn't have configured.
 */

const https = require('node:https');

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://venturebeat.com/category/ai/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://www.technologyreview.com/feed/',
  'https://www.wired.com/feed/tag/ai/latest/rss',
  'https://arstechnica.com/ai/feed/',
];

function httpsGetText(url, timeoutMs = 8000, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; aiinsightsblog-bot/1.0)' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        httpsGetText(res.headers.location, timeoutMs, redirectsLeft - 1).then(resolve, reject);
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('request timeout')));
  });
}

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function extractFeedTitles(xml) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  const titles = [];
  for (const block of blocks) {
    const m = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    if (m) titles.push(decodeEntities(m[1].trim()));
  }
  return titles;
}

// Fetch once per script run and reuse across every topic/category check.
async function fetchAllRSSTitles() {
  const results = await Promise.all(RSS_FEEDS.map(async (url) => {
    try {
      const xml = await httpsGetText(url);
      return extractFeedTitles(xml);
    } catch {
      return [];
    }
  }));
  return results.flat();
}

async function fetchHNTitles(query) {
  try {
    const since = Math.floor(Date.now() / 1000) - 60 * 24 * 3600; // last 60 days
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i%3E${since}&query=${encodeURIComponent(query)}`;
    const raw = await httpsGetText(url, 6000);
    const parsed = JSON.parse(raw);
    return (parsed.hits || []).map((h) => h.title).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchRedditTitles(query) {
  try {
    const url = `https://www.reddit.com/r/artificial+MachineLearning+singularity/search.json?q=${encodeURIComponent(query)}&sort=new&restrict_sr=1&limit=15&t=month`;
    const raw = await httpsGetText(url, 6000);
    const parsed = JSON.parse(raw);
    return (parsed.data?.children || []).map((c) => c.data?.title).filter(Boolean);
  } catch {
    return [];
  }
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'is', 'are',
  'how', 'what', 'why', 'with', 'your', 'you', 'it', 'this', 'that', 'from',
  'as', 'at', 'by', 'be', 'can', 'vs', '2025', '2026',
]);

function significantWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function overlapScore(a, b) {
  const wa = new Set(significantWords(a));
  const wb = new Set(significantWords(b));
  if (wa.size === 0 || wb.size === 0) return 0;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.min(wa.size, wb.size);
}

// `rssTitles` should be pre-fetched once per script run (see fetchAllRSSTitles)
// and passed in here so we don't re-hit every RSS feed for every topic.
async function isTopicAlreadyCovered(topic, rssTitles, threshold = 0.6) {
  const keyPhrase = significantWords(topic).slice(0, 5).join(' ') || topic;
  const [hnTitles, redditTitles] = await Promise.all([
    fetchHNTitles(keyPhrase),
    fetchRedditTitles(keyPhrase),
  ]);
  const candidates = [...rssTitles, ...hnTitles, ...redditTitles];
  for (const candidate of candidates) {
    if (overlapScore(topic, candidate) >= threshold) {
      return { covered: true, match: candidate };
    }
  }
  return { covered: false, match: null };
}

module.exports = { fetchAllRSSTitles, isTopicAlreadyCovered };
