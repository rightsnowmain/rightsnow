import { useQuery } from '@tanstack/react-query';
import { ArticlesService } from '../services/articles.service';

export const useFilters = () => {
  return useQuery({
    queryKey: ['filters'],
    queryFn: () => ArticlesService.getAvailableFilters(),
  });
};
