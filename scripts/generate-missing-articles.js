/* eslint-disable */
require('dotenv').config();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const API_BASE = 'https://api.aiinsightsblogs.com/api/v1';

const AUTHORS = [
  { id: 'a1', name: 'Sarah Mitchell', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',  bio: 'Robotics Engineer with 10 years building autonomous systems and manipulation robots.' },
  { id: 'a2', name: 'James Chen',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',  bio: 'Research Scientist specialising in statistical machine learning and model theory.' },
  { id: 'a3', name: 'Priya Sharma',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',  bio: 'Computer Vision Engineer building perception stacks for autonomous vehicles.' },
  { id: 'a4', name: 'Carlos Rivera',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos', bio: 'ML Engineer focused on production machine learning systems and MLOps.' },
  { id: 'a5', name: 'Emma Watson',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',   bio: 'Robotics researcher working on human-robot interaction and soft robotics.' },
  { id: 'a6', name: 'Alex Thompson',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',   bio: 'Computer Vision specialist in medical imaging, segmentation, and 3D vision.' },
];

const tag = (id, name) => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
});

// ─── Topics to generate ───────────────────────────────────────────────────────
// Robotics: 2 already exist (intro-to-modern-robotics, ros-2-explained)
// Machine Learning: 0 exist
// Computer Vision: 0 exist

const TOPICS = [

  // ══════════════════════════════════════════════════════════════════════════
  //  ROBOTICS  (8 new articles)
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Reinforcement Learning for Robotics: Teaching Robots Through Trial and Error',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr8','Reinforcement Learning'), tag('tr9','Deep Learning'), tag('tr10','Sim-to-Real')],
    author: AUTHORS[0],
  },
  {
    title: 'Robot Kinematics and Motion Planning: From Forward Kinematics to MoveIt',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr11','Kinematics'), tag('tr12','Motion Planning'), tag('tr2','Control Systems')],
    author: AUTHORS[4],
  },
  {
    title: 'SLAM Explained: How Robots Map Unknown Environments and Localise Themselves',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr13','SLAM'), tag('tr14','Navigation'), tag('tr15','Autonomous Robots')],
    author: AUTHORS[0],
  },
  {
    title: 'Robot Perception: How Robots Use Cameras, LiDAR, and Depth Sensors',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr3','Sensors'), tag('tr16','LiDAR'), tag('tr17','Perception')],
    author: AUTHORS[4],
  },
  {
    title: 'Robot Manipulation and Grasping: How Robotic Arms Pick and Place Objects',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr18','Manipulation'), tag('tr19','Grasping'), tag('tr2','Control Systems')],
    author: AUTHORS[0],
  },
  {
    title: 'Soft Robotics: Building Flexible Bio-Inspired Machines for the Real World',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr20','Soft Robotics'), tag('tr21','Bio-Inspired'), tag('tr22','Materials')],
    author: AUTHORS[4],
  },
  {
    title: 'Human-Robot Interaction: Designing Collaborative Robots That Work Alongside People',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr23','HRI'), tag('tr24','Cobots'), tag('tr25','Safety')],
    author: AUTHORS[0],
  },
  {
    title: 'Humanoid Robots in 2025: Boston Dynamics, Tesla Optimus, and the Road Ahead',
    category: { id: 'cat-robotics', name: 'Robotics', slug: 'robotics' },
    tags: [tag('tr1','Robotics'), tag('tr26','Humanoids'), tag('tr27','Boston Dynamics'), tag('tr28','Future')],
    author: AUTHORS[4],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  MACHINE LEARNING  (10 articles)
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Supervised Learning Explained: Classification and Regression From First Principles',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm2','Supervised Learning'), tag('tm3','Scikit-learn'), tag('tm4','Beginners')],
    author: AUTHORS[1],
  },
  {
    title: 'Gradient Descent Deep Dive: The Optimisation Algorithm That Powers All of ML',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm5','Gradient Descent'), tag('tm6','Optimisation'), tag('tm7','Mathematics')],
    author: AUTHORS[3],
  },
  {
    title: 'Ensemble Methods Mastery: Random Forests, Gradient Boosting, and XGBoost',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm8','Random Forest'), tag('tm9','XGBoost'), tag('tm10','Ensemble Learning')],
    author: AUTHORS[1],
  },
  {
    title: 'Feature Engineering: Transforming Raw Data Into Powerful Machine Learning Signals',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm11','Feature Engineering'), tag('tm12','Data Science'), tag('tm3','Scikit-learn')],
    author: AUTHORS[3],
  },
  {
    title: 'Model Evaluation Mastery: Cross-Validation, ROC Curves, and Preventing Overfitting',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm13','Model Evaluation'), tag('tm14','Cross-Validation'), tag('tm15','Overfitting')],
    author: AUTHORS[1],
  },
  {
    title: 'Unsupervised Learning: Clustering, Dimensionality Reduction, and Anomaly Detection',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm16','Unsupervised Learning'), tag('tm17','Clustering'), tag('tm18','PCA')],
    author: AUTHORS[3],
  },
  {
    title: 'Neural Networks From Scratch: Understanding Backpropagation and Weight Updates',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm19','Neural Networks'), tag('tm20','Backpropagation'), tag('tm7','Mathematics')],
    author: AUTHORS[1],
  },
  {
    title: 'Support Vector Machines In Depth: Kernels, Margins, and When to Use SVMs',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm21','SVM'), tag('tm22','Kernel Methods'), tag('tm2','Supervised Learning')],
    author: AUTHORS[3],
  },
  {
    title: 'Time Series Forecasting with Machine Learning: ARIMA, Prophet, and LSTM Compared',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm23','Time Series'), tag('tm24','LSTM'), tag('tm25','Forecasting')],
    author: AUTHORS[1],
  },
  {
    title: 'MLOps: Building Reliable Machine Learning Pipelines From Experimentation to Production',
    category: { id: 'cat-ml', name: 'Machine Learning', slug: 'machine-learning' },
    tags: [tag('tm1','Machine Learning'), tag('tm26','MLOps'), tag('tm27','Production ML'), tag('tm28','Pipelines')],
    author: AUTHORS[3],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPUTER VISION  (10 articles)
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Convolutional Neural Networks Explained: How Machines Learn to See',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc2','CNNs'), tag('tc3','Deep Learning'), tag('tm4','Beginners')],
    author: AUTHORS[2],
  },
  {
    title: 'Object Detection in 2025: YOLO, SSD, and Faster R-CNN Compared In Depth',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc4','Object Detection'), tag('tc5','YOLO'), tag('tc6','PyTorch')],
    author: AUTHORS[5],
  },
  {
    title: 'Image Segmentation Explained: Semantic, Instance, and Panoptic Segmentation',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc7','Segmentation'), tag('tc3','Deep Learning'), tag('tc6','PyTorch')],
    author: AUTHORS[2],
  },
  {
    title: 'Vision Transformers (ViT): How Self-Attention Replaced Convolutions in Vision',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc8','Vision Transformers'), tag('tc2','CNNs'), tag('tc3','Deep Learning')],
    author: AUTHORS[5],
  },
  {
    title: 'Building a Real-Time Object Detection System With YOLOv8 and Python',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc5','YOLO'), tag('tc4','Object Detection'), tag('tc9','Tutorial')],
    author: AUTHORS[2],
  },
  {
    title: '3D Computer Vision: Depth Estimation, Point Clouds, and Neural Radiance Fields',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc10','3D Vision'), tag('tc11','Depth Estimation'), tag('tc12','NeRF')],
    author: AUTHORS[5],
  },
  {
    title: 'Medical Image Analysis With Deep Learning: From X-Rays to MRI Interpretation',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc13','Medical Imaging'), tag('tc3','Deep Learning'), tag('tc7','Segmentation')],
    author: AUTHORS[2],
  },
  {
    title: 'Image Data Augmentation: Techniques to Maximise Model Performance With Less Data',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc14','Data Augmentation'), tag('tc3','Deep Learning'), tag('tc6','PyTorch')],
    author: AUTHORS[5],
  },
  {
    title: 'Optical Flow and Video Understanding: Teaching Machines to Analyse Motion',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc15','Optical Flow'), tag('tc16','Video Analysis'), tag('tc3','Deep Learning')],
    author: AUTHORS[2],
  },
  {
    title: 'Face Recognition Systems: How They Work, Key Algorithms, and Ethical Considerations',
    category: { id: 'cat-cv', name: 'Computer Vision', slug: 'computer-vision' },
    tags: [tag('tc1','Computer Vision'), tag('tc17','Face Recognition'), tag('tc18','Biometrics'), tag('tc19','Ethics')],
    author: AUTHORS[5],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function randomPublishedAt() {
  const days = Math.floor(Math.random() * 45) + 1;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function estimateReadTime(content) {
  const wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(8, Math.round(wordCount / 200));
}

// ─── Groq generation ──────────────────────────────────────────────────────────

async function generateArticle(topic) {
  const prompt = `You are a senior technical writer for a premium AI and technology education blog. Write a comprehensive, deeply educational article about:

Title: "${topic.title}"
Category: ${topic.category.name}

REQUIREMENTS:
- Minimum 2000 words of real educational content
- HTML format using these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <pre><code>, <table>
- Teach from fundamentals upward — assume the reader is an intelligent developer new to this specific topic
- At least 4 practical, working code examples in <pre><code> blocks (Python preferred)
- At least one comparison <table> with <thead> and <tbody>
- At least 3 <blockquote> tags with key insights, real statistics, or memorable takeaways
- Cover all of: what it is, why it matters, how it works (go deep), real-world applications, step-by-step implementation, common pitfalls and how to avoid them, and what to study next
- Use concrete analogies to explain hard concepts
- No images, no img tags, no placeholder image references
- Engaging and authoritative tone — like a senior engineer mentoring a junior

Return ONLY a valid JSON object with exactly these fields:
{
  "slug": "url-friendly-slug-lowercase-hyphens-max-80-chars",
  "excerpt": "2-3 sentence compelling summary that makes a developer want to read the full article",
  "content": "full HTML article content — minimum 2000 words"
}

JSON only. No text before or after the JSON object.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 8000,
  });

  const raw = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(raw);

  if (!parsed.content || !parsed.excerpt) {
    throw new Error('Incomplete generation — missing content or excerpt');
  }

  return {
    slug:    parsed.slug || slugify(topic.title),
    excerpt: parsed.excerpt,
    content: parsed.content,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function getExistingSlugs() {
  const res  = await fetch(`${API_BASE}/blogs?limit=200`);
  const data = await res.json();
  return new Set((data?.data?.data || []).map(b => b.slug));
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Generating ${TOPICS.length} articles  →  Robotics | Machine Learning | CV  ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const existingSlugs = await getExistingSlugs();
  console.log(`Found ${existingSlugs.size} existing articles in production DB.\n`);

  let created = 0, skipped = 0, failed = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const label = `[${String(i + 1).padStart(2, '0')}/${TOPICS.length}]`;
    const predictedSlug = slugify(topic.title);

    if (existingSlugs.has(predictedSlug)) {
      console.log(`${label} SKIP   ${topic.category.name} | ${predictedSlug}`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`${label} GEN    ${topic.category.name} | ${topic.title.slice(0, 55)}...`);
      const generated = await generateArticle(topic);

      const payload = {
        slug:           generated.slug,
        title:          topic.title,
        excerpt:        generated.excerpt,
        content:        generated.content,
        thumbnail:      null,
        featured_image: null,
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
      process.stdout.write(` ✓  (${payload.read_time} min read)\n`);
      existingSlugs.add(saved.slug);
      created++;

    } catch (err) {
      process.stdout.write(` ✗\n`);
      console.error(`        ERROR: ${err.message}\n`);
      failed++;
    }

    // Respect Groq rate limits
    if (i < TOPICS.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(`  ✅  Created : ${created}`);
  console.log(`  ⏭   Skipped : ${skipped}`);
  console.log(`  ❌  Failed  : ${failed}`);
  console.log('──────────────────────────────────────────────────────────────\n');

  // Final count
  const res  = await fetch(`${API_BASE}/blogs?limit=1`);
  const data = await res.json();
  console.log(`  Total articles in production DB: ${data.data.meta.total}\n`);
}

main().catch(console.error);
