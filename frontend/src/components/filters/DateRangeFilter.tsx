import React from 'react';

interface DateRangeFilterProps {
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ from, to, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-slate-700">දින සිට (From)</label>
        <input
          type="date"
          value={from || ''}
          onChange={(e) => onChange(e.target.value || undefined, to)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-slate-700">දින දක්වා (To)</label>
        <input
          type="date"
          value={to || ''}
          onChange={(e) => onChange(from, e.target.value || undefined)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
