# System Architecture Document

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack Query     |
|                                                                                   |
|  - Public Portal: Homepage, Archive, Search, Article View, Directories           |
|  - Auth & Profile: Login, Registration, Password Management                       |
|  - Editorial CMS: Dashboard, TipTap Editor, Workflow, Moderation, Media Library   |
+-----------------------------------------------------------------------------------+
                                        |  REST API / JSON
                                        v
+-----------------------------------------------------------------------------------+
|                                BACKEND TIER (NestJS)                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Modules: Auth, Users, Articles, Publishers, Newspapers, Authors, Categories |  |
|  |          Comments, Media, Search, Analytics, Publishing, Migration, Settings|  |
|  +-----------------------------------------------------------------------------+  |
|  | Common: AuthGuards, RolesGuard, ValidationPipe, GlobalExceptionFilter      |  |
|  | Prisma ORM: Data layer abstraction & query builder                          |  |
+-----------------------------------------------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
+----------------------------------+          +----------------------------------+
|      TARGET DATABASE (Postgres)   |          |      LEGACY SOURCE (MySQL)       |
|  PostgreSQL 16+                  |          |  MySQL 8.0 (`rightsnow`)         |
|  utf8mb4 / Full-Text Indexed     |          |  5,631 Articles, 100 Pages       |
|  Prisma Schema & Migrations      |          |  Historical Archive 2010 - 2021  |
+----------------------------------+          +----------------------------------+
```

## Modular Structure

### Frontend (`frontend/src/`)
- `components/common/`: Site-wide UI (Header, Footer, Navbar, Pagination, Loaders).
- `components/articles/`: Article display cards, grid listings, detail view, related news.
- `components/filters/`: SearchBar, YearFilter, PublisherFilter, CategoryFilter, AuthorFilter.
- `components/comments/`: Comment list, submission form, moderation cards.
- `components/editor/`: TipTap rich text integration and image uploading.
- `pages/public/`: Public reader views (Home, Articles, Archive, Directories, About).
- `pages/dashboard/`: Editorial management panels (Articles, Media, Comments, Analytics).
- `services/`: Axios HTTP client and domain-specific API consumers.
- `store/`: Zustand / lightweight React state for auth and active filter states.

### Backend (`backend/src/`)
- `modules/articles/`: Public reading, discovery, full-text search, filtering, and CMS CRUD.
- `modules/publishers/` & `modules/newspapers/`: Publisher organization entities and newspaper editions.
- `modules/authors/`: Author profile management and author publication catalogs.
- `modules/auth/`: JWT authentication, bcrypt hashing, Passport strategies, and guards.
- `modules/comments/`: Threaded comments and moderation workflows.
- `modules/media/`: File uploads, S3 / local disk drivers, and image metadata.
- `modules/migration/`: Deterministic ETL scripts reading legacy MySQL into PostgreSQL.
