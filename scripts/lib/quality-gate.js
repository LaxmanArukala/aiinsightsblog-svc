'use strict';
/**
 * Quality gate for AI-generated articles.
 *
 * Scores a candidate article on five metrics (0-100) and only lets it through
 * when EVERY one is >= MIN_SCORE (default 85):
 *
 *   overall      structure, readability, depth, hygiene
 *   seo          on-page checklist (title, excerpt, keyword placement/density,
 *                headings, FAQ, length, links, tags)
 *   originality  100 - % of the article's 6-word phrases already present in the
 *                site's existing articles (also rejects near-duplicate titles and
 *                overused title openers). Site-internal only: it does NOT search the
 *                open web, so it is not a substitute for Copyscape-style checks.
 *   tone         100 - "AI-sounding" penalty (cliches, uniform sentence rhythm,
 *                em-dash overuse, repeated sentence openers). Higher = more natural.
 *   activeVoice  100 - % of sentences containing a passive construction
 *
 * These are deterministic heuristics, not the scores of any third-party tool
 * (Surfer, Grammarly, Originality.ai, ...). They exist to steer the model and to
 * keep obviously weak articles from being published.
 */

const https = require('node:https');
const http  = require('node:http');

const MIN_SCORE = Number(process.env.QUALITY_MIN_SCORE) || 85;

const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'on', 'for', 'to', 'with', 'from', 'by', 'at', 'is', 'are',
  'how', 'what', 'why', 'vs', 'versus', 'using', 'your', 'you', 'that', 'this', 'it', 'its', 'as', 'or']);

// ── text helpers ──────────────────────────────────────────────────────────────
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function stripCode(html) {
  return html.replace(/<pre[\s\S]*?<\/pre>/gi, ' ').replace(/<code[\s\S]*?<\/code>/gi, ' ');
}

function plainText(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** Prose sentences only: no headings, code, or fragments under 4 words. */
function proseSentences(html) {
  const body = stripCode(html).replace(/<h[1-6][\s\S]*?<\/h[1-6]>/gi, ' ');
  const chunks = decode(body.replace(/<\/(p|li|blockquote|td)>/gi, '\n').replace(/<[^>]+>/g, ' ')).split('\n');
  const out = [];
  for (const chunk of chunks) {
    for (const s of chunk.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)) {
      const t = s.replace(/\s+/g, ' ').trim();
      if (t.split(' ').length >= 4) out.push(t);
    }
  }
  return out;
}

const words = (t) => t.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const pct = (n) => Math.round(n);

function syllables(w) {
  const m = w.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
}

