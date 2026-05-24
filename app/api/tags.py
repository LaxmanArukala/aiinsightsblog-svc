from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import tag as tag_crud
from app.schemas import TagCreate, TagResponse


router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[dict])
def get_tags(db: Session = Depends(get_db)):
    return tag_crud.get_tags_with_count(db)


@router.get("/{slug}", response_model=TagResponse)
def get_tag_by_slug(slug: str, db: Session = Depends(get_db)):
    tag = tag_crud.get_tag_by_slug(db, slug)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("", response_model=TagResponse)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    existing = tag_crud.get_tag_by_slug(db, tag.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Tag slug already exists")
    return tag_crud.create_tag(db, tag)


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    success = tag_crud.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}
