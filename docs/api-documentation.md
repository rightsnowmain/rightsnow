# REST API Contract Specification
Base URL: `/api/v1`
Interactive Swagger Docs: `/api/docs`

---

## 1. Public Discovery Endpoints

### `GET /api/v1/articles`
Search and filter published articles.
- **Query Parameters**:
  - `q`: Search keyword in title or content
  - `year`: Filter by publication year (e.g., `2018`, `2021`)
  - `from`, `to`: ISO Date range filters
  - `publisherId`: Filter by publisher UUID
  - `newspaperId`: Filter by newspaper UUID
  - `authorId`: Filter by author UUID
  - `categoryId`: Filter by category UUID
  - `sort`: `newest` (default), `oldest`, `popular`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "article-slug",
      "title": "හෙළිදරව්ව",
      "excerpt": "...",
      "featuredImage": "/uploads/image.jpg",
      "originalPublishedAt": "2018-05-12T10:00:00Z",
      "author": { "name": "සමන් කුමාර" },
      "newspaper": { "name": "සමබිම පුවත්පත" },
      "categories": [{ "name": "දේශපාලන" }]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 5631,
    "totalPages": 470
  }
}
```

### `GET /api/v1/articles/:slug`
Fetch full article detail by unique slug.
- Increments `viewCount` atomically.
- Returns full HTML/Markdown body, media gallery, author bio, newspaper details, and related articles.

### `GET /api/v1/filters`
Fetch aggregated filter options available in the archive:
- Available years with counts.
- Publishers list.
- Newspapers list.
- Categories list.
- Authors list.

---

## 2. Authentication Endpoints

- `POST /api/v1/auth/login`: Email and password login, returns JWT access and refresh tokens.
- `POST /api/v1/auth/register`: Public reader registration.
- `POST /api/v1/auth/refresh`: Rotate access token using valid refresh token.
- `GET /api/v1/auth/me`: Authenticated profile details.

---

## 3. Editorial & Management Endpoints (Protected)

- `GET /api/v1/admin/articles`: Filter all articles across all workflow statuses (`DRAFT`, `IN_REVIEW`, etc.).
- `POST /api/v1/admin/articles`: Create new draft article.
- `PATCH /api/v1/admin/articles/:id`: Update article content.
- `POST /api/v1/admin/articles/:id/submit`: Submit draft for editorial review.
- `POST /api/v1/admin/articles/:id/approve`: Approve article for publishing.
- `POST /api/v1/admin/articles/:id/publish`: Publish immediately or schedule publication.
- `GET /api/v1/admin/analytics`: Aggregate statistics (counts by status, year, publisher, category).
