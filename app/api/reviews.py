from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import review as review_crud
from app.schemas import ReviewCreate, ReviewUpdate, ReviewResponse, PaginatedResponse


router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/blog/{blog_id}", response_model=PaginatedResponse)
def get_reviews(
    blog_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    reviews, total = review_crud.get_reviews_by_blog(db, blog_id, page, per_page)

    total_pages = (total + per_page - 1) // per_page

    return PaginatedResponse(
        data=[ReviewResponse.model_validate(r) for r in reviews],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.post("", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    return review_crud.create_review(db, review)


@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, review: ReviewUpdate, db: Session = Depends(get_db)):
    updated = review_crud.update_review(db, review_id, review)
    if not updated:
        raise HTTPException(status_code=404, detail="Review not found")
    return updated


@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    success = review_crud.delete_review(db, review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted successfully"}
