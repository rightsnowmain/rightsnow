import React from 'react';
import { Author } from '../../types';

interface AuthorFilterProps {
  authors: Author[];
  selectedId?: string;
  onSelect: (id?: string) => void;
}

export const AuthorFilter: React.FC<AuthorFilterProps> = ({
  authors,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">කතුවරයා (Author)</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || undefined)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
      >
        <option value="">සියලු කතුවරුන් (All Authors)</option>
        {authors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AuthorFilter;
