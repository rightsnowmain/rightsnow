# News Publishing & Searchable Digital Archive System

A modern, high-performance news publishing platform and historical digital archive built on top of consolidated newspaper and publication records (Samabima & Rights Now archive).

---

## Architecture Overview

```
news-publishing-system/
├── frontend/                          # React + TypeScript + Vite + Tailwind CSS + TanStack Query
├── backend/                           # NestJS + Prisma ORM + PostgreSQL + Swagger
├── database/                          # Migration schemas and deterministic ETL scripts
├── docs/                              # Comprehensive engineering specifications & ADRs
├── infrastructure/                    # Docker, Nginx, and Compose configurations
└── scripts/                           # Local setup & deployment automation
```

### Key Technical Highlights
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, TanStack Query, React Router v6.
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL (16+), Swagger OpenAPI v3, Class-Validator DTOs.
- **Unicode Integrity**: Native `utf8mb4` support across the stack ensuring zero mojibake for Sinhala, Tamil, and English typography.
- **Historical Provenance**: Preserves original article dates, legacy IDs, source database lineage, and associated media mappings.

---

## Quick Start (Development)

### 1. Prerequisites
- **Node.js**: v20+ (tested on v22.16)
- **PostgreSQL**: 16+ running on port `5432`
- **npm**: v10+

### 2. Configure Environment
Copy `.env.example` in both root and backend:
```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

### 3. Database Setup (Prisma)
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
```

### 4. Run Development Servers
From the root directory:
```bash
# Start backend API (http://localhost:3000/api/v1 - Swagger: http://localhost:3000/api/docs)
npm run dev:api

# Start frontend application (http://localhost:5173)
npm run dev
```

---

## Documentation Index
- [System Requirements](docs/requirements.md)
- [System Architecture](docs/architecture.md)
- [Database Design & Prisma Schema](docs/database-design.md)
- [API Documentation](docs/api-documentation.md)
- [Sprint Delivery Plan](docs/sprint-plan.md)
- [Deployment Guide](docs/deployment-guide.md)
