-- Initial PostgreSQL Schema Definition for News Publishing & Digital Archive
-- Generated for PostgreSQL 16+

CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR', 'READER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- Core Tables will be provisioned and kept in sync by Prisma ORM
-- Target Database: news_publishing_db
-- Collation: utf8mb4 / UTF-8
