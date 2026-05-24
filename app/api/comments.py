from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import comment as comment_crud
from app.schemas import CommentCreate, CommentUpdate, CommentResponse, CommentWithReplies, PaginatedResponse


router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/blog/{blog_id}", response_model=PaginatedResponse)
def get_comments(
    blog_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    comments, total = comment_crud.get_comments_by_blog(db, blog_id, page, per_page)

    total_pages = (total + per_page - 1) // per_page

    def comment_to_response(comment):
        return CommentWithReplies(
            id=comment.id,
            content=comment.content,
            author_name=comment.author_name,
            author_email=comment.author_email,
            author_avatar=comment.author_avatar,
            blog_id=comment.blog_id,
            parent_id=comment.parent_id,
            likes=comment.likes,
            is_approved=comment.is_approved,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            replies=[comment_to_response(r) for r in comment.replies] if comment.replies else []
        )

    return PaginatedResponse(
        data=[comment_to_response(c) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.post("", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    return comment_crud.create_comment(db, comment)


@router.post("/{comment_id}/like")
def like_comment(comment_id: int, db: Session = Depends(get_db)):
    likes = comment_crud.toggle_comment_like(db, comment_id)
    if likes is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"likes": likes}


@router.patch("/{comment_id}", response_model=CommentResponse)
def update_comment(comment_id: int, comment: CommentUpdate, db: Session = Depends(get_db)):
    updated = comment_crud.update_comment(db, comment_id, comment)
    if not updated:
        raise HTTPException(status_code=404, detail="Comment not found")
    return updated


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    success = comment_crud.delete_comment(db, comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}
