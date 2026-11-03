import React, { useEffect, useState } from 'react';
import { PublishersService } from '../../services/publishers.service';
import { Category } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PublishersService.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-serif text-slate-900">ප්‍රවර්ග කළමනාකරණය</h1>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">නම</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">විස්තරය</th>
              <th className="px-4 py-3">ලිපි ගණන</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                <td className="px-4 py-3 max-w-sm truncate">{c.description || '-'}</td>
                <td className="px-4 py-3">{c._count?.articles || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesManagement;
