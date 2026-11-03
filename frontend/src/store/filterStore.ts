export interface FilterState {
  q?: string;
  year?: number;
  publisherId?: string;
  authorId?: string;
  categoryId?: string;
  sort: 'newest' | 'oldest' | 'popular';
  page: number;
}

export const initialFilterState: FilterState = {
  sort: 'newest',
  page: 1,
};
