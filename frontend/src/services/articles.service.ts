import api from './api';
import { Article, FilterOptions, PaginatedResponse } from '../types';

export interface ArticleFilters {
  q?: string;
  year?: number;
  from?: string;
  to?: string;
  publisherId?: string;
  newspaperId?: string;
  authorId?: string;
  categoryId?: string;
  sort?: 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
}

export const ArticlesService = {
  getArticles: async (filters: ArticleFilters = {}): Promise<PaginatedResponse<Article>> => {
    const res = await api.get('/articles', { params: filters });
    return res.data;
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const res = await api.get(`/articles/${slug}`);
    return res.data;
  },

  getAvailableFilters: async (): Promise<FilterOptions> => {
    const res = await api.get('/filters');
    return res.data;
  },
};
