# System Requirements Specification (SRS)
## News Publishing & Searchable Digital Archive

---

## 1. Functional Requirements

### FR-01: User Accounts & RBAC
- **Roles**: Super Admin, Editor, Author, Reader.
- Role-based authorization enforced server-side on every protected API endpoint.
- Registration, login, JWT access & refresh tokens, password reset, account status management.

### FR-02: Public Homepage & Discovery
- High-impact newspaper branding (Samabima & Rights Now archive).
- Hero section with featured top stories, breaking updates, category grids.
- Quick search bar with instant year, publisher, author, and category filters.

### FR-03: Searchable Archive & Discovery
- Full-text search across article title, excerpt, and body content.
- Multi-faceted filtering:
  - **Year / Date Range** (e.g., historical archive 2010–2021 + newly published)
  - **Publisher & Newspaper** (Samabima vs. Rights Now vs. Nihaluok Archive)
  - **Author** (individual contributors with biographical links)
  - **Category & Tag**
- Pagination, sorting (newest, oldest, most viewed), empty states, and shareable URL query state.

### FR-04: Article Reading & Typography
- Article view with headline, author, publishing date, publisher entity, and historical source link.
- Distinction between original historical publication date and import/update timestamps.
- Native Sinhala, Tamil, and English typography rendered with full Unicode ligature support.
- Image gallery, embedded media preservation, view count aggregation, and social sharing.

### FR-05: Entities & Directories
- Publisher directory & detail pages with descriptions, logos, and article catalogs.
- Newspaper editions / publications.
- Author directory & biographical profiles with their published works.

### FR-06: Editorial CMS & Publishing Workflow
- Lifecycle states: `DRAFT` → `IN_REVIEW` → `APPROVED` → `SCHEDULED` / `PUBLISHED` → `ARCHIVED`.
- Rich-text editor (TipTap), tags, categories, featured media selector.
- Granular permission checks: Authors submit drafts, Editors/Admins review and publish.

### FR-07: Moderated Comments & Reader Engagement
- Reader comments and replies with nested threading.
- Moderation queue: Pending, Approved, Rejected, Spam.
- Only approved comments are visible publicly.

### FR-08: Media Management
- File upload validation (MIME types, maximum size, safe slugification).
- Automatic thumbnail generation and metadata management (alt text, photo credits).

### FR-09: Dashboard & Reporting
- Real-time editorial analytics: article counts by status, year, publisher, and author.
- View count tracking and comment moderation alerts.

### FR-10: Legacy ETL & Data Provenance
- Deterministic migration from historical MySQL database dumps (`rightsnow`).
- Legacy ID preservation, original URLs, duplicate detection, and import reconciliation logs.

---

## 2. Non-Functional Requirements

- **Encoding**: UTF-8 / `utf8mb4` everywhere to preserve Sinhala ligatures and special characters without mojibake.
- **Security**: Password hashing with Argon2/Bcrypt, sanitized rich-text HTML against XSS, CORS and rate limiting.
- **Performance**: PostgreSQL indexes on `publishedAt`, `slug`, `publisherId`, `newspaperId`, `authorId`, and full-text search index.
- **Accessibility**: WCAG 2.2 AA compliance, keyboard navigation, accessible contrast.
