from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from app.models import Comment
from app.schemas import CommentCreate, CommentUpdate


def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    return db.query(Comment).filter(Comment.id == comment_id).first()


def get_comments_by_blog(
    db: Session,
    blog_id: int,
    page: int = 1,
    per_page: int = 20
) -> Tuple[List[Comment], int]:
    query = db.query(Comment).options(
        joinedload(Comment.replies)
    ).filter(
        Comment.blog_id == blog_id,
        Comment.is_approved == True,
        Comment.parent_id == None
    ).order_by(Comment.created_at.desc())

    total = query.count()
    offset = (page - 1) * per_page
    comments = query.offset(offset).limit(per_page).all()

    return comments, total


def create_comment(db: Session, comment: CommentCreate) -> Comment:
    db_comment = Comment(
        content=comment.content,
        author_name=comment.author_name,
        author_email=comment.author_email,
        author_avatar=comment.author_avatar,
        blog_id=comment.blog_id,
        parent_id=comment.parent_id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def update_comment(db: Session, comment_id: int, comment: CommentUpdate) -> Optional[Comment]:
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None

    update_data = comment.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_comment, field, value)

    db.commit()
    db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int) -> bool:
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return False

    db.delete(db_comment)
    db.commit()
    return True


def toggle_comment_like(db: Session, comment_id: int) -> Optional[int]:
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None

    db_comment.likes += 1
    db.commit()
    return db_comment.likes
