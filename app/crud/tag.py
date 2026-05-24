from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Tag, Blog
from app.schemas import TagCreate


def get_tag(db: Session, tag_id: int) -> Optional[Tag]:
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_slug(db: Session, slug: str) -> Optional[Tag]:
    return db.query(Tag).filter(Tag.slug == slug).first()


def get_tags(db: Session) -> List[Tag]:
    return db.query(Tag).order_by(Tag.name).all()


def get_tags_with_count(db: Session) -> List[dict]:
    results = db.query(
        Tag.id,
        Tag.name,
        Tag.slug,
        func.count(Blog.id).label('blog_count')
    ).outerjoin(Blog.tags).group_by(Tag.id).order_by(Tag.name).all()

    return [
        {
            'id': r.id,
            'name': r.name,
            'slug': r.slug,
            'count': r.blog_count
        }
        for r in results
    ]


def create_tag(db: Session, tag: TagCreate) -> Tag:
    db_tag = Tag(name=tag.name, slug=tag.slug)

    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int) -> bool:
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return False

    db.delete(db_tag)
    db.commit()
    return True
