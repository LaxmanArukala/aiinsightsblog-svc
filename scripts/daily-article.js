#!/usr/bin/env node
/**
 * Daily AI article generator.
 * Rotates through categories, checks for duplicates, generates a full article
 * via the local API, and inserts it into the database.
 * Run via cron: 0 9 * * * /home/ec2-user/aiinsightsblog-svc/scripts/daily-article.js >> /home/ec2-user/logs/daily-article.log 2>&1
 */

const http = require('node:http');

const API_BASE = 'http://localhost:8000/api/v1';

// ── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'cat-1', name: 'AI Agents',             slug: 'ai-agents',       color: '#0ea5e9' },
  { id: 'cat-2', name: 'Large Language Models',  slug: 'llms',            color: '#10b981' },
  { id: 'cat-3', name: 'Generative AI',          slug: 'generative-ai',   color: '#f59e0b' },
  { id: 'cat-4', name: 'Robotics',               slug: 'robotics',        color: '#ef4444' },
  { id: 'cat-5', name: 'Computer Vision',        slug: 'computer-vision', color: '#8b5cf6' },
  { id: 'cat-6', name: 'Machine Learning',       slug: 'machine-learning',color: '#ec4899' },
  { id: 'cat-7', name: 'Data Science',           slug: 'data-science',    color: '#14b8a6' },
];

