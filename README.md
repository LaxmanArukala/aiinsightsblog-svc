# AI Insights Hub Backend

FastAPI backend for the AI Insights Blog Platform.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

### 4. Create PostgreSQL Database

```sql
CREATE DATABASE ai_insights;
```

### 5. Run the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   ├── core/             # Config and database
│   ├── crud/             # CRUD operations
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── main.py           # FastAPI app
├── requirements.txt
└── .env.example
```

## API Endpoints

### Blogs
- `GET /api/v1/blogs` - List all blogs (with filters)
- `GET /api/v1/blogs/featured` - Get featured blogs
- `GET /api/v1/blogs/{slug}` - Get blog by slug
- `GET /api/v1/blogs/{slug}/related` - Get related blogs
- `POST /api/v1/blogs/{id}/like` - Like a blog
- `POST /api/v1/blogs/{id}/bookmark` - Bookmark a blog

### Comments
- `GET /api/v1/comments/blog/{blog_id}` - Get comments for blog
- `POST /api/v1/comments` - Create comment
- `PATCH /api/v1/comments/{id}` - Update comment
- `POST /api/v1/comments/{id}/like` - Like comment
- `DELETE /api/v1/comments/{id}` - Delete comment

### Reviews
- `GET /api/v1/reviews/blog/{blog_id}` - Get reviews for blog
- `POST /api/v1/reviews` - Create review
- `PATCH /api/v1/reviews/{id}` - Update review
- `DELETE /api/v1/reviews/{id}` - Delete review

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/{slug}` - Get category by slug
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

### Tags
- `GET /api/v1/tags` - List all tags
- `GET /api/v1/tags/{slug}` - Get tag by slug
- `POST /api/v1/tags` - Create tag
- `DELETE /api/v1/tags/{id}` - Delete tag
```

## Query Parameters

### Blog Filtering
```
GET /api/v1/blogs?search=ai&category=machine-learning&tags=python,tensorflow&sort=latest&page=1&per_page=12
```

- `search` - Search in title, excerpt, content
- `category` - Filter by category slug
- `tags` - Comma-separated tag slugs
- `sort` - `latest`, `popular`, `most_liked`, `top_rated`
- `page` - Page number
- `per_page` - Results per page (default: 12)
