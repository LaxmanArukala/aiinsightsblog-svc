from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import blog as blog_crud
from app.schemas import (
    BlogCreate, BlogUpdate, BlogResponse, BlogListResponse,
    PaginatedResponse, CategoryInBlog, AuthorInBlog, TagInBlog
)
from app.models import Blog


router = APIRouter(prefix="/blogs", tags=["blogs"])


def blog_to_response(blog: Blog) -> BlogResponse:
    return BlogResponse(
        id=blog.id,
        title=blog.title,
        slug=blog.slug,
        excerpt=blog.excerpt,
        content=blog.content,
        featured_image=blog.featured_image,
        thumbnail=blog.thumbnail,
        read_time=blog.read_time,
        is_featured=blog.is_featured,
        is_published=blog.is_published,
        views=blog.views,
        likes=blog.likes,
        bookmarks=blog.bookmarks,
        rating=blog.rating,
        published_at=blog.published_at,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
        category=CategoryInBlog(
            id=blog.category.id,
            name=blog.category.name,
            slug=blog.category.slug,
            color=blog.category.color
        ) if blog.category else None,
        author=AuthorInBlog(
            id=blog.author.id,
            name=blog.author.name,
            avatar=blog.author.avatar
        ) if blog.author else None,
        tags=[TagInBlog(id=t.id, name=t.name, slug=t.slug) for t in blog.tags]
    )


def blog_to_list_response(blog: Blog) -> BlogListResponse:
    return BlogListResponse(
        id=blog.id,
        title=blog.title,
        slug=blog.slug,
        excerpt=blog.excerpt,
        thumbnail=blog.thumbnail,
        views=blog.views,
        likes=blog.likes,
        read_time=blog.read_time,
        is_featured=blog.is_featured,
        published_at=blog.published_at,
        category=CategoryInBlog(
            id=blog.category.id,
            name=blog.category.name,
            slug=blog.category.slug,
            color=blog.category.color
        ) if blog.category else None,
        author=AuthorInBlog(
            id=blog.author.id,
            name=blog.author.name,
            avatar=blog.author.avatar
        ) if blog.author else None,
        tags=[TagInBlog(id=t.id, name=t.name, slug=t.slug) for t in blog.tags]
    )


@router.get("", response_model=PaginatedResponse)
def get_blogs(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    sort: str = Query('latest'),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    tag_list = tags.split(',') if tags else []

    blogs, total = blog_crud.get_blogs(
        db,
        search=search,
        category_slug=category,
        tag_slugs=tag_list if tag_list else None,
        sort=sort,
        page=page,
        per_page=per_page
    )

    total_pages = (total + per_page - 1) // per_page

    return PaginatedResponse(
        data=[blog_to_list_response(b) for b in blogs],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.get("/featured", response_model=List[BlogListResponse])
def get_featured_blogs(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    blogs = blog_crud.get_featured_blogs(db, limit)
    return [blog_to_list_response(b) for b in blogs]


@router.get("/{slug}", response_model=BlogResponse)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    blog = blog_crud.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    blog_crud.increment_views(db, blog.id)
    return blog_to_response(blog)


@router.get("/{slug}/related", response_model=List[BlogListResponse])
def get_related_blogs(slug: str, db: Session = Depends(get_db)):
    blog = blog_crud.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    if not blog.category:
        return []

    related = blog_crud.get_related_blogs(db, blog.id, blog.category.id)
    return [blog_to_list_response(b) for b in related]


@router.post("/{blog_id}/like")
def like_blog(blog_id: int, db: Session = Depends(get_db)):
    likes = blog_crud.toggle_like(db, blog_id)
    if likes is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"likes": likes}


@router.post("/{blog_id}/bookmark")
def bookmark_blog(blog_id: int, db: Session = Depends(get_db)):
    bookmarks = blog_crud.toggle_bookmark(db, blog_id)
    if bookmarks is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"bookmarks": bookmarks}
