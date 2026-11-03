import React from 'react';

interface YearFilterProps {
  years: number[];
  selectedYear?: number;
  onSelectYear: (year?: number) => void;
}

export const YearFilter: React.FC<YearFilterProps> = ({
  years,
  selectedYear,
  onSelectYear,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">වර්ෂය (Year)</label>
      <select
        value={selectedYear || ''}
        onChange={(e) => onSelectYear(e.target.value ? Number(e.target.value) : undefined)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
      >
        <option value="">සියලු වසර (All Years)</option>
        {(Array.isArray(years) ? years : []).map((y) => (
          <option key={y} value={y}>
            {y} වසර
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearFilter;
