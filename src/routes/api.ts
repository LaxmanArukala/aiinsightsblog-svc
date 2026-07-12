import { Router } from 'express';
import blogRoutes from '../modules/blogs/blog.routes';
import testimonialRoutes from '../modules/testimonials/testimonial.routes';
import authorRoutes from '../modules/authors/author.routes';
import contactRoutes from '../modules/contacts/contact.routes';
import subscriberRoutes from '../modules/subscribers/subscriber.routes';
import categoryRoutes from '../modules/categories/category.routes';
import authRoutes from '../modules/auth/auth.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import { allCommentsRouter } from '../modules/comments/comment.routes';
import { allReviewsRouter } from '../modules/reviews/review.routes';

const api = Router();

// ── Blogs ─────────────────────────────────────────────────────────────────────
// GET    /api/v1/blogs                  - List blogs (pagination + search)
// GET    /api/v1/blogs/generate         - Generate a blog post via AI (?topic=)
// GET    /api/v1/blogs/ai-list          - Generate blog list via AI (?category=&count=)
// GET    /api/v1/blogs/:id              - Get blog by id
// POST   /api/v1/blogs                  - Create a blog
// PUT    /api/v1/blogs/:id              - Update a blog by id
// DELETE /api/v1/blogs/:id              - Delete a blog by id
api.use('/blogs', blogRoutes);

// ── Comments ──────────────────────────────────────────────────────────────────
// GET    /api/v1/comments               - List all comments across all blogs (?page=&limit=&status=)
api.use('/comments', allCommentsRouter);

// ── Reviews ───────────────────────────────────────────────────────────────────
// GET    /api/v1/reviews                - List all reviews across all blogs (?page=&limit=&rating=&status=)
api.use('/reviews', allReviewsRouter);

// ── Testimonials ──────────────────────────────────────────────────────────────
// GET    /api/v1/testimonials           - List testimonials (?page=&limit=&rating=)
// GET    /api/v1/testimonials/:id       - Get testimonial by id
// POST   /api/v1/testimonials           - Create a testimonial
// PATCH  /api/v1/testimonials/:id       - Update a testimonial
// DELETE /api/v1/testimonials/:id       - Delete a testimonial
api.use('/testimonials', testimonialRoutes);

// ── Authors ───────────────────────────────────────────────────────────────────
// GET    /api/v1/authors                - List authors (?page=&limit=&search=)
// GET    /api/v1/authors/:id            - Get author by id
// POST   /api/v1/authors                - Create an author
// PATCH  /api/v1/authors/:id            - Update an author
// DELETE /api/v1/authors/:id            - Delete an author
api.use('/authors', authorRoutes);

// ── Contacts ──────────────────────────────────────────────────────────────────
// GET    /api/v1/contacts               - List contacts (?page=&limit=)
// POST   /api/v1/contacts               - Create a contact
// DELETE /api/v1/contacts/:id           - Delete a contact
api.use('/contacts', contactRoutes);

// ── Subscribers ───────────────────────────────────────────────────────────────
// GET    /api/v1/subscribers              - List subscribers (?page=&limit=&status=)
// GET    /api/v1/subscribers/:id          - Get subscriber by id
// POST   /api/v1/subscribers              - Subscribe (requires email)
// PUT    /api/v1/subscribers/:id          - Update subscriber
// DELETE /api/v1/subscribers/:id          - Delete subscriber
api.use('/subscribers', subscriberRoutes);

// ── Categories ────────────────────────────────────────────────────────────────
// GET    /api/v1/categories               - List categories (?page=&limit=)
// GET    /api/v1/categories/:id           - Get category by id
// POST   /api/v1/categories               - Create a category
// PUT    /api/v1/categories/:id           - Update a category
// DELETE /api/v1/categories/:id           - Delete a category
api.use('/categories', categoryRoutes);

// ── Dashboard ─────────────────────────────────────────────────────────────────
// GET    /api/v1/dashboard               - Counts: blogs, authors, testimonials, reviews, comments, contacts, subscribers
api.use('/dashboard', dashboardRoutes);

// ── Auth ──────────────────────────────────────────────────────────────────────
// POST   /api/v1/auth/login               - Login (email + password → tokens)
// POST   /api/v1/auth/refresh             - Refresh tokens
// POST   /api/v1/auth/logout              - Logout (revoke refresh token)
api.use('/auth', authRoutes);

export default api;
