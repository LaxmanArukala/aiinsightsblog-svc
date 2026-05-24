INSERT INTO blogs (slug, title, excerpt, content, thumbnail, featured_image, category, tags, author, published_at, read_time, views, likes, bookmarks, featured, trending, rating, review_count) VALUES

(
  'getting-started-with-machine-learning',
  'Getting Started with Machine Learning',
  'A beginner-friendly guide to understanding the core concepts of machine learning and how to build your first model.',
  '## Introduction\n\nMachine learning is transforming every industry. In this guide, we will walk through the fundamentals and help you build your first ML model.\n\n## What is Machine Learning?\n\nMachine learning is a subset of AI that enables computers to learn from data without being explicitly programmed.\n\n## Setting Up Your Environment\n\nInstall Python, scikit-learn, and pandas to get started.\n\n## Building Your First Model\n\nWe will use a simple linear regression model on a housing dataset.\n\n## Conclusion\n\nMachine learning is accessible to everyone. Start small and iterate.',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200',
  '{"id": "1", "name": "Machine Learning", "slug": "machine-learning"}',
  '[{"id": "1", "name": "Python", "slug": "python"}, {"id": "2", "name": "AI", "slug": "ai"}, {"id": "3", "name": "Beginners", "slug": "beginners"}]',
  '{"id": "1", "name": "Sarah Mitchell", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", "bio": "ML Engineer at TechNova"}',
  NOW() - INTERVAL '10 days', 8, 3420, 245, 89, true, true, 4.8, 124
),

(
  'deep-learning-explained',
  'Deep Learning Explained: Neural Networks from Scratch',
  'Dive deep into neural networks, backpropagation, and how deep learning powers modern AI applications.',
  '## Introduction\n\nDeep learning has revolutionized AI. Let us explore how neural networks actually work.\n\n## What are Neural Networks?\n\nNeural networks are inspired by the human brain, consisting of layers of interconnected nodes.\n\n## Backpropagation\n\nBackpropagation is the algorithm used to train neural networks by minimizing loss.\n\n## Building a Neural Network\n\nUsing TensorFlow and Keras, we can build powerful models in just a few lines.\n\n## Conclusion\n\nDeep learning is the backbone of modern AI — mastering it opens endless possibilities.',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200',
  '{"id": "2", "name": "Deep Learning", "slug": "deep-learning"}',
  '[{"id": "2", "name": "AI", "slug": "ai"}, {"id": "4", "name": "TensorFlow", "slug": "tensorflow"}, {"id": "5", "name": "Neural Networks", "slug": "neural-networks"}]',
  '{"id": "2", "name": "James Chen", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=james", "bio": "Research Scientist at DeepMind"}',
  NOW() - INTERVAL '7 days', 12, 5120, 412, 201, true, true, 4.9, 210
),

(
  'llms-the-future-of-nlp',
  'Large Language Models: The Future of NLP',
  'Explore how large language models like GPT and LLaMA are reshaping natural language processing and AI applications.',
  '## Introduction\n\nLarge language models (LLMs) have fundamentally changed how we interact with AI.\n\n## How LLMs Work\n\nLLMs are trained on massive text datasets using transformer architectures.\n\n## Popular LLMs\n\nGPT-4, Claude, LLaMA, and Gemini are leading the charge in AI language understanding.\n\n## Applications\n\nFrom chatbots to code generation, LLMs are powering the next generation of applications.\n\n## Conclusion\n\nLLMs are not just a trend — they are the foundation of the AI era.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200',
  '{"id": "3", "name": "NLP", "slug": "nlp"}',
  '[{"id": "6", "name": "LLMs", "slug": "llms"}, {"id": "7", "name": "GPT", "slug": "gpt"}, {"id": "2", "name": "AI", "slug": "ai"}]',
  '{"id": "3", "name": "Priya Sharma", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=priya", "bio": "AI Product Lead at Horizon AI"}',
  NOW() - INTERVAL '5 days', 10, 7890, 634, 312, true, true, 4.7, 289
),