// ── Topic pools per category ──────────────────────────────────────────────────
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
    'Agent Benchmarking: How to Evaluate Autonomous AI Performance',
    'Tool-Augmented LLMs: Giving AI Agents the Ability to Browse and Compute',
    'Building a Research Agent That Reads and Summarizes Papers',
    'Function Calling in OpenAI: The Foundation of Agentic AI',
    'Hierarchical AI Agents: Orchestrators and Sub-Agents Explained',
    'AI Agents for Data Analysis: Automating Insights with Code Interpreter',
    'Swarm Intelligence: How Multiple AI Agents Collaborate to Solve Problems',
    'Event-Driven AI Agents: Reacting to Real-World Triggers',
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
    'LLM Evaluation Metrics: BLEU, ROUGE, and Beyond',
    'Context Window Limits and How to Work Around Them',
    'Building a Document Q&A System with LangChain and OpenAI',
    'Instruction Tuning vs RLHF: How LLMs Learn to Follow Directions',
    'Vector Databases for LLMs: Pinecone vs Weaviate vs ChromaDB',
    'Semantic Search with Sentence Transformers and FAISS',
    'Guardrails for LLMs: Preventing Hallucinations and Harmful Outputs',
    'Structured Output with LLMs: JSON Mode and Function Calling',
    'LLM Benchmarks Explained: MMLU, HellaSwag, and HumanEval',
    'Building a Chatbot with Memory Using LangChain and Redis',
    'Speculative Decoding: Making LLM Inference Faster',
    'LLM Compression: Pruning, Distillation, and Quantization Compared',
  ],
  'generative-ai': [
    'Stable Diffusion XL: A Deep Dive into Text-to-Image Generation',
    'ControlNet: Giving Precise Control to Diffusion Models',
    'AI Video Generation: How Sora, Runway, and Pika Work',
    'Generative AI for Music: MusicLM, Suno, and the Future of Sound',
    'DALL-E 3 vs Midjourney vs Stable Diffusion: 2025 Comparison',
    'How Diffusion Models Work: Noise, Denoising, and Latent Space',
    'AI Image Editing with InstructPix2Pix and Instruct-Based Models',
    'Multimodal AI: GPT-4V, LLaVA, and Understanding Images with LLMs',
    'Generative AI in Enterprise: Use Cases Across Industries',
    'Building a Text-to-Image App with Stable Diffusion API',
    'LoRA for Image Generation: Training Custom Styles Efficiently',
    'AI Avatar Generation: How HeyGen and D-ID Create Talking Avatars',
    'The Ethics of Generative AI: Deepfakes, Copyright, and Consent',
    'Generative AI for Code: Copilot, Cursor, and the Future of Programming',
    'Prompt Engineering for Image Generation: Techniques and Best Practices',
    'Neural Radiance Fields (NeRF): Generating 3D Scenes from Images',
    'Text-to-3D Generation: Shap-E, DreamFusion, and the Road Ahead',
    'GAN vs Diffusion Models: Which Architecture Wins in 2025?',
    'AI in Creative Workflows: How Studios Are Using Generative AI',
    'Inpainting and Outpainting: Expanding and Editing Images with AI',
  ],
  'robotics': [
    'ROS 2 Getting Started: Building Your First Robot Application',
    'Boston Dynamics Atlas: How Humanoid Robots Learn to Move',
    'Reinforcement Learning for Robot Control: From Simulation to Real World',
    'SLAM Explained: How Robots Map and Navigate Unknown Environments',
    'Soft Robotics: Building Flexible Machines Inspired by Nature',
    'Robot Perception: Fusing LiDAR, Cameras, and IMU for Spatial Awareness',
    'Imitation Learning: Teaching Robots by Demonstration',
    'Industrial Robotics in 2025: Cobots, AGVs, and Smart Factories',
    'Drone Autonomy: Path Planning and Obstacle Avoidance for UAVs',
    'Tactile Sensing: Giving Robots a Sense of Touch',
    'Foundation Models for Robotics: RT-2, OpenVLA, and the Road Ahead',
    'Sim-to-Real Transfer: Bridging the Gap Between Simulation and Physical Robots',
    'Surgical Robots: How AI Is Transforming the Operating Room',
    'Swarm Robotics: Coordinating Hundreds of Simple Robots',
    'Legged Robot Locomotion: How Spot and ANYmal Walk on Rough Terrain',
    'Robot Manipulation: Grasp Planning with Deep Learning',
    'Autonomous Mobile Robots (AMR) in Warehouses: The Amazon Robotics Story',
    'Human-Robot Interaction: Designing Safe and Intuitive Collaborative Robots',
    'Robot Operating System (ROS) vs Isaac SDK: Choosing Your Robotics Framework',
    'AI-Powered Prosthetics: How Machine Learning Is Restoring Movement',
  ],
  'computer-vision': [
    'YOLO v10 Explained: Real-Time Object Detection at the Edge',
    'Segment Anything Model (SAM): Meta\'s Universal Image Segmentation Tool',
    'Depth Estimation with Monocular Cameras: From MiDaS to Depth Anything',
    'Vision Transformers (ViT) vs CNNs: Which Architecture Should You Use?',
    'OpenCV in 2025: Essential Techniques Every CV Engineer Should Know',
    'Pose Estimation with MediaPipe: Body, Hand, and Face Landmarks',
    'Optical Flow: How Computers Understand Motion in Video',
    'Face Recognition Systems: FaceNet, ArcFace, and Privacy Considerations',
    'Semantic Segmentation with DeepLab and SegFormer',
    'Anomaly Detection in Images: Quality Control with Computer Vision',
    '3D Point Cloud Processing with PointNet and Open3D',
    'OCR in 2025: Tesseract, PaddleOCR, and LLM-Based Document Understanding',
    'Real-Time Video Analytics: Building a Computer Vision Pipeline at Scale',
    'Medical Image Analysis: AI-Assisted Diagnosis with Deep Learning',
    'Image Classification with EfficientNet and ConvNeXt',
    'Self-Supervised Learning for Computer Vision: DINO, MAE, and SimCLR',
    'Autonomous Driving Perception: Cameras, Radar, and Sensor Fusion',
    'Scene Understanding: Combining Detection, Segmentation, and Depth',
    'Edge AI for Computer Vision: Deploying Models on Raspberry Pi and Jetson',
    'Data Augmentation Strategies for Computer Vision: Albumentations and Beyond',
  ],
  'machine-learning': [
    'Gradient Boosting Explained: XGBoost, LightGBM, and CatBoost Compared',
    'Feature Engineering: The Art of Creating Predictive Variables',
    'Hyperparameter Tuning with Optuna: Automated ML Optimization',
    'Dealing with Imbalanced Datasets: SMOTE, Class Weights, and Ensemble Methods',
    'Explainable AI (XAI): SHAP and LIME for Model Interpretability',
    'Time Series Forecasting with Prophet, LSTM, and Temporal Fusion Transformer',
    'Transfer Learning: Fine-Tuning Pre-Trained Models for Your Use Case',
    'Federated Learning: Training ML Models Without Sharing Data',
    'MLOps Best Practices: From Experiment Tracking to Production Deployment',
    'Random Forests and Decision Trees: A Deep Dive for Practitioners',
    'Anomaly Detection: Isolation Forest, Autoencoders, and One-Class SVM',
    'Clustering Algorithms Compared: K-Means, DBSCAN, and Hierarchical Clustering',
    'Building a Recommendation System from Scratch with Collaborative Filtering',
    'Dimensionality Reduction: PCA, t-SNE, and UMAP Explained',
    'Neural Architecture Search (NAS): Automating Deep Learning Design',
    'Online Learning: Updating ML Models in Real Time with Streaming Data',
    'Bayesian Optimization: A Smarter Way to Tune Machine Learning Models',
    'Ensemble Methods: Bagging, Boosting, and Stacking for Better Predictions',
    'Model Monitoring in Production: Detecting Data Drift and Model Decay',
    'Survival Analysis with Machine Learning: Predicting Time-to-Event Outcomes',
  ],
  'data-science': [
    'Pandas 2.0: What\'s New and How to Use the Latest Features',
    'Polars vs Pandas: The Fastest DataFrame Library for Large Datasets',
    'Data Cleaning in Practice: Handling Missing Values, Outliers, and Duplicates',
    'SQL for Data Scientists: Window Functions, CTEs, and Query Optimization',
    'Building a Data Pipeline with Apache Airflow and dbt',
    'Exploratory Data Analysis (EDA): A Systematic Approach with Python',
    'Statistics for Data Science: Hypothesis Testing, p-values, and Confidence Intervals',
    'Data Visualization Best Practices: Matplotlib, Seaborn, and Plotly',
    'Web Scraping at Scale: BeautifulSoup, Scrapy, and Playwright',
    'A/B Testing for Data Scientists: Design, Analysis, and Pitfalls',
    'Causal Inference: Moving Beyond Correlation in Data Analysis',
    'Building a Real-Time Dashboard with Streamlit and FastAPI',
    'Working with Large Datasets: Dask, Spark, and Vaex for Out-of-Memory Processing',
    'Data Versioning and Reproducibility with DVC and MLflow',
    'API Data Collection: REST, GraphQL, and Pagination Strategies',
    'Natural Language Processing for Data Scientists: Text Cleaning and Feature Extraction',
    'Geospatial Data Analysis with GeoPandas and Folium',
    'Time Series Data: Resampling, Rolling Windows, and Seasonal Decomposition',
    'Data Storytelling: Communicating Insights to Non-Technical Stakeholders',
    'Building a Personal Data Science Portfolio That Gets You Hired',
  ],
};

