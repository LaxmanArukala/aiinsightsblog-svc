from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    blogs_router,
    comments_router,
    reviews_router,
    categories_router,
    tags_router
)


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blogs_router, prefix=settings.API_PREFIX)
app.include_router(comments_router, prefix=settings.API_PREFIX)
app.include_router(reviews_router, prefix=settings.API_PREFIX)
app.include_router(categories_router, prefix=settings.API_PREFIX)
app.include_router(tags_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Insights Hub API",
        "docs": "/docs",
        "version": settings.APP_VERSION
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
