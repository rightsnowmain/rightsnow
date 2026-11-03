import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublishersService } from '../../services/publishers.service';
import { Author } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, ArrowRight } from 'lucide-react';

export const AuthorPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await PublishersService.getAuthors();
        setAuthors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const safeAuthors = Array.isArray(authors) ? authors : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          කතුවරුන්ගේ නාමාවලිය (Authors & Contributors)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          සමබිම පුවත්පතට සහ Rights Now වෙත ලිපි හා විග්‍රහයන් සම්පාදනය කළ ලේඛකයන්ගේ නාමාවලිය.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {safeAuthors.map((author) => (
          <div
            key={author.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-900 leading-snug">{author.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{author.bio}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {author._count?.articles || 0} ලිපි
              </span>
              <Link
                to={`/archive?authorId=${author.id}`}
                className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
              >
                <span>ලිපි බලන්න</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorPage;