function fnv(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function shingles(text, n = 6) {
  const w = words(text);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(fnv(w.slice(i, i + n).join(' ')));
  return out;
}

// ── primary keyword ───────────────────────────────────────────────────────────
function primaryKeyword(topic) {
  const head = topic.split(/[:—–]| - /)[0].trim();
  const sig = words(head).filter(w => !STOP.has(w));
  return sig.slice(0, 5);
}

const coverage = (tokens, text) => {
  if (!tokens.length) return 1;
  const set = new Set(words(text).map(w => w.replace(/(ing|ed|es|s)$/, '')));
  return tokens.filter(t => set.has(t.replace(/(ing|ed|es|s)$/, ''))).length / tokens.length;
};

// ── individual metrics ────────────────────────────────────────────────────────
const PASSIVE = new RegExp(
  String.raw`\b(?:is|are|was|were|be|been|being|gets?|got)\s+(?:(?:also|often|typically|usually|then|not|never|always|still|already|widely|commonly|easily|automatically|frequently|simply|really)\s+)?` +
  String.raw`(?:[a-z]{3,}ed|built|made|done|run|seen|known|given|shown|written|taken|found|chosen|held|kept|led|paid|sent|told|driven|trained|fed|hidden|broken|drawn|grown|thrown|stored)\b`, 'i');
// -ed words that are adjectives / not passives
const NOT_PASSIVE = /\b(?:is|are|was|were|be)\s+(?:need|indeed|red|hundred|speed|seed|feed|bed|exceed|proceed|succeed|embed|shed|sacred|naked|wicked|kindred|supposed to|used to|excited|interested|concerned|worried|limited|advanced|complicated|sophisticated|dedicated|experienced|balanced|skilled|talented|unbiased|biased|detailed|structured|unstructured|labeled|unlabeled|supervised|unsupervised|distributed|connected|integrated|optimized|customized|specialized|personalized|automated|advanced|related|based|aligned|scaled|sized|shaped|typed|named|packed|licensed|priced|paced|sourced|closed|opened|ordered|unordered|crowded|embedded)\b/i;

function scoreActiveVoice(html) {
  const sentences = proseSentences(html);
  if (!sentences.length) return { score: 0, passivePct: 100, samples: [] };
  const passive = sentences.filter(s => PASSIVE.test(s) && !NOT_PASSIVE.test(s));
  const passivePct = (passive.length / sentences.length) * 100;
  return { score: pct(clamp(100 - passivePct)), passivePct: +passivePct.toFixed(1), samples: passive.slice(0, 8) };
}

const CLICHES = [
  /\bin today'?s (?:fast-paced|digital|rapidly|world|landscape|era|age)/i, /\bdelv(?:e|es|ing)\b/i, /\bdive (?:in|into|deep)/i,
  /\bunlock(?:s|ing)?\b/i, /\bunleash(?:es|ing)?\b/i, /\brevolutioni[sz](?:e|es|ing|ed)\b/i, /\bgame[- ]chang(?:er|ing)\b/i,
  /\b(?:ever[- ]evolving|rapidly evolving|ever-changing)\b/i, /\btapestry\b/i, /\blandscape of\b/i, /\bin the realm of\b/i,
  /\bit'?s (?:important|worth|crucial|essential) to (?:note|mention|remember)\b/i, /\bin conclusion\b/i,
  /\b(?:furthermore|moreover|additionally)\b/i, /\bseamless(?:ly)?\b/i, /\bcutting[- ]edge\b/i, /\bharness(?:es|ing)? the power\b/i,
  /\btestament to\b/i, /\belevate\b/i, /\bembark(?:s|ing)?\b/i, /\bparadigm shift\b/i, /\bbuckle up\b/i, /\blook no further\b/i,
  /\bwhether you'?re a\b/i, /\bat the end of the day\b/i, /\bgame plan\b/i, /\bnavigat(?:e|es|ing) the (?:complex|world|landscape)/i,
  /\bpowerhouse\b/i, /\bgroundbreaking\b/i, /\btransformative\b/i, /\bunprecedented\b/i, /\bthe future is (?:here|now|bright)\b/i,
  /\bwelcome to the (?:world|future)\b/i, /\bimagine (?:a world|if)\b/i, /\bstate-of-the-art\b/i, /\bsupercharg/i,
];

function scoreTone(html) {
  const text = plainText(stripCode(html));
  const w = words(text).length || 1;
  const hits = [];
  for (const re of CLICHES) { const m = text.match(new RegExp(re.source, 'gi')); if (m) hits.push(...m.map(x => x.toLowerCase())); }
  const perK = (hits.length / w) * 1000;

  const sents = proseSentences(html);
  const lens = sents.map(s => s.split(' ').length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const cv = mean ? sd / mean : 0;

  const dashes = (text.match(/—|–| -- /g) ?? []).length;
  const dashPerK = (dashes / w) * 1000;

  const starts = {};
  for (const s of sents) { const k = words(s).slice(0, 2).join(' '); if (k) starts[k] = (starts[k] ?? 0) + 1; }
  const topStart = Math.max(0, ...Object.values(starts)) / (sents.length || 1);

  const penalty =
    Math.min(70, perK * 12) +
    (cv < 0.4 ? Math.min(15, (0.4 - cv) * 50) : 0) +
    Math.min(15, Math.max(0, dashPerK - 2) * 3) +
    (topStart > 0.08 ? Math.min(10, (topStart - 0.08) * 100) : 0);

  return { score: pct(clamp(100 - penalty)), aiTone: pct(clamp(penalty)), cliches: [...new Set(hits)].slice(0, 12),
    clichesPerK: +perK.toFixed(1), sentenceVariation: +cv.toFixed(2), dashesPerK: +dashPerK.toFixed(1) };
}

function scoreSeo(a, topic) {
  const html = a.content;
  const text = plainText(html);
  const w = words(text);
  const wc = w.length;
  const kw = primaryKeyword(topic);
  const first100 = w.slice(0, 100).join(' ');
  const issues = [];
  let pts = 0;
  const add = (ok, weight, msg, partial) => {
    const earned = ok ? weight : Math.max(0, Math.min(weight, partial ?? 0));
    pts += earned;
    if (earned < weight) issues.push(msg);
  };

  add(coverage(kw, a.title) >= 0.6, 10, `Title must contain the primary keyword "${kw.join(' ')}".`);
  const metaTitle = a.meta_title || a.title;
  add(metaTitle.length >= 30 && metaTitle.length <= 60, 6, `Title/meta title must be 30-60 characters (now ${metaTitle.length}).`);
  const exLen = (a.excerpt ?? '').length;
  add(exLen >= 120 && exLen <= 160, 10, `Excerpt must be 120-160 characters (now ${exLen}).`, exLen >= 90 && exLen <= 200 ? 5 : 0);
  add(coverage(kw, a.excerpt ?? '') >= 0.6, 4, 'Excerpt must contain the primary keyword.');
  add(coverage(kw, first100) >= 0.6, 10, 'Use the primary keyword within the first 100 words.');

  // Density of the strongest of the first three keyword tokens (a topic like "From Chatbots to AI Employees"
  // never appears as one exact phrase, so an adjacent-pair match would read 0%).
  const GENERIC = new Set(['ai', 'guide', 'introduction', 'explained', 'complete', 'best', 'new', 'future']);
  const cand = kw.filter(t => !GENERIC.has(t)).slice(0, 3);
  const stem = (t) => t.replace(/(ing|ed|es|s)$/, '');
  const stemmed = w.map(stem);
  const dens = cand.map(t => (stemmed.filter(x => x === stem(t)).length / (wc || 1)) * 100);
  const density = dens.find(d => d >= 0.4 && d <= 2) ?? Math.max(0, ...dens);
  add(density >= 0.4 && density <= 2, 10, `Keyword density must be 0.4-2% (now ${density.toFixed(2)}%).`, density > 0.15 && density < 3 ? 5 : 0);

  const h2 = (html.match(/<h2[\s>]/gi) ?? []).length;
  const needH2 = Math.max(4, Math.floor(wc / 300));
  add(h2 >= needH2, 10, `Add an <h2> at least every 300 words (need ${needH2}, have ${h2}).`, (h2 / needH2) * 10);

  const faqIdx = html.search(/<h2[^>]*>\s*Frequently Asked Questions/i);
  const faqH3 = faqIdx >= 0 ? (html.slice(faqIdx).match(/<h3[\s>]/gi) ?? []).length : 0;
  add(faqH3 >= 3, 8, 'End with <h2>Frequently Asked Questions</h2> containing at least 3 <h3> questions.', faqIdx >= 0 ? 4 : 0);

  add(wc >= 1500, 10, `Article needs at least 1500 words (now ${wc}).`, (wc / 1500) * 10);
  add(/<a\s[^>]*href="https?:\/\//i.test(html), 5, 'Cite at least one real external source as an <a href="https://..."> link.');
  add((a.tags ?? []).length >= 8, 4, 'Provide at least 8 tags.');
  add((html.match(/<h1[\s>]/gi) ?? []).length <= 1, 4, 'Use at most one <h1>.');
  const paras = (html.match(/<p[\s>][\s\S]*?<\/p>/gi) ?? []).map(p => words(plainText(p)).length);
  const avgPara = paras.reduce((x, y) => x + y, 0) / (paras.length || 1);
  add(avgPara > 0 && avgPara <= 100, 4, `Keep paragraphs short (avg ${Math.round(avgPara)} words).`);
  add(/<(ul|ol)[\s>]/i.test(html), 5, 'Include at least one bulleted or numbered list.');

  return { score: pct(clamp(pts)), issues, wordCount: wc, keyword: kw.join(' '), densityPct: +density.toFixed(2) };
}

function scoreOverall(a) {
  const html = a.content;
  const text = plainText(html);
  const w = words(text);
  const wc = w.length;
  const sents = proseSentences(html);
  const lens = sents.map(s => s.split(' ').length);
  const avgLen = lens.reduce((x, y) => x + y, 0) / (lens.length || 1);
  const syl = w.reduce((n, x) => n + syllables(x), 0);
  const flesch = 206.835 - 1.015 * avgLen - 84.6 * (syl / (wc || 1));

  const issues = [];
  let earned = 0, max = 0;
  const add = (weight, frac, msg) => {
    max += weight; earned += weight * clamp(frac, 0, 1);
    if (frac < 0.999 && msg) issues.push(msg);
  };
  const count = (re) => (html.match(re) ?? []).length;

  add(15, count(/<h2[\s>]/gi) / 5, 'Use at least 5 <h2> sections.');
  add(5, count(/<h3[\s>]/gi) / 3, 'Use at least 3 <h3> subsections.');
  add(10, count(/<(ul|ol)[\s>]/gi) / 2, 'Include at least 2 lists.');
  add(5, count(/<(blockquote|pre|table)[\s>]/gi) ? 1 : 0, 'Include a concrete example (code block, quote, or table).');
  add(15, avgLen <= 22 ? (avgLen >= 10 ? 1 : avgLen / 10) : 1 - (avgLen - 22) / 10, `Average sentence length ${avgLen.toFixed(0)} words; aim for 12-20.`);
  add(10, (flesch - 25) / 20, `Readability too low (Flesch ${flesch.toFixed(0)}); use plainer words and shorter sentences.`);
  add(15, wc / 1500, `Needs at least 1500 words (now ${wc}).`);
  add(10, (text.match(/\b\d[\d,.%]*\b/g) ?? []).length / 10, 'Add concrete numbers, dates, benchmarks or versions.');
  const names = new Set((text.match(/(?<=[a-z,] )[A-Z][A-Za-z0-9]+(?: [A-Z][A-Za-z0-9]+)*/g) ?? []));
  add(10, names.size / 8, 'Name specific tools, companies, models or papers.');
  const dup = sents.length - new Set(sents.map(s => s.toLowerCase())).size;
  add(5, dup === 0 ? 1 : 0, 'Remove repeated sentences.');
  add(5, /(^|\n)\s*#{1,6}\s|\*\*[^*]+\*\*/.test(html.replace(/<[^>]+>/g, '\n')) ? 0 : 1, 'Remove leftover Markdown syntax.');
  add(5, /lorem ipsum|\bTODO\b|\[(?:insert|link|source)[^\]]*\]|\.\.\.\]/i.test(text) ? 0 : 1, 'Remove placeholders.');

  return { score: pct((earned / max) * 100), issues, flesch: Math.round(flesch), avgSentenceLength: +avgLen.toFixed(1) };
}

// ── originality (site-internal) ───────────────────────────────────────────────
/** Build once per run from every existing article: [{ title, content }] */
function buildCorpus(existing) {
  const set = new Set();
  const titles = existing.map(e => ({ title: e.title, tokens: new Set(words(e.title).filter(x => !STOP.has(x))) }));
  for (const e of existing) for (const h of shingles(plainText(e.content ?? ''))) set.add(h);
  const prefixCount = {};
  for (const e of existing) {
    const k = words(e.title).slice(0, 3).join(' ');
    prefixCount[k] = (prefixCount[k] ?? 0) + 1;
  }
  return { set, titles, prefixCount };
}

/** Fold a newly published/rewritten article into an existing corpus. */
function addToCorpus(corpus, article) {
  for (const h of shingles(plainText(article.content ?? ''))) corpus.set.add(h);
  corpus.titles.push({ title: article.title, tokens: new Set(words(article.title).filter(x => !STOP.has(x))) });
  const k = words(article.title).slice(0, 3).join(' ');
  corpus.prefixCount[k] = (corpus.prefixCount[k] ?? 0) + 1;
}

function scoreOriginality(a, corpus) {
  const issues = [];
  const mine = shingles(plainText(a.content));
  let shared = 0;
  for (const h of mine) if (corpus.set.has(h)) shared++;
  const overlapPct = mine.size ? (shared / mine.size) * 100 : 0;
  let score = 100 - overlapPct * 2; // 7.5% overlap already costs 15 points

  const tk = new Set(words(a.title).filter(x => !STOP.has(x)));
  let nearest = null, best = 0;
  for (const t of corpus.titles) {
    const inter = [...tk].filter(x => t.tokens.has(x)).length;
    const j = inter / (tk.size + t.tokens.size - inter || 1);
    if (j > best) { best = j; nearest = t.title; }
  }
  if (best >= 0.6) { score = Math.min(score, 60); issues.push(`Title is a near-duplicate of "${nearest}". Pick a clearly different angle.`); }

  const prefix = words(a.title).slice(0, 3).join(' ');
  if ((corpus.prefixCount[prefix] ?? 0) >= 5) {
    score = Math.min(score, 70);
    issues.push(`Title opener "${prefix}..." is already used by ${corpus.prefixCount[prefix]} articles. Use a different, specific title.`);
  }
  if (overlapPct > 7) issues.push(`${overlapPct.toFixed(1)}% of phrases already appear in existing articles. Rewrite with new examples, structure and wording.`);

  return { score: pct(clamp(score)), overlapPct: +overlapPct.toFixed(1), nearestTitle: best >= 0.4 ? nearest : null, issues };
}

// ── public API ────────────────────────────────────────────────────────────────
function evaluate(article, topic, corpus) {
  const seo = scoreSeo(article, topic);
  const overall = scoreOverall(article);
  const tone = scoreTone(article.content);
  const voice = scoreActiveVoice(article.content);
  const originality = scoreOriginality(article, corpus);
  const scores = { overall: overall.score, seo: seo.score, originality: originality.score, tone: tone.score, activeVoice: voice.score };
  const failing = Object.entries(scores).filter(([, v]) => v < MIN_SCORE).map(([k]) => k);
  return { scores, pass: failing.length === 0, failing, detail: { seo, overall, tone, voice, originality } };
}

/** Turns a failed evaluation into concrete instructions for the next generation attempt. */
function feedback(result) {
  const { detail: d, failing } = result;
  const lines = [];
  if (failing.includes('seo')) lines.push(...d.seo.issues);
  if (failing.includes('overall')) lines.push(...d.overall.issues);
  if (failing.includes('originality')) lines.push(...d.originality.issues);
  if (failing.includes('tone')) {
    if (d.tone.cliches.length) lines.push(`Never use these AI-sounding phrases: ${d.tone.cliches.join(', ')}.`);
    if (d.tone.sentenceVariation < 0.4) lines.push('Vary sentence length a lot: mix very short sentences (3-6 words) with longer ones.');
    if (d.tone.dashesPerK > 2) lines.push('Do not use em dashes; use commas or full stops.');
    lines.push('Write like a practitioner: plain words, concrete specifics, no hype or filler transitions.');
  }
  if (failing.includes('activeVoice')) {
    lines.push(`${d.voice.passivePct}% of sentences are passive. Rewrite every passive sentence in the active voice (subject does the action). Examples of passive sentences to avoid:`);
    for (const s of d.voice.samples.slice(0, 5)) lines.push(`  - ${s.slice(0, 140)}`);
  }
  return [...new Set(lines)];
}

const fmt = (r) => Object.entries(r.scores).map(([k, v]) => `${k}=${v}`).join(' ');

/** Prompt rules that make first-pass articles more likely to clear the gate. */
const QUALITY_RULES = `
QUALITY BAR (every article is auto-scored; anything under ${MIN_SCORE}/100 on any metric is rejected and rewritten):
- ACTIVE VOICE ONLY: write "The model reads the prompt", never "The prompt is read by the model". Avoid "is/are/was/were/been + past participle" everywhere.
- HUMAN TONE: plain words, concrete specifics (numbers, versions, tool and company names), varied sentence length with some very short sentences. No hype or filler.
- BANNED PHRASES: delve, dive into, unlock, unleash, revolutionize, game-changer, cutting-edge, seamless, landscape, realm, tapestry, "in today's", "it's important to note", "in conclusion", furthermore, moreover, harness the power, embark, elevate, transformative, groundbreaking, paradigm shift. Do not use em dashes.
- ORIGINAL: give a specific angle, fresh examples and your own structure. The title must not start with a formula such as "Unlocking the Power of" or "The AI Revolution".
- SEO: primary keyword in title, in the first 100 words, and in the meta description; title 30-60 characters; excerpt 140-160 characters; one <h2> at least every 300 words; at least 1500 words; a final "Frequently Asked Questions" <h2> with 3-5 <h3> questions; at least one bulleted list and one external source link. Link ONLY to the homepage of an official site (e.g. https://openai.com, https://arxiv.org, https://github.com/langchain-ai/langchain) or a Wikipedia article you are certain exists. Never deep-link to blog posts, news stories or papers, because invented URLs are removed automatically.`;

// ── link verification ─────────────────────────────────────────────────────────
function headOk(url, redirects = 3) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(url); } catch { return resolve(false); }
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(u, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; aiinsightsblog-bot/1.0)' }, timeout: 8000 }, (res) => {
      res.resume();
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
        return resolve(headOk(new URL(res.headers.location, u).toString(), redirects - 1));
      }
      // 401/403/405/429/999 mean the page exists but blocks bots; only 404/410/5xx/DNS failures are broken.
      resolve(res.statusCode < 400 || [401, 403, 405, 429, 999].includes(res.statusCode));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

