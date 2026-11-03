import React from 'react';
import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId?: string;
  onSelect: (id?: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">ප්‍රවර්ගය (Category)</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || undefined)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
      >
        <option value="">සියලු ප්‍රවර්ග (All Categories)</option>
        {(Array.isArray(categories) ? categories : []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c._count?.articles ? `(${c._count.articles})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
