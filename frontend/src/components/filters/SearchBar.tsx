import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearch,
  placeholder = 'ශීර්ෂ පාඨ හෝ කරුණු ඔස්සේ සොයන්න...',
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-24 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-900 focus:border-transparent shadow-sm"
      />
      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
      <button
        type="submit"
        className="absolute right-2 top-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
      >
        සොයන්න
      </button>
    </form>
  );
};

export default SearchBar;
