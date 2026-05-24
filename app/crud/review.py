from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Review
from app.schemas import ReviewCreate, ReviewUpdate


def get_review(db: Session, review_id: int) -> Optional[Review]:
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews_by_blog(
    db: Session,
    blog_id: int,
    page: int = 1,
    per_page: int = 10
) -> Tuple[List[Review], int]:
    query = db.query(Review).filter(
        Review.blog_id == blog_id,
        Review.is_approved == True
    ).order_by(Review.created_at.desc())

    total = query.count()
    offset = (page - 1) * per_page
    reviews = query.offset(offset).limit(per_page).all()

    return reviews, total


def create_review(db: Session, review: ReviewCreate) -> Review:
    db_review = Review(
        rating=review.rating,
        title=review.title,
        content=review.content,
        author_name=review.author_name,
        author_email=review.author_email,
        author_avatar=review.author_avatar,
        blog_id=review.blog_id
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    update_blog_rating(db, review.blog_id)

    return db_review


def update_review(db: Session, review_id: int, review: ReviewUpdate) -> Optional[Review]:
    db_review = get_review(db, review_id)
    if not db_review:
        return None

    blog_id = db_review.blog_id

    update_data = review.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_review, field, value)

    db.commit()
    db.refresh(db_review)

    if review.rating is not None:
        update_blog_rating(db, blog_id)

    return db_review


def delete_review(db: Session, review_id: int) -> bool:
    db_review = get_review(db, review_id)
    if not db_review:
        return False

    blog_id = db_review.blog_id

    db.delete(db_review)
    db.commit()

    update_blog_rating(db, blog_id)

    return True


def update_blog_rating(db: Session, blog_id: int) -> None:
    from app.models import Blog

    result = db.query(func.avg(Review.rating)).filter(
        Review.blog_id == blog_id,
        Review.is_approved == True
    ).scalar()

    avg_rating = float(result) if result else 0.0

    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog:
        blog.rating = round(avg_rating, 1)
        db.commit()