/** Models invent URLs. Drop any <a> whose target does not respond, keeping its text. */
async function stripBrokenLinks(html) {
  const urls = [...new Set([...html.matchAll(/<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>/gi)].map(m => m[1]))];
  let out = html;
  const removed = [];
  for (const url of urls) {
    if (await headOk(url)) continue;
    removed.push(url);
    const esc = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`<a\\s[^>]*href="${esc}"[^>]*>([\\s\\S]*?)</a>`, 'gi'), '$1');
  }
  return { html: out, removed };
}

/**
 * Generates, scores and (if needed) regenerates until every metric clears MIN_SCORE.
 * `generate(feedbackLines)` must return an article { title, excerpt, content, tags, ... }.
 * Returns { article, result } on success, or null if no attempt passed (nothing should be published).
 * Attempts are fresh generations carrying the previous failures as instructions; resending the
 * full previous article would blow the Groq free-tier TPM cap.
 */
async function generateUntilPasses({ generate, topic, corpus, log, sleep, delayMs = 0, maxAttempts = Number(process.env.QUALITY_MAX_ATTEMPTS) || 3 }) {
  let notes = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const article = await generate(notes);
    article.content = article.content.replaceAll(/!\[.*?\]\(.*?\)/g, '').replaceAll(/<img[^>]*>/gi, '');
    const { html, removed } = await stripBrokenLinks(article.content);
    article.content = html;
    if (removed.length) log(`  removed ${removed.length} unreachable link(s)`);

    const result = evaluate(article, topic, corpus);
    log(`  attempt ${attempt}/${maxAttempts}: ${fmt(result)} (need >= ${MIN_SCORE} on all)`);
    if (result.pass) return { article, result };

    // Cumulative: a fix for one metric must not be forgotten when the next attempt fixes another.
    notes = [...new Set([...notes, ...feedback(result)])];
    log(`  failing: ${result.failing.join(', ')}`);
    for (const n of feedback(result).slice(0, 6)) log(`    - ${n.slice(0, 160)}`);
    if (attempt < maxAttempts) await sleep(delayMs);
  }
  return null;
}

module.exports = { generateUntilPasses, MIN_SCORE, QUALITY_RULES, buildCorpus, addToCorpus, evaluate, feedback, fmt, stripBrokenLinks, primaryKeyword };
