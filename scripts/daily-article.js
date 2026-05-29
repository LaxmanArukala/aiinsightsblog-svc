#!/usr/bin/env node
/**
 * Daily AI article generator — Groq only
 *
 * Runs twice a day (9:00 AM and 9:00 PM).
 * Each run generates 1 article per category (6 total).
 * Creates an SVG thumbnail saved to WEB_PUBLIC_DIR/assets/blog-images/.
 *
 * Cron (server):
 *   0  9 * * * node /home/ec2-user/aiinsightsblog-svc/scripts/daily-article.js
 *   0 21 * * * node /home/ec2-user/aiinsightsblog-svc/scripts/daily-article.js
 */

'use strict';

const https  = require('node:https');
const http   = require('node:http');
const fs     = require('node:fs');
const path   = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_BASE      = 'http://localhost:8000/api/v1';
const WEB_PUBLIC    = process.env.WEB_PUBLIC_DIR || '/home/ec2-user/aiinsightsblogs-web/public';
const IMAGES_DIR    = path.join(WEB_PUBLIC, 'assets', 'blog-images');

// ── Provider config ───────────────────────────────────────────────────────────
const PROVIDER = {
  provider: 'groq',
  model:    'llama-3.3-70b-versatile',
  baseUrl:  'api.groq.com',
  path:     '/openai/v1/chat/completions',
  apiKey:   () => process.env.GROQ_API_KEY,
};

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = {
  'ai-agents': {
    id: 'cat-1', name: 'AI Agents', slug: 'ai-agents', color: '#0ea5e9', dark: '#0369a1',
    baseTags: ['AI Agents', 'Autonomous Agents', 'LLM Agents', 'Multi-Agent Systems', 'Agentic AI',
      'LangChain', 'LangGraph', 'AutoGen', 'CrewAI', 'Tool Calling', 'ReAct Pattern',
      'Artificial Intelligence', 'AI Automation', 'AI Tutorial', 'AI 2025'],
  },
  'llms': {
    id: 'cat-2', name: 'Large Language Models', slug: 'llms', color: '#10b981', dark: '#047857',
    baseTags: ['Large Language Models', 'LLM', 'GPT', 'LLaMA', 'Mistral', 'Claude', 'Gemini',
      'Prompt Engineering', 'Fine-Tuning', 'RAG', 'Retrieval Augmented Generation',
      'Transformer', 'NLP', 'Natural Language Processing', 'Artificial Intelligence', 'AI Tutorial', 'AI 2025'],
  },
  'generative-ai': {
    id: 'cat-3', name: 'Generative AI', slug: 'generative-ai', color: '#f59e0b', dark: '#b45309',
    baseTags: ['Generative AI', 'AI Image Generation', 'Stable Diffusion', 'Diffusion Models',
      'DALL-E', 'Midjourney', 'Text to Image', 'Text to Video', 'AI Art',
      'GANs', 'Foundation Models', 'Artificial Intelligence', 'AI Tutorial', 'AI 2025'],
  },
  'robotics': {
    id: 'cat-4', name: 'Robotics', slug: 'robotics', color: '#ef4444', dark: '#b91c1c',
    baseTags: ['Robotics', 'AI Robotics', 'Robot Learning', 'ROS', 'ROS2', 'Autonomous Robots',
      'Reinforcement Learning', 'Robot Navigation', 'SLAM', 'Humanoid Robots',
      'Industrial Automation', 'Artificial Intelligence', 'AI Tutorial', 'AI 2025'],
  },
  'machine-learning': {
    id: 'cat-5', name: 'Machine Learning', slug: 'machine-learning', color: '#ec4899', dark: '#be185d',
    baseTags: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Python', 'Scikit-learn',
      'TensorFlow', 'PyTorch', 'Data Science', 'Supervised Learning', 'Unsupervised Learning',
      'MLOps', 'Model Training', 'Artificial Intelligence', 'AI Tutorial', 'AI 2025'],
  },
  'computer-vision': {
    id: 'cat-6', name: 'Computer Vision', slug: 'computer-vision', color: '#8b5cf6', dark: '#6d28d9',
    baseTags: ['Computer Vision', 'Image Recognition', 'Object Detection', 'YOLO', 'CNN',
      'Convolutional Neural Networks', 'Image Segmentation', 'OpenCV', 'Vision Transformers',
      'Deep Learning', 'Image Processing', 'Artificial Intelligence', 'AI Tutorial', 'AI 2025'],
  },
};

