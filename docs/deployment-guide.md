# Deployment & Operations Guide

## 1. Local Development Setup

### Direct Node.js & Local PostgreSQL
1. Ensure PostgreSQL is running on port 5432 with database `news_publishing_db`:
   ```sql
   CREATE DATABASE news_publishing_db;
   ```
2. Initialize backend:
   ```bash
   cd news-publishing-system/backend
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run start:dev
   ```
3. Initialize frontend:
   ```bash
   cd news-publishing-system/frontend
   npm install
   npm run dev
   ```

---

## 2. Docker Container Deployment

Use Docker Compose for an isolated production-ready deployment:
```bash
cd news-publishing-system
docker-compose -f infrastructure/docker-compose.yml up --build -d
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/docs`

---

## 3. Database Backup & Restore Procedures

### Automated Backup
```bash
pg_dump -U postgres -h localhost -d news_publishing_db -F c -b -v -f ./database/backups/news_backup_$(date +%Y%m%d).dump
```

### Restore Drill
```bash
pg_restore -U postgres -h localhost -d news_publishing_db -v -c ./database/backups/news_backup_YYYYMMDD.dump
```
