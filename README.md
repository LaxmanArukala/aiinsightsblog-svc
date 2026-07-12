# AI Insights Blog — Backend API

Express + TypeScript REST API powering [aiinsightsblogs.com](https://aiinsightsblogs.com). Handles blog management, AI article generation (Groq + Gemini), analytics, and user interactions.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (raw SQL via `pg`)
- **AI Providers:** Groq (`llama-3.3-70b-versatile`) · Gemini (`gemini-2.0-flash`)
- **Process Manager:** PM2
- **Deployment:** AWS EC2

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ai_insights_dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Run migrations
```bash
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const files = fs.readdirSync('migrations').filter(f => f.endsWith('.sql')).sort();
(async () => {
  for (const f of files) {
    await pool.query(fs.readFileSync('migrations/' + f, 'utf8'));
    console.log('Applied:', f);
  }
  pool.end();
})();
"
```

### 4. Start development server
```bash
npm run dev       # hot-reload via ts-node-dev
npm run build     # compile TypeScript → dist/
npm start         # run compiled output
```

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and receive JWT tokens |
| POST | `/auth/refresh` | Refresh access token |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blogs` | List blogs (pagination, search, filter, sort) |
| GET | `/blogs/:id` | Get blog by ID |
| POST | `/blogs` | Create blog |
| PATCH | `/blogs/:id` | Update blog |
| DELETE | `/blogs/:id` | Delete blog |
| GET | `/blogs/related?category_id=&limit=` | Get related blogs by category |
| GET | `/blogs/generate?topic=` | AI-generate a full blog post |
| GET | `/blogs/ai-list?category=&count=` | AI-generate a list of blog previews |

**Query params for GET `/blogs`:**
- `page`, `limit` — pagination
- `search` — title/excerpt search
- `sort` — `latest` · `oldest` · `most_liked` · `most_viewed` · `top_rated` · `trending`
- `featured` — `true` / `false`
- `category` — category slug
- `category_name` — category name (case-insensitive)

### Analytics
All analytics endpoints are nested under `/blogs/:blogId/`.
Send `x-visitor-id` header (UUID from localStorage) for per-user tracking. IP is always captured as a fallback.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/blogs/:blogId/views` | Record a view (24h dedup by visitor + IP) |
| GET | `/blogs/:blogId/views` | Get view count |
| POST | `/blogs/:blogId/likes` | Toggle like on/off |
| GET | `/blogs/:blogId/likes` | Get like count + liked status |
| POST | `/blogs/:blogId/bookmarks` | Toggle bookmark on/off |
| GET | `/blogs/:blogId/bookmarks` | Get bookmark count + bookmarked status |
| POST | `/blogs/:blogId/shares` | Record a share (body: `{ platform: "twitter" }`) |
| GET | `/blogs/:blogId/shares` | Get share count |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews` | List all reviews across all blogs (`page`, `limit`, `rating`, `status`) |
| GET | `/blogs/:blogId/reviews` | List reviews for a blog |
| POST | `/blogs/:blogId/reviews` | Create a review |
| PATCH | `/blogs/:blogId/reviews/:id` | Update a review |
| DELETE | `/blogs/:blogId/reviews/:id` | Delete a review |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments` | List all comments across all blogs (`page`, `limit`, `status`) |
| GET | `/blogs/:blogId/comments` | List comments for a blog |
| POST | `/blogs/:blogId/comments` | Create a comment |
| PATCH | `/blogs/:blogId/comments/:id` | Update a comment |
| DELETE | `/blogs/:blogId/comments/:id` | Delete a comment |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Get category by ID |

### Authors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/authors` | List authors |
| GET | `/authors/:id` | Get author by ID |
| PATCH | `/authors/:id` | Update author |
| DELETE | `/authors/:id` | Delete author |

### Testimonials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/testimonials` | List testimonials |
| GET | `/testimonials/:id` | Get testimonial by ID |
| POST | `/testimonials` | Create testimonial |
| PATCH | `/testimonials/:id` | Update testimonial |
| DELETE | `/testimonials/:id` | Delete testimonial |

### Subscribers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscribers` | List subscribers |
| POST | `/subscribers` | Add subscriber |
| DELETE | `/subscribers/:id` | Remove subscriber |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contacts` | Submit a contact form |
| GET | `/contacts` | List contact submissions |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get summary stats (blogs, views, likes, etc.) |

---

## AI Article Generation (Cron)

`scripts/daily-article.js` runs on a cron schedule and auto-publishes SEO-optimised articles.

**Schedule (UTC):**
| Time | Provider | Model |
|------|----------|-------|
| 00:00, 08:00 | Groq | llama-3.3-70b-versatile |
| 12:00, 16:00, 20:00 | Gemini | gemini-2.0-flash |

**Cron entry (EC2):**
```
0 0,8,12,16,20 * * * /usr/bin/node /home/ec2-user/aiinsightsblog-svc/scripts/daily-article.js >> /home/ec2-user/logs/daily-article.log 2>&1
```

**SEO rules applied to every article:**
- Minimum 1800 words
- Single H1 containing the primary keyword
- H2 every 200–300 words with LSI keywords
- FAQ section at the end (3–5 questions)
- E-E-A-T signals (citations, author note, real use cases)
- Meta title + meta description generated per article

---

## Project Structure

```
src/
├── index.ts                  # Express app entry point
├── config.ts                 # Environment config
├── lib/
│   ├── db.ts                 # pg Pool singleton
│   ├── groq.ts               # Groq/OpenAI-compatible client
│   └── response.ts           # successResponse / errorResponse helpers
├── routes/
│   ├── index.ts              # Root router
│   └── api.ts                # /api/v1 router
└── modules/
    ├── analytics/            # Views, likes, bookmarks, shares
    ├── auth/                 # JWT login + refresh
    ├── authors/
    ├── blogs/                # Blog CRUD + AI generation
    ├── categories/
    ├── comments/
    ├── contacts/
    ├── dashboard/
    ├── reviews/
    ├── subscribers/
    └── testimonials/

migrations/                   # SQL migration files (run in order)
scripts/
├── daily-article.js          # AI article cron (Groq + Gemini)
└── trending-article.js       # Trending article cron
```

---

## Deployment (EC2)

```bash
# SSH into server
ssh -i "www.aiinsightblogs.com.pem" ec2-user@<ec2-public-dns>

# Pull latest and rebuild
cd ~/aiinsightsblog-svc
git pull origin main
npm install
npm run build
pm2 restart aiinsightsblog-svc
```

---

## Response Format

All endpoints return a consistent JSON shape:

```json
{
  "status": true,
  "message": "...",
  "data": { }
}
```

Error responses:
```json
{
  "status": false,
  "message": "...",
  "errors": ["..."]
}
```
