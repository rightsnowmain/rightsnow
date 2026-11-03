import React, { useEffect, useState } from 'react';
import { PublishersService } from '../../services/publishers.service';
import { Publisher } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const PublishersManagement: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PublishersService.getPublishers().then(setPublishers).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-serif text-slate-900">ප්‍රකාශක ආයතන කළමනාකරණය</h1>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">නම</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">වෙබ් අඩවිය</th>
              <th className="px-4 py-3">පුවත්පත් සංඛ්‍යාව</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {publishers.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.slug}</td>
                <td className="px-4 py-3 text-rose-900">{p.website || '-'}</td>
                <td className="px-4 py-3">{p._count?.articles || 0} ලිපි</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublishersManagement;
