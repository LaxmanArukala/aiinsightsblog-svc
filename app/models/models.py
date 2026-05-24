from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, Table
from sqlalchemy.orm import relationship
from app.core.database import Base


blog_tags = Table(
    'blog_tags',
    Base.metadata,
    Column('blog_id', Integer, ForeignKey('blogs.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(7), default='#3b82f6')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    blogs = relationship('Blog', back_populates='category', cascade='all, delete-orphan')


class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    blogs = relationship('Blog', secondary=blog_tags, back_populates='tags')


class Blog(Base):
    __tablename__ = 'blogs'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    featured_image = Column(String(500), nullable=True)
    thumbnail = Column(String(500), nullable=True)

    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    author_id = Column(Integer, ForeignKey('authors.id', ondelete='SET NULL'), nullable=True)

    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    bookmarks = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    read_time = Column(Integer, default=5)
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)

    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship('Category', back_populates='blogs')
    author = relationship('Author', back_populates='blogs')
    tags = relationship('Tag', secondary=blog_tags, back_populates='blogs')
    comments = relationship('Comment', back_populates='blog', cascade='all, delete-orphan')
    reviews = relationship('Review', back_populates='blog', cascade='all, delete-orphan')


class Author(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    twitter = Column(String(100), nullable=True)
    linkedin = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    blogs = relationship('Blog', back_populates='author')


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_name = Column(String(100), nullable=False)
    author_email = Column(String(255), nullable=True)
    author_avatar = Column(String(500), nullable=True)

    blog_id = Column(Integer, ForeignKey('blogs.id', ondelete='CASCADE'), nullable=False)
    parent_id = Column(Integer, ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)

    likes = Column(Integer, default=0)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    blog = relationship('Blog', back_populates='comments')
    replies = relationship('Comment', backref='parent', remote_side=[id], cascade='all, delete-orphan')


class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    author_name = Column(String(100), nullable=False)
    author_email = Column(String(255), nullable=True)
    author_avatar = Column(String(500), nullable=True)

    blog_id = Column(Integer, ForeignKey('blogs.id', ondelete='CASCADE'), nullable=False)

    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    blog = relationship('Blog', back_populates='reviews')
