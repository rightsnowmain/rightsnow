import React from 'react';
import { Publisher } from '../../types';

interface PublisherFilterProps {
  publishers: Publisher[];
  selectedId?: string;
  onSelect: (id?: string) => void;
}

export const PublisherFilter: React.FC<PublisherFilterProps> = ({
  publishers,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">ප්‍රකාශකයා (Publisher)</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || undefined)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
      >
        <option value="">සියලු ප්‍රකාශකයන් (All)</option>
        {(Array.isArray(publishers) ? publishers : []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PublisherFilter;
