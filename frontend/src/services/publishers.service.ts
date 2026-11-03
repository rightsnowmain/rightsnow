import api from './api';
import { Author, Category, Newspaper, Publisher } from '../types';

export const PublishersService = {
  getPublishers: async (): Promise<Publisher[]> => {
    const res = await api.get('/publishers');
    return res.data;
  },

  getPublisherBySlug: async (slug: string): Promise<Publisher & { articles: any[] }> => {
    const res = await api.get(`/publishers/${slug}`);
    return res.data;
  },

  getNewspapers: async (): Promise<Newspaper[]> => {
    const res = await api.get('/newspapers');
    return res.data;
  },

  getNewspaperBySlug: async (slug: string): Promise<Newspaper & { articles: any[] }> => {
    const res = await api.get(`/newspapers/${slug}`);
    return res.data;
  },

  getAuthors: async (): Promise<Author[]> => {
    const res = await api.get('/authors');
    return res.data;
  },

  getAuthorBySlug: async (slug: string): Promise<Author & { articles: any[] }> => {
    const res = await api.get(`/authors/${slug}`);
    return res.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data;
  },
};
