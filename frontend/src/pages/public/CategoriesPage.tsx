import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublishersService } from '../../services/publishers.service';
import { Category } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FolderTree, ArrowRight } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await PublishersService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          පුවත් සහ විග්‍රහ ප්‍රවර්ග (News Categories)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          මාතෘකා සහ ක්ෂේත්‍ර ඔස්සේ ලිපි පෙරහන් කර පහසුවෙන් කියවන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {safeCategories.map((cat) => (
          <Link
            key={cat.id}
            to={`/archive?categoryId=${cat.id}`}
            className="group bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-rose-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center mb-4 group-hover:bg-rose-900 group-hover:text-white transition">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-slate-900 group-hover:text-rose-900 transition mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">{cat.description || 'විග්‍රහ සහ ලිපි එකතුව'}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{cat._count?.articles || 0} ලිපි</span>
              <ArrowRight className="w-4 h-4 text-rose-900 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
