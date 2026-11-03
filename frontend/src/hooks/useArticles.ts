import { useQuery } from '@tanstack/react-query';
import { ArticlesService, ArticleFilters } from '../services/articles.service';

export const useArticles = (filters: ArticleFilters = {}) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => ArticlesService.getArticles(filters),
  });
};

export const useArticleDetail = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => ArticlesService.getArticleBySlug(slug),
    enabled: !!slug,
  });
};
