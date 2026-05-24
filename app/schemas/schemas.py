from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color: str = '#3b82f6'


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryWithCount(CategoryResponse):
    blog_count: int = 0


class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthorBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorResponse(AuthorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlogBase(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    thumbnail: Optional[str] = None
    read_time: int = 5
    is_featured: bool = False
    is_published: bool = True


class BlogCreate(BlogBase):
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    tag_ids: List[int] = []


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    thumbnail: Optional[str] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    read_time: Optional[int] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    tag_ids: Optional[List[int]] = None


class CategoryInBlog(BaseModel):
    id: int
    name: str
    slug: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class AuthorInBlog(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TagInBlog(BaseModel):
    id: int
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


class BlogResponse(BlogBase):
    id: int
    views: int
    likes: int
    bookmarks: int
    rating: float
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryInBlog] = None
    author: Optional[AuthorInBlog] = None
    tags: List[TagInBlog] = []

    model_config = ConfigDict(from_attributes=True)


class BlogListResponse(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str
    thumbnail: Optional[str] = None
    views: int
    likes: int
    read_time: int
    is_featured: bool
    published_at: Optional[datetime] = None
    category: Optional[CategoryInBlog] = None
    author: Optional[AuthorInBlog] = None
    tags: List[TagInBlog] = []

    model_config = ConfigDict(from_attributes=True)


class CommentBase(BaseModel):
    content: str
    author_name: str
    author_email: Optional[str] = None
    author_avatar: Optional[str] = None


class CommentCreate(CommentBase):
    blog_id: int
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_approved: Optional[bool] = None


class CommentResponse(CommentBase):
    id: int
    blog_id: int
    parent_id: Optional[int] = None
    likes: int
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommentWithReplies(CommentResponse):
    replies: List['CommentWithReplies'] = []


class ReviewBase(BaseModel):
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    author_name: str
    author_email: Optional[str] = None
    author_avatar: Optional[str] = None


class ReviewCreate(ReviewBase):
    blog_id: int


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_approved: Optional[bool] = None


class ReviewResponse(ReviewBase):
    id: int
    blog_id: int
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel):
    data: List
    total: int
    page: int
    per_page: int
    total_pages: int


class BlogSearchFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    sort: str = 'latest'
    page: int = 1
    per_page: int = 12
