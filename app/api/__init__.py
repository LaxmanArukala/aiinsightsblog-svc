from app.api.blogs import router as blogs_router
from app.api.comments import router as comments_router
from app.api.reviews import router as reviews_router
from app.api.categories import router as categories_router
from app.api.tags import router as tags_router

__all__ = [
    'blogs_router',
    'comments_router',
    'reviews_router',
    'categories_router',
    'tags_router'
]