// ── Topic pools ───────────────────────────────────────────────────────────────
const TOPICS = {
  'ai-agents': [
    'Building Multi-Agent Systems with AutoGen and LangGraph',
    'How AI Agents Use Tool Calling to Interact with the Real World',
    'ReAct Pattern Explained: Reasoning and Acting in LLM Agents',
    'Agentic RAG: Combining Retrieval-Augmented Generation with Autonomous Agents',
    'Memory in AI Agents: Short-Term, Long-Term, and Episodic Memory',
    'Planning Algorithms for AI Agents: From Chain-of-Thought to Tree of Thoughts',
    'Autonomous Code Generation Agents: How GitHub Copilot and Devin Work',
    'Building a Customer Support AI Agent from Scratch',
    'AI Agents in Production: Monitoring, Observability, and Guardrails',
    'CrewAI vs LangGraph: Choosing the Right Multi-Agent Framework',
    'OpenAI Assistants API: Building Stateful AI Agents',
    'Self-Correcting AI Agents: Reflexion and Self-Refine Techniques',
    'Tool-Augmented LLMs: Giving AI Agents the Ability to Browse and Compute',
    'Building a Research Agent That Reads and Summarizes Papers',
    'Hierarchical AI Agents: Orchestrators and Sub-Agents Explained',
    'Event-Driven AI Agents: Reacting to Real-World Triggers',
    'Swarm Intelligence: How Multiple AI Agents Collaborate to Solve Problems',
    'AI Agent Security: Preventing Prompt Injection and Data Leakage',
    'LangChain Agents Deep Dive: Tools, Memory, and Chains',
    'Building a Stock Analysis Agent with Real-Time Data',
  ],
  'llms': [
    'Fine-Tuning LLaMA 3 with LoRA: A Step-by-Step Guide',
    'RAG vs Fine-Tuning: Which Approach Is Right for Your Use Case?',
    'Prompt Engineering Techniques: Zero-Shot, Few-Shot, and Chain-of-Thought',
    'Quantization Explained: Running Large Models on Consumer Hardware',
    'Mixture of Experts (MoE): How Mistral and GPT-4 Scale Efficiently',
    'Understanding Transformer Architecture: Attention Is All You Need',
    'Retrieval-Augmented Generation (RAG): Building Knowledge-Grounded LLMs',
    'Running LLMs Locally with Ollama: Privacy-First AI on Your Machine',
    'Context Window Limits and How to Work Around Them',
    'Building a Document Q&A System with LangChain and OpenAI',
    'Instruction Tuning vs RLHF: How LLMs Learn to Follow Directions',
    'KV Cache Optimization: Speeding Up LLM Inference',
    'Constitutional AI: How Anthropic Trains Claude to Be Helpful and Harmless',
    'Flash Attention Explained: Making Transformers Fast',
    'LLM Benchmarking: MMLU, HumanEval, and What They Actually Measure',
    'Speculative Decoding: Faster LLM Inference Without Quality Loss',
    'Token Embeddings Explained: How LLMs Represent Language',
    'Multi-Modal LLMs: How GPT-4V Understands Images and Text Together',
    'Prompt Caching: Reducing LLM API Costs by 90%',
    'Building a Code Review Bot with GPT-4 and GitHub Actions',
  ],
  'generative-ai': [
    'Diffusion Models Explained: From DDPM to Stable Diffusion',
    'How DALL-E 3 Generates Images from Text Descriptions',
    'ControlNet: Giving Artists Precise Control Over AI Image Generation',
    'Text-to-Video AI: How Sora and Runway Work Under the Hood',
    'Voice Cloning with AI: Technology, Ethics, and Applications',
    'AI Music Generation: How Suno and Udio Create Songs from Prompts',
    'Generative AI for Code: GitHub Copilot, Cursor, and Claude Code',
    '3D Object Generation with AI: NeRF and Gaussian Splatting',
    'GAN vs Diffusion: Why Diffusion Models Won the Image Generation War',
    'Stable Diffusion Fine-Tuning with DreamBooth and Textual Inversion',
    'AI Video Editing: Automated Cuts, Color Grading, and Effects',
    'Synthetic Data Generation: Training AI Without Real-World Data',
    'ComfyUI Workflow Guide: Building Custom Image Generation Pipelines',
    'Inpainting and Outpainting: Editing Images with Generative AI',
    'LoRA for Image Models: Personalizing Stable Diffusion in Minutes',
    'AI Avatar Creation: Building Realistic Digital Humans',
    'Text-to-3D: Generating Game Assets with AI',
    'Generative AI in Fashion: Designing Clothes with Stable Diffusion',
    'AI Lip Sync and Video Dubbing: How D-ID and HeyGen Work',
    'Consistency Models: Faster Image Generation in One Step',
  ],
  'robotics': [
    'ROS 2 Getting Started Guide: Building Your First Robot Application',
    'Boston Dynamics Spot: How the Robot Dog Actually Works',
    'Reinforcement Learning for Robotics: Teaching Robots to Walk',
    'Computer Vision in Robotics: How Robots See and Understand the World',
    'Simultaneous Localization and Mapping (SLAM) Explained',
    'Humanoid Robots 2025: Tesla Optimus, Figure 01, and the Race for AGI',
    'Robot Grasping: How AI Teaches Robots to Pick Up Objects',
    'Swarm Robotics: Coordinating Hundreds of Simple Robots',
    'Drone Navigation Algorithms: Obstacle Avoidance and Path Planning',
    'Soft Robotics: Building Flexible Machines Inspired by Biology',
    'Industrial Robots vs Cobots: Which Is Right for Your Factory?',
    'Robot Operating System (ROS): Architecture and Key Concepts',
    'Tactile Sensors in Robotics: Giving Machines a Sense of Touch',
    'Autonomous Vehicles: How Self-Driving Cars Navigate the World',
    'Inverse Kinematics Explained: Making Robot Arms Move Precisely',
    'Robot Learning from Human Demonstration: Imitation Learning',
    'Exoskeletons and Assistive Robotics: Helping Humans Move',
    'Agricultural Robotics: AI-Powered Farming and Harvesting',
    'Surgical Robots: Da Vinci and the Future of Robotic Surgery',
    'Underwater Robots: Exploring the Ocean with Autonomous Vehicles',
  ],
  'machine-learning': [
    'XGBoost vs LightGBM vs CatBoost: Which Gradient Boosting Framework to Use',
    'Feature Engineering Techniques That Win Kaggle Competitions',
    'Bias-Variance Tradeoff Explained Intuitively',
    'Ensemble Methods: Bagging, Boosting, and Stacking Explained',
    'Time Series Forecasting with LSTM and Transformer Models',
    'Anomaly Detection: Identifying Outliers in Production Data',
    'Federated Learning: Training ML Models Without Centralizing Data',
    'Hyperparameter Tuning with Optuna and Bayesian Optimization',
    'MLOps Best Practices: From Experiment to Production',
    'Interpretable ML: SHAP Values and LIME Explained',
    'Class Imbalance: Techniques to Handle Skewed Datasets',
    'Transfer Learning: Reusing Pre-Trained Models for New Tasks',
    'Online Learning: Updating ML Models in Real Time',
    'Dimensionality Reduction: PCA, t-SNE, and UMAP Compared',
    'Graph Neural Networks: Learning on Connected Data',
    'Causal Inference in ML: Moving Beyond Correlation',
    'AutoML: Automatically Building Machine Learning Pipelines',
    'Model Compression: Making ML Models Smaller and Faster',
    'Semi-Supervised Learning: Getting More from Less Labeled Data',
    'Survival Analysis: Predicting Time-to-Event with ML',
  ],
  'computer-vision': [
    'YOLO v10 Object Detection: Speed and Accuracy Benchmarks',
    'Image Segmentation: Semantic, Instance, and Panoptic Compared',
    'Vision Transformers (ViT): How Attention Replaced CNNs',
    'SAM (Segment Anything Model): Meta AI\'s Universal Image Segmenter',
    'Optical Flow Explained: How AI Understands Motion in Video',
    'Face Recognition: How DeepFace and ArcFace Work',
    'Medical Image Analysis: AI in Radiology and Pathology',
    'Depth Estimation from Single Images: Monocular Depth Networks',
    'Pose Estimation: Detecting Human Body Keypoints with AI',
    'Image Super-Resolution with AI: ESRGAN and Real-ESRGAN',
    'Video Understanding: Action Recognition and Temporal Models',
    'Document AI: OCR, Layout Analysis, and Information Extraction',
    '3D Point Cloud Processing with PointNet and VoxelNet',
    'Lane Detection for Autonomous Vehicles: Algorithms and Models',
    'Thermal Imaging with AI: Applications in Security and Medicine',
    'Defect Detection in Manufacturing with Computer Vision',
    'Satellite Image Analysis: AI for Remote Sensing',
    'Gesture Recognition: Human-Computer Interaction with CV',
    'Scene Understanding: Teaching Machines to Interpret Images Holistically',
    'Image Retrieval: Building Visual Search Engines with Deep Learning',
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


// ── SVG Image Generator ───────────────────────────────────────────────────────
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
  const fontSize = lines.length > 3 ? 42 : lines.length > 2 ? 48 : 54;
  const lineH    = fontSize * 1.3;
  const totalH   = lines.length * lineH;
  const startY   = (630 - totalH) / 2 + fontSize * 0.8;

  const safe    = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const textEls = lines.map((line, i) =>
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
    <filter id="badge-shadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <circle cx="1050" cy="100" r="220" fill="${category.color}" opacity="0.06"/>
  <circle cx="150"  cy="530" r="160" fill="${category.color}" opacity="0.06"/>
  <rect x="56" y="52" rx="24" ry="24" width="${category.name.length * 11 + 40}" height="44" fill="${category.color}" opacity="0.9" filter="url(#badge-shadow)"/>
  <text x="76" y="81" font-family="Arial, sans-serif" font-size="17" font-weight="600" fill="white">${safe(category.name)}</text>
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── AI API caller (OpenAI-compatible) ─────────────────────────────────────────
function callAIOnce(shift, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:       shift.model,
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens:  8000,
    });

    const headers = {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${shift.apiKey()}`,
      'Content-Length': Buffer.byteLength(body),
    };

    if (shift.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://aiinsightsblogs.com';
      headers['X-Title']      = 'AI Insights Blog';
    }

    const req = https.request({
      hostname: shift.baseUrl,
      path:     shift.path || '/v1/chat/completions',
      method:   'POST',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(`${shift.provider} error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          const content = parsed.choices?.[0]?.message?.content ?? '';
          resolve(content);
        } catch (e) {
          reject(new Error(`${shift.provider} parse error: ${e.message} — ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callAI(shift, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await callAIOnce(shift, prompt);
    } catch (error_) {
      const isRateLimit = error_.message.includes('rate') || error_.message.includes('429');
      if (isRateLimit && i < retries - 1) {
        log(`Rate limited by ${shift.provider}, retrying in 25s... (attempt ${i + 1}/${retries})`);
        await sleep(25000);
      } else {
        throw error_;
      }
    }
  }
}

const ESCAPE_MAP = { '\n': String.raw`\n`, '\r': String.raw`\r`, '\t': String.raw`\t` };

function sanitizeJSON(str) {
  let inString = false;
  let escaped  = false;
  return [...str].map(ch => {
    if (escaped)    { escaped = false; return ch; }
    if (ch === '\\') { escaped = true; return ch; }
    if (ch === '"') { inString = !inString; return ch; }
    return (inString && ESCAPE_MAP[ch]) ? ESCAPE_MAP[ch] : ch;
  }).join('');
}

function extractJSON(text) {
  const sources = [text];
  const block = text.match(/```(?:json)?\s*([\s\S]*)```/);
  if (block) sources.push(block[1]);
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) sources.push(text.slice(start, end + 1));

  for (const raw of sources) {
    for (const candidate of [raw, sanitizeJSON(raw)]) {
      try { return JSON.parse(candidate); } catch (error_) { log(`JSON parse attempt failed: ${error_.message}`); }
    }
  }
  throw new Error(`Could not extract JSON from response: ${text.slice(0, 300)}`);
}

async function generateArticle(shift, topic) {
  const prompt = `Generate a complete, high-quality, in-depth blog post about: "${topic}".

Return ONLY a valid JSON object with these exact fields:
- title: An engaging, SEO-friendly blog title (string)
- slug: URL-friendly slug, lowercase, hyphens only, no special chars (string)
- excerpt: Compelling 2-3 sentence summary under 300 characters (string)
- tags: Array of 10-15 SEO-friendly tags (strings). Include: main topic keywords, related technologies, use cases, difficulty level (beginner/intermediate/advanced), and broad AI/ML terms. Example: ["machine learning", "neural networks", "deep learning", "python", "tutorial", "beginner guide", "tensorflow", "artificial intelligence", "data science", "model training"]
- content: Full blog post in HTML format, minimum 1000 words. Use <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>, <blockquote>, <code>, <pre> tags. Include intro, 4-5 detailed sections with subheadings, and a conclusion. Do NOT include <html>, <head>, <body>, or <img> tags.

Rules: Return raw JSON only. No code fences. No markdown wrapper.`;

  const raw = await callAI(shift, prompt);
  const parsed = extractJSON(raw);

  if (!parsed.title || !parsed.slug || !parsed.content || !parsed.excerpt) {
    throw new Error(`Incomplete article from ${shift.provider}: ${JSON.stringify(Object.keys(parsed))}`);
  }
  if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) {
    parsed.tags = [];
  }
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
      method:   'POST',
      hostname: urlObj.hostname,
      port:     urlObj.port,
      path:     urlObj.pathname,
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
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
    const res  = await httpGet(`${API_BASE}/blogs?limit=100&page=${page}`);
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
  log(`=== Article generation started (${PROVIDER.provider} / ${PROVIDER.model}) ===`);

  if (!PROVIDER.apiKey()) {
    log(`ERROR: GROQ_API_KEY is not set`);
    process.exit(1);
  }

  const existingTitles = await fetchExistingTitles();
  log(`Existing articles: ${existingTitles.size}`);

  let published = 0;

  for (const catSlug of Object.keys(CATEGORIES)) {
    const result = await publishArticleForCategory(catSlug, existingTitles, published);
    if (result) { existingTitles.add(result); published++; }
  }

  log(`\n=== Done — ${published} article(s) published ===`);
}

// Returns the published title (lowercased) on success, null on failure
async function publishArticleForCategory(catSlug, existingTitles, publishedSoFar) {
  const category = CATEGORIES[catSlug];
  log(`\n── Category: ${category.name} ──`);

  const unused = TOPICS[catSlug].filter(t => !existingTitles.has(t.toLowerCase().trim()));
  if (unused.length === 0) {
    log(`⚠ All topics exhausted for ${category.name}, skipping.`);
    return null;
  }

  // Respect Groq TPM limit (6000 tokens/min → ~35s between articles)
  if (publishedSoFar > 0) await sleep(35000);

  const topic = pick(unused);
  log(`Topic: "${topic}"`);

  let article;
  try {
    article = await generateArticle(PROVIDER, topic);
    log(`Generated: "${article.title}"`);
  } catch (err) {
    log(`ERROR generating article: ${err.message}`);
    return null;
  }

  if (existingTitles.has(article.title.toLowerCase().trim())) {
    log(`Duplicate title detected, skipping.`);
    return null;
  }

  // Strip any images the AI included in the content
  article.content = article.content
    .replaceAll(/!\[.*?\]\(.*?\)/g, '')
    .replaceAll(/<img[^>]*>/gi, '');

  const slug = `${slugify(article.title)}-${Date.now()}`;
  let imageUrl = '';
  try {
    imageUrl = saveImage(slug, article.title, category);
    log(`Image saved: ${imageUrl}`);
  } catch (err) {
    log(`Warning: image save failed (${err.message}), continuing without image.`);
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
    trending:       false,
    rating:         0,
    review_count:   0,
  };

  try {
    const res = await httpPost(`${API_BASE}/blogs`, payload);
    if (res.status !== 201) {
      log(`Save failed (HTTP ${res.status}): ${JSON.stringify(res.body)}`);
      return null;
    }
    log(`✓ Published! ID: ${res.body.data?.id} | Read time: ${readTime} min`);
    return article.title.toLowerCase().trim();
  } catch (err) {
    log(`ERROR saving article: ${err.message}`);
    return null;
  }
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
