from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_
from app.models import Blog, Category, Tag, Author, Comment, Review
from app.schemas import BlogCreate, BlogUpdate, BlogSearchFilters


def get_blog(db: Session, blog_id: int) -> Optional[Blog]:
    return db.query(Blog).options(
        joinedload(Blog.category),
        joinedload(Blog.author),
        joinedload(Blog.tags)
    ).filter(Blog.id == blog_id).first()


def get_blog_by_slug(db: Session, slug: str) -> Optional[Blog]:
    return db.query(Blog).options(
        joinedload(Blog.category),
        joinedload(Blog.author),
        joinedload(Blog.tags)
    ).filter(Blog.slug == slug).first()


def get_blogs(
    db: Session,
    search: Optional[str] = None,
    category_slug: Optional[str] = None,
    tag_slugs: Optional[List[str]] = None,
    sort: str = 'latest',
    page: int = 1,
    per_page: int = 12
) -> Tuple[List[Blog], int]:
    query = db.query(Blog).options(
        joinedload(Blog.category),
        joinedload(Blog.author),
        joinedload(Blog.tags)
    ).filter(Blog.is_published == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Blog.title.ilike(search_term),
                Blog.excerpt.ilike(search_term),
                Blog.content.ilike(search_term)
            )
        )

    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    if tag_slugs:
        query = query.join(Blog.tags).filter(Tag.slug.in_(tag_slugs))

    if sort == 'latest':
        query = query.order_by(desc(Blog.published_at))
    elif sort == 'popular':
        query = query.order_by(desc(Blog.views))
    elif sort == 'most_liked':
        query = query.order_by(desc(Blog.likes))
    elif sort == 'top_rated':
        query = query.order_by(desc(Blog.rating))

    total = query.count()
    offset = (page - 1) * per_page
    blogs = query.offset(offset).limit(per_page).all()

    return blogs, total


def get_featured_blogs(db: Session, limit: int = 5) -> List[Blog]:
    return db.query(Blog).options(
        joinedload(Blog.category),
        joinedload(Blog.author),
        joinedload(Blog.tags)
    ).filter(Blog.is_featured == True, Blog.is_published == True).order_by(desc(Blog.published_at)).limit(limit).all()


def get_related_blogs(
    db: Session,
    blog_id: int,
    category_id: int,
    limit: int = 5
) -> List[Blog]:
    return db.query(Blog).options(
        joinedload(Blog.category),
        joinedload(Blog.author),
        joinedload(Blog.tags)
    ).filter(
        Blog.id != blog_id,
        Blog.category_id == category_id,
        Blog.is_published == True
    ).order_by(desc(Blog.published_at)).limit(limit).all()


def create_blog(db: Session, blog: BlogCreate) -> Blog:
    db_blog = Blog(
        title=blog.title,
        slug=blog.slug,
        excerpt=blog.excerpt,
        content=blog.content,
        featured_image=blog.featured_image,
        thumbnail=blog.thumbnail,
        category_id=blog.category_id,
        author_id=blog.author_id,
        read_time=blog.read_time,
        is_featured=blog.is_featured,
        is_published=blog.is_published
    )

    if blog.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(blog.tag_ids)).all()
        db_blog.tags = tags

    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog


def update_blog(db: Session, blog_id: int, blog: BlogUpdate) -> Optional[Blog]:
    db_blog = get_blog(db, blog_id)
    if not db_blog:
        return None

    update_data = blog.model_dump(exclude_unset=True, exclude={'tag_ids'})

    for field, value in update_data.items():
        setattr(db_blog, field, value)

    if blog.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(blog.tag_ids)).all()
        db_blog.tags = tags

    db.commit()
    db.refresh(db_blog)
    return db_blog


def delete_blog(db: Session, blog_id: int) -> bool:
    db_blog = get_blog(db, blog_id)
    if not db_blog:
        return False

    db.delete(db_blog)
    db.commit()
    return True


def increment_views(db: Session, blog_id: int) -> Optional[Blog]:
    db_blog = get_blog(db, blog_id)
    if not db_blog:
        return None

    db_blog.views += 1
    db.commit()
    db.refresh(db_blog)
    return db_blog


def toggle_like(db: Session, blog_id: int) -> Optional[int]:
    db_blog = get_blog(db, blog_id)
    if not db_blog:
        return None

    db_blog.likes += 1
    db.commit()
    return db_blog.likes


def toggle_bookmark(db: Session, blog_id: int) -> Optional[int]:
    db_blog = get_blog(db, blog_id)
    if not db_blog:
        return None

    db_blog.bookmarks += 1
    db.commit()
    return db_blog.bookmarks
