from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import category as category_crud
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithCount


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[dict])
def get_categories(db: Session = Depends(get_db)):
    return category_crud.get_categories_with_count(db)


@router.get("/{slug}")
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = category_crud.get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse.model_validate(category)


@router.post("", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = category_crud.get_category_by_slug(db, category.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    return category_crud.create_category(db, category)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    updated = category_crud.update_category(db, category_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    success = category_crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