(
  'python-for-data-science',
  'Python for Data Science: A Complete Roadmap',
  'Everything you need to know about using Python for data science — from NumPy to Pandas to visualization.',
  '## Introduction\n\nPython is the go-to language for data science. Here is your complete roadmap.\n\n## Core Libraries\n\nNumPy for numerical computing, Pandas for data manipulation, and Matplotlib for visualization.\n\n## Data Wrangling\n\nClean, transform, and prepare your datasets for analysis using Pandas.\n\n## Exploratory Data Analysis\n\nUse visualization tools to uncover patterns and insights in your data.\n\n## Conclusion\n\nMastering Python for data science will open doors to machine learning and AI.',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200',
  '{"id": "4", "name": "Data Science", "slug": "data-science"}',
  '[{"id": "1", "name": "Python", "slug": "python"}, {"id": "8", "name": "Pandas", "slug": "pandas"}, {"id": "9", "name": "Data Science", "slug": "data-science"}]',
  '{"id": "4", "name": "Carlos Rivera", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos", "bio": "Full Stack Developer at Stackify"}',
  NOW() - INTERVAL '3 days', 9, 2340, 187, 95, false, true, 4.6, 98
),

(
  'ai-ethics-and-responsible-ai',
  'AI Ethics: Building Responsible AI Systems',
  'Understanding the ethical implications of AI and how developers and companies can build more responsible systems.',
  '## Introduction\n\nAs AI becomes more powerful, ethics becomes more critical than ever.\n\n## Bias in AI\n\nAI systems can inherit and amplify biases from training data, leading to unfair outcomes.\n\n## Transparency and Explainability\n\nBuilding AI systems that humans can understand and audit is essential for trust.\n\n## Privacy Concerns\n\nAI systems often require large amounts of data, raising serious privacy questions.\n\n## Conclusion\n\nResponsible AI is not optional — it is a necessity for a fair and equitable future.',
  'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800',
  'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=1200',
  '{"id": "5", "name": "AI Ethics", "slug": "ai-ethics"}',
  '[{"id": "10", "name": "Ethics", "slug": "ethics"}, {"id": "2", "name": "AI", "slug": "ai"}, {"id": "11", "name": "Responsible AI", "slug": "responsible-ai"}]',
  '{"id": "5", "name": "Emily Watson", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=emily", "bio": "Research Scientist at OpenResearch AI"}',
  NOW() - INTERVAL '2 days', 7, 1890, 156, 78, false, false, 4.5, 67
),

(
  'prompt-engineering-guide',
  'The Ultimate Guide to Prompt Engineering',
  'Master the art of writing effective prompts to get the best results from large language models like GPT and Claude.',
  '## Introduction\n\nPrompt engineering is one of the most valuable skills in the AI era.\n\n## What is Prompt Engineering?\n\nIt is the practice of designing inputs to guide AI models towards desired outputs.\n\n## Techniques\n\nZero-shot, few-shot, chain-of-thought, and role prompting are key techniques to master.\n\n## Best Practices\n\nBe specific, provide context, use examples, and iterate based on outputs.\n\n## Conclusion\n\nGreat prompt engineering can dramatically improve AI output quality and reliability.',
  'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=800',
  'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=1200',
  '{"id": "3", "name": "NLP", "slug": "nlp"}',
  '[{"id": "6", "name": "LLMs", "slug": "llms"}, {"id": "12", "name": "Prompt Engineering", "slug": "prompt-engineering"}, {"id": "7", "name": "GPT", "slug": "gpt"}]',
  '{"id": "6", "name": "Daniel Okafor", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel", "bio": "CTO at Nexus Ventures"}',
  NOW() - INTERVAL '1 day', 11, 4560, 389, 178, true, true, 4.9, 198
);
