import { Router } from 'express';
import blogRoutes from '../modules/blogs/blog.routes';
import testimonialRoutes from '../modules/testimonials/testimonial.routes';

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

// ── Testimonials ──────────────────────────────────────────────────────────────
// GET    /api/v1/testimonials           - List testimonials (?page=&limit=&rating=)
// GET    /api/v1/testimonials/:id       - Get testimonial by id
// POST   /api/v1/testimonials           - Create a testimonial
// PATCH  /api/v1/testimonials/:id       - Update a testimonial
// DELETE /api/v1/testimonials/:id       - Delete a testimonial
api.use('/testimonials', testimonialRoutes);

export default api;
