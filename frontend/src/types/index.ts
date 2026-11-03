export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  _count?: { articles: number };
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  _count?: { articles: number };
}

export interface Newspaper {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  publisherId?: string;
  publisher?: Publisher;
  _count?: { articles: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { articles: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  legacyId?: number;
  legacySource?: string;
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  status?: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  originalPublishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  featuredImage?: string;
  sourceUrl?: string;
  viewCount: number;
  authorId?: string;
  author: Author;
  newspaperId?: string;
  newspaper?: Newspaper;
  publisherId?: string;
  publisher?: Publisher;
  categories: Category[];
  tags?: Tag[];
  relatedArticles?: Partial<Article>[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  years: number[];
  publishers: Publisher[];
  newspapers: Newspaper[];
  authors: Author[];
  categories: Category[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'READER';
}
