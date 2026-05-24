from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Category, Blog
from app.schemas import CategoryCreate, CategoryUpdate


def get_category(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_slug(db: Session, slug: str) -> Optional[Category]:
    return db.query(Category).filter(Category.slug == slug).first()


def get_categories(db: Session) -> List[Category]:
    return db.query(Category).order_by(Category.name).all()


def get_categories_with_count(db: Session) -> List[dict]:
    results = db.query(
        Category.id,
        Category.name,
        Category.slug,
        Category.color,
        func.count(Blog.id).label('blog_count')
    ).outerjoin(Blog).group_by(Category.id).order_by(Category.name).all()

    return [
        {
            'id': r.id,
            'name': r.name,
            'slug': r.slug,
            'color': r.color,
            'count': r.blog_count
        }
        for r in results
    ]


def create_category(db: Session, category: CategoryCreate) -> Category:
    db_category = Category(
        name=category.name,
        slug=category.slug,
        description=category.description,
        color=category.color
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: CategoryUpdate) -> Optional[Category]:
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category(db, category_id)
    if not db_category:
        return False

    db.delete(db_category)
    db.commit()
    return True
