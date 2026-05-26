/* eslint-disable */
require('dotenv').config();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const API_BASE = 'https://api.aiinsightsblogs.com/api/v1';

// ── Authors ────────────────────────────────────────────────────────────────────
const AUTHORS = [
  { id: 'a1', name: 'Sarah Mitchell', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',  bio: 'Senior AI Engineer with 10 years of experience in autonomous systems and LLMs.' },
  { id: 'a2', name: 'James Chen',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',  bio: 'Research Scientist specialising in machine learning and deep learning architectures.' },
  { id: 'a3', name: 'Priya Sharma',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',  bio: 'Computer Vision Engineer building perception systems for autonomous vehicles and robotics.' },
  { id: 'a4', name: 'Carlos Rivera',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos', bio: 'ML Engineer focused on production machine learning, MLOps, and model deployment.' },
  { id: 'a5', name: 'Emma Watson',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',   bio: 'Generative AI researcher exploring creativity, diffusion models, and multi-modal systems.' },
  { id: 'a6', name: 'Alex Thompson',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',   bio: 'Robotics Engineer and ROS expert building next-generation autonomous machines.' },
];

// ── Unsplash image pools per category ─────────────────────────────────────────
const IMAGES = {
  'ai-agents': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
  ],
  'llms': [
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=1200&auto=format&fit=crop&q=80',
  ],
  'generative-ai': [
    'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1636690619068-eb3849be82d1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&auto=format&fit=crop&q=80',
  ],
  'robotics': [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546776230-bb86256870ce?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1717501218347-64eb4b34b2e8?w=1200&auto=format&fit=crop&q=80',
  ],
  'computer-vision': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&auto=format&fit=crop&q=80',
  ],
  'machine-learning': [
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  ],
};

const tag = (id, name) => ({ id, name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') });

// ── 30 new topics (5 per category) ────────────────────────────────────────────
const TOPICS = [
  // ── AI AGENTS ──────────────────────────────────────────────────────────────
  {
    title: 'Agentic RAG: Combining Retrieval-Augmented Generation with Autonomous AI Agents',
    category: { id: 'cat-1', name: 'AI Agents', slug: 'ai-agents' },
    tags: [tag('t1','AI Agents'), tag('t2','RAG'), tag('t3','LangChain'), tag('t4','Production')],
    author: AUTHORS[0],
  },
  {
    title: 'Self-Correcting AI Agents: Reflexion, Self-Refine, and Critic-in-the-Loop',
    category: { id: 'cat-1', name: 'AI Agents', slug: 'ai-agents' },
    tags: [tag('t1','AI Agents'), tag('t5','Self-Correction'), tag('t6','LLMs'), tag('t7','Reasoning')],
    author: AUTHORS[0],
  },
  {
    title: 'Planning in AI Agents: Tree of Thoughts, Graph of Thoughts, and MCTS',
    category: { id: 'cat-1', name: 'AI Agents', slug: 'ai-agents' },
    tags: [tag('t1','AI Agents'), tag('t8','Planning'), tag('t9','Tree of Thoughts'), tag('t6','LLMs')],
    author: AUTHORS[1],
  },
  {
    title: 'OpenAI Assistants API Deep Dive: Building Stateful Persistent AI Agents',
    category: { id: 'cat-1', name: 'AI Agents', slug: 'ai-agents' },
    tags: [tag('t1','AI Agents'), tag('t10','OpenAI'), tag('t11','Assistants API'), tag('t12','Tutorial')],
    author: AUTHORS[0],
  },
  {
    title: 'Event-Driven AI Agents: Building Autonomous Systems That React to Real-World Triggers',
    category: { id: 'cat-1', name: 'AI Agents', slug: 'ai-agents' },
    tags: [tag('t1','AI Agents'), tag('t13','Event-Driven'), tag('t14','Automation'), tag('t4','Production')],
    author: AUTHORS[1],
  },

  // ── LLMs ──────────────────────────────────────────────────────────────────
  {
    title: 'Mixture of Experts (MoE): How Mistral, GPT-4, and Grok Scale Efficiently',
    category: { id: 'cat-2', name: "LLM's", slug: 'llms' },
    tags: [tag('t15',"LLM's"), tag('t16','Mixture of Experts'), tag('t17','Mistral'), tag('t18','Architecture')],
    author: AUTHORS[1],
  },
  {
    title: 'Long Context LLMs Explained: Handling 1M Token Windows Without Losing Accuracy',
    category: { id: 'cat-2', name: "LLM's", slug: 'llms' },
    tags: [tag('t15',"LLM's"), tag('t19','Long Context'), tag('t20','Gemini'), tag('t21','Context Window')],
    author: AUTHORS[0],
  },
  {
    title: 'LLM Evaluation Metrics Explained: BLEU, ROUGE, Perplexity, and MMLU',
    category: { id: 'cat-2', name: "LLM's", slug: 'llms' },
    tags: [tag('t15',"LLM's"), tag('t22','Evaluation'), tag('t23','Benchmarks'), tag('t24','MMLU')],
    author: AUTHORS[1],
  },
  {
    title: 'Speculative Decoding: Making Large Language Model Inference 3x Faster',
    category: { id: 'cat-2', name: "LLM's", slug: 'llms' },
    tags: [tag('t15',"LLM's"), tag('t25','Inference'), tag('t26','Speculative Decoding'), tag('t27','Optimisation')],
    author: AUTHORS[0],
  },
  {
    title: 'Vector Databases for LLMs: Pinecone vs Weaviate vs ChromaDB vs Qdrant',
    category: { id: 'cat-2', name: "LLM's", slug: 'llms' },
    tags: [tag('t15',"LLM's"), tag('t28','Vector DB'), tag('t29','RAG'), tag('t30','Pinecone')],
    author: AUTHORS[1],
  },

  // ── GENERATIVE AI ──────────────────────────────────────────────────────────
  {
    title: 'ControlNet In Depth: Giving Precise Spatial Control to Stable Diffusion',
    category: { id: 'cat-3', name: 'Generative AI', slug: 'generative-ai' },
    tags: [tag('t31','Generative AI'), tag('t32','ControlNet'), tag('t33','Stable Diffusion'), tag('t34','Image Generation')],
    author: AUTHORS[4],
  },
  {
    title: 'Text-to-3D Generation: Shap-E, DreamFusion, and the Road to 3D AI',
    category: { id: 'cat-3', name: 'Generative AI', slug: 'generative-ai' },
    tags: [tag('t31','Generative AI'), tag('t35','Text-to-3D'), tag('t36','NeRF'), tag('t37','3D Generation')],
    author: AUTHORS[4],
  },
  {
    title: 'AI Avatar Generation: How HeyGen and D-ID Create Photorealistic Talking Avatars',
    category: { id: 'cat-3', name: 'Generative AI', slug: 'generative-ai' },
    tags: [tag('t31','Generative AI'), tag('t38','Avatars'), tag('t39','HeyGen'), tag('t40','Video AI')],
    author: AUTHORS[4],
  },
  {
    title: 'GAN Architecture Deep Dive: From Vanilla GAN to StyleGAN3 and Beyond',
    category: { id: 'cat-3', name: 'Generative AI', slug: 'generative-ai' },
    tags: [tag('t31','Generative AI'), tag('t41','GANs'), tag('t42','StyleGAN'), tag('t43','Deep Learning')],
    author: AUTHORS[4],
  },
  {
    title: 'Prompt Engineering for Image Generation: Mastering Midjourney, DALL-E, and SD',
    category: { id: 'cat-3', name: 'Generative AI', slug: 'generative-ai' },
    tags: [tag('t31','Generative AI'), tag('t44','Prompt Engineering'), tag('t34','Image Generation'), tag('t45','Midjourney')],
    author: AUTHORS[4],
  },

  // ── ROBOTICS ──────────────────────────────────────────────────────────────
  {
    title: 'Soft Robotics Deep Dive: Building Flexible Bio-Inspired Machines for Real-World Tasks',
    category: { id: 'cat-4', name: 'Robotics', slug: 'robotics' },
    tags: [tag('t46','Robotics'), tag('t47','Soft Robotics'), tag('t48','Bio-Inspired'), tag('t49','Materials')],
    author: AUTHORS[5],
  },
  {
    title: 'Foundation Models for Robotics: RT-2, OpenVLA, and the Embodied AI Revolution',
    category: { id: 'cat-4', name: 'Robotics', slug: 'robotics' },
    tags: [tag('t46','Robotics'), tag('t50','Foundation Models'), tag('t51','RT-2'), tag('t52','Embodied AI')],
    author: AUTHORS[5],
  },
  {
    title: 'Sim-to-Real Transfer: How Robots Learn in Simulation and Deploy in the Real World',
    category: { id: 'cat-4', name: 'Robotics', slug: 'robotics' },
    tags: [tag('t46','Robotics'), tag('t53','Sim-to-Real'), tag('t54','Simulation'), tag('t55','Isaac Gym')],
    author: AUTHORS[5],
  },
  {
    title: 'Drone Autonomy: Path Planning, Obstacle Avoidance, and Swarm Coordination for UAVs',
    category: { id: 'cat-4', name: 'Robotics', slug: 'robotics' },
    tags: [tag('t46','Robotics'), tag('t56','Drones'), tag('t57','UAV'), tag('t58','Path Planning')],
    author: AUTHORS[5],
  },
  {
    title: 'Tactile Sensing in Robotics: Giving Machines a Sense of Touch',
    category: { id: 'cat-4', name: 'Robotics', slug: 'robotics' },
    tags: [tag('t46','Robotics'), tag('t59','Tactile Sensing'), tag('t60','Sensors'), tag('t61','Manipulation')],
    author: AUTHORS[5],
  },

  // ── MACHINE LEARNING ──────────────────────────────────────────────────────
  {
    title: 'Hyperparameter Tuning with Optuna: Automated Machine Learning Optimisation',
    category: { id: 'cat-6', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('t62','Machine Learning'), tag('t63','Optuna'), tag('t64','Hyperparameter Tuning'), tag('t65','AutoML')],
    author: AUTHORS[3],
  },
  {
    title: 'Imbalanced Datasets: SMOTE, Class Weights, and Ensemble Strategies That Work',
    category: { id: 'cat-6', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('t62','Machine Learning'), tag('t66','Imbalanced Data'), tag('t67','SMOTE'), tag('t68','Classification')],
    author: AUTHORS[1],
  },
  {
    title: 'Explainable AI With SHAP and LIME: Making Black-Box ML Models Interpretable',
    category: { id: 'cat-6', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('t62','Machine Learning'), tag('t69','XAI'), tag('t70','SHAP'), tag('t71','LIME')],
    author: AUTHORS[3],
  },
  {
    title: 'Federated Learning Explained: Training ML Models Across Devices Without Sharing Data',
    category: { id: 'cat-6', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('t62','Machine Learning'), tag('t72','Federated Learning'), tag('t73','Privacy'), tag('t74','Distributed ML')],
    author: AUTHORS[1],
  },
  {
    title: 'Anomaly Detection with Machine Learning: Isolation Forest, Autoencoders, and One-Class SVM',
    category: { id: 'cat-6', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('t62','Machine Learning'), tag('t75','Anomaly Detection'), tag('t76','Isolation Forest'), tag('t77','Autoencoders')],
    author: AUTHORS[3],
  },

  // ── COMPUTER VISION ────────────────────────────────────────────────────────
  {
    title: 'Pose Estimation With MediaPipe: Real-Time Body, Hand, and Face Landmark Detection',
    category: { id: 'cat-5', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('t78','Computer Vision'), tag('t79','Pose Estimation'), tag('t80','MediaPipe'), tag('t81','Real-Time')],
    author: AUTHORS[2],
  },
  {
    title: 'Visual Anomaly Detection: Building AI-Powered Quality Control Systems',
    category: { id: 'cat-5', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('t78','Computer Vision'), tag('t82','Anomaly Detection'), tag('t83','Quality Control'), tag('t84','Industrial AI')],
    author: AUTHORS[2],
  },
  {
    title: 'Self-Supervised Learning for Computer Vision: DINO, MAE, and SimCLR Explained',
    category: { id: 'cat-5', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('t78','Computer Vision'), tag('t85','Self-Supervised'), tag('t86','DINO'), tag('t87','MAE')],
    author: AUTHORS[2],
  },
  {
    title: 'Edge AI for Computer Vision: Deploying Vision Models on Jetson Nano and Raspberry Pi',
    category: { id: 'cat-5', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('t78','Computer Vision'), tag('t88','Edge AI'), tag('t89','Jetson Nano'), tag('t90','Deployment')],
    author: AUTHORS[2],
  },
  {
    title: 'OCR in 2025: Tesseract, PaddleOCR, and LLM-Based Document Understanding',
    category: { id: 'cat-5', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('t78','Computer Vision'), tag('t91','OCR'), tag('t92','Document AI'), tag('t93','PaddleOCR')],
    author: AUTHORS[2],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function randomPublishedAt() {
  const days = Math.floor(Math.random() * 60) + 1;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function estimateReadTime(content) {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(8, Math.round(words / 200));
}

// ── Groq generation ────────────────────────────────────────────────────────────
async function generateArticle(topic) {
  const prompt = `You are a senior technical writer for a premium AI and technology education blog. Write a comprehensive, deeply educational article.

Title: "${topic.title}"
Category: ${topic.category.name}

STRICT REQUIREMENTS:
- Minimum 2500 words of real, valuable educational content
- HTML format — use <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <pre><code>, <table>
- Start with a strong introductory paragraph that sets context and explains why this topic matters
- Teach from fundamentals upward — assume a developer who is intelligent but new to this exact topic
- At least 4 complete, working code examples in <pre><code> blocks (Python preferred where relevant)
- At least 2 <table> elements with <thead> and <tbody> for comparisons or reference data
- At least 3 <blockquote> elements with key insights, real statistics, or memorable takeaways
- Sections must cover: what it is, why it matters, how it works (with depth and diagrams in text), real-world applications, step-by-step implementation, common mistakes and how to avoid them, performance tips, and what to study next
- Use concrete analogies to explain abstract concepts
- No placeholder text, no "Lorem ipsum", no vague filler — every sentence must teach something
- No image tags or references to images

Return ONLY a valid JSON object with exactly these fields:
{
  "slug": "url-friendly-slug-lowercase-hyphens-max-80-chars",
  "excerpt": "2-3 sentence compelling summary that makes a developer genuinely want to read this article",
  "content": "the full HTML article — minimum 2500 words"
}

JSON only. No markdown, no text before or after the JSON.`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 8000,
  });

  const parsed = JSON.parse(resp.choices[0].message.content || '{}');
  if (!parsed.content || !parsed.excerpt) throw new Error('Incomplete generation — missing content or excerpt');
  return parsed;
}

// ── API helpers ────────────────────────────────────────────────────────────────
async function getExistingSlugsAndTitles() {
  const slugs  = new Set();
  const titles = new Set();
  let page = 1;
  while (true) {
    const res  = await fetch(`${API_BASE}/blogs?limit=100&page=${page}`);
    const data = await res.json();
    const blogs = data?.data?.data ?? [];
    if (blogs.length === 0) break;
    blogs.forEach(b => {
      slugs.add(b.slug);
      titles.add(b.title.toLowerCase().trim());
    });
    if (blogs.length < 100) break;
    page++;
  }
  return { slugs, titles };
}

async function postArticle(payload) {
  const res  = await fetch(`${API_BASE}/blogs`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.status) throw new Error(JSON.stringify(data.errors));
  return data.data;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log(`║   Generating 30 articles across all 6 categories                  ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  console.log('Fetching existing articles from production DB...');
  const { slugs: existingSlugs, titles: existingTitles } = await getExistingSlugsAndTitles();
  console.log(`Found ${existingSlugs.size} existing articles. Checking for duplicates before each generation.\n`);
  console.log('─'.repeat(68));

  let created = 0, skipped = 0, failed = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const topic   = TOPICS[i];
    const label   = `[${String(i + 1).padStart(2, '0')}/${TOPICS.length}]`;
    const catName = topic.category.name.padEnd(16);

    // ── Duplicate check ──────────────────────────────────────────────────────
    const predictedSlug  = slugify(topic.title);
    const titleLower     = topic.title.toLowerCase().trim();

    if (existingSlugs.has(predictedSlug) || existingTitles.has(titleLower)) {
      console.log(`${label} SKIP  ${catName} | already in DB`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`${label} GEN   ${catName} | ${topic.title.slice(0, 48)}...`);

      const generated = await generateArticle(topic);

      // Double-check generated slug/title not already used
      if (existingSlugs.has(generated.slug) || existingTitles.has(topic.title.toLowerCase().trim())) {
        process.stdout.write(` SKIP (dup after gen)\n`);
        skipped++;
        continue;
      }

      const image = pick(IMAGES[topic.category.slug]);

      const payload = {
        slug:           generated.slug || predictedSlug,
        title:          topic.title,
        excerpt:        generated.excerpt,
        content:        generated.content,
        thumbnail:      image.replace('w=1200', 'w=800'),
        featured_image: image,
        category:       topic.category,
        tags:           topic.tags,
        author:         topic.author,
        published_at:   randomPublishedAt(),
        read_time:      estimateReadTime(generated.content),
        featured:       false,
        trending:       false,
        rating:         0,
        review_count:   0,
      };

      const saved = await postArticle(payload);
      existingSlugs.add(saved.slug);
      existingTitles.add(topic.title.toLowerCase().trim());

      process.stdout.write(` ✓  (${payload.read_time} min read)\n`);
      created++;

    } catch (err) {
      process.stdout.write(` ✗\n`);
      console.error(`        ERROR: ${err.message}\n`);
      failed++;
    }

    // Respect Groq rate limits (12k TPM on free tier)
    if (i < TOPICS.length - 1) await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n' + '─'.repeat(68));
  console.log(`  ✅  Created  : ${created}`);
  console.log(`  ⏭   Skipped  : ${skipped}`);
  console.log(`  ❌  Failed   : ${failed}`);
  console.log('─'.repeat(68));

  const res  = await fetch(`${API_BASE}/blogs?limit=1`);
  const data = await res.json();
  console.log(`\n  Total articles in production DB: ${data.data.meta.total}\n`);
}

main().catch(console.error);