// ── Authors ───────────────────────────────────────────────────────────────────
const AUTHORS = [
  { id: 'a1', name: 'AI Insights Blogs', bio: 'Your go-to source for AI news, tutorials, and insights on agents, LLMs, and generative AI.', avatar: 'https://aiinsightsblogs.com/favicon.ico' },
];

// ── Unsplash image pools ───────────────────────────────────────────────────────
const IMAGES = {
  'ai-agents': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
  ],
  'llms': [
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
  ],
  'generative-ai': [
    'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1636690619068-eb3849be82d1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=1200&auto=format&fit=crop&q=80',
  ],
  'robotics': [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546776230-bb86256870ce?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1717501218347-64eb4b34b2e8?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
  ],
  'computer-vision': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  ],
  'machine-learning': [
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  ],
  'data-science': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599658880436-c61792e70672?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=1200&auto=format&fit=crop&q=80',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function log(msg) {
  process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`);
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (err) { reject(new Error(`JSON parse error: ${err.message} — ${data.slice(0, 300)}`)); }
      });
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = http.request({
      method: 'POST',
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (err) { reject(new Error(`JSON parse error: ${err.message} — ${data.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Fetch all existing blog titles from the DB (paginated)
async function fetchExistingTitles() {
  const titles = new Set();
  let page = 1;
  while (true) {
    const res = await httpGet(`${API_BASE}/blogs?limit=100&page=${page}`);
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
  log('=== Daily article generation started ===');

  // ── Step 1: fetch existing titles to avoid duplicates ──────────────────────
  log('Fetching existing article titles from database...');
  const existingTitles = await fetchExistingTitles();
  log(`Found ${existingTitles.size} existing articles.`);

  // ── Step 2: pick category (rotate by day of year) ─────────────────────────
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const category = CATEGORIES[dayOfYear % CATEGORIES.length];
  log(`Category: ${category.name}`);

  // ── Step 3: pick an unused topic ─────────────────────────────────────────
  const topicPool = TOPICS[category.slug];
  const unusedTopics = topicPool.filter(t => !existingTitles.has(t.toLowerCase().trim()));

  if (unusedTopics.length === 0) {
    log(`⚠ All topics in "${category.name}" already published. Trying other categories...`);
    // Try other categories
    for (const cat of CATEGORIES) {
      if (cat.slug === category.slug) continue;
      const fallback = TOPICS[cat.slug].filter(t => !existingTitles.has(t.toLowerCase().trim()));
      if (fallback.length > 0) {
        log(`Switching to category: ${cat.name}`);
        Object.assign(category, cat);
        unusedTopics.push(...fallback);
        break;
      }
    }
  }

  if (unusedTopics.length === 0) {
    log('✓ All predefined topics have been published. No new article needed today.');
    return;
  }

  const topic = pick(unusedTopics);
  log(`Topic selected: "${topic}"`);

  // ── Step 4: generate article content ────────────────────────────────────
  log('Calling AI generation API...');
  const genRes = await httpGet(`${API_BASE}/blogs/generate?topic=${encodeURIComponent(topic)}`);

  if (!genRes.data?.title) {
    throw new Error(`Generation failed: ${JSON.stringify(genRes)}`);
  }

  const generated = genRes.data;
  log(`Generated title: "${generated.title}"`);

  // Double-check the AI-generated title isn't a duplicate either
  if (existingTitles.has(generated.title.toLowerCase().trim())) {
    throw new Error(`Duplicate detected for AI-generated title: "${generated.title}". Aborting.`);
  }

  // ── Step 5: build and save the blog payload ───────────────────────────────
  const author = pick(AUTHORS);
  const image  = pick(IMAGES[category.slug]);
  const thumb  = image.replace('w=1200', 'w=800');
  const words  = generated.content.split(/\s+/).length;
  const readTime = Math.max(3, Math.round(words / 200));

  const blogPayload = {
    title:          generated.title,
    slug:           `${slugify(generated.title)}-${Date.now()}`,
    excerpt:        generated.excerpt,
    content:        generated.content,
    thumbnail:      thumb,
    featured_image: image,
    category:       { id: category.id, name: category.name, slug: category.slug, color: category.color },
    tags:           [category.name, 'Artificial Intelligence', 'Machine Learning', 'AI Tutorial']
                      .map((t, i) => ({ id: `tag-${i}`, name: t, slug: slugify(t) })),
    author,
    published_at:   new Date().toISOString(),
    read_time:      readTime,
    featured:       false,
    trending:       false,
    rating:         Number.parseFloat((4 + Math.random()).toFixed(1)),
    review_count:   0,
  };

  log('Saving article to database...');
  const saveRes = await httpPost(`${API_BASE}/blogs`, blogPayload);

  if (saveRes.status !== 201) {
    throw new Error(`Save failed (HTTP ${saveRes.status}): ${JSON.stringify(saveRes.body)}`);
  }

  const saved = saveRes.body.data;
  log(`✓ Article published!`);
  log(`  ID       : ${saved.id}`);
  log(`  Title    : ${saved.title}`);
  log(`  Category : ${category.name}`);
  log(`  Read time: ${readTime} min`);
  log('=== Done ===');
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
