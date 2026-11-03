import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublishersService } from '../../services/publishers.service';
import { Newspaper } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Newspaper as NewspaperIcon, ArrowRight, Building } from 'lucide-react';

export const NewspapersPage: React.FC = () => {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await PublishersService.getNewspapers();
        setNewspapers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setNewspapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const safeNewspapers = Array.isArray(newspapers) ? newspapers : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          පුවත්පත් සහ ප්‍රකාශන සංස්කරණ (Publications Directory)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          සමබිම පුවත්පත සහ Rights Now ප්‍රකාශන එකතුවේ සියලුම ඩිජිටල් හා මුද්‍රිත ප්‍රකාශන නාමාවලිය.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {safeNewspapers.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-rose-50 text-rose-900 rounded-lg flex items-center justify-center mb-4">
                <NewspaperIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900 mb-2">{item.name}</h2>
              {item.publisher && (
                <p className="text-xs text-rose-800 font-semibold mb-3 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {item.publisher.name}
                </p>
              )}
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{item.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {item._count?.articles || 0} ලිපි සංරක්ෂිතයි
              </span>
              <Link
                to={`/newspapers/${item.slug}`}
                className="text-xs font-semibold text-rose-900 hover:text-rose-850 flex items-center gap-1"
              >
                <span>ලිපි එකතුවට පිවිසෙන්න</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewspapersPage;
