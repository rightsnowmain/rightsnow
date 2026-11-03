import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, User, Newspaper } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const displayDate = article.originalPublishedAt || article.publishedAt || article.createdAt;
  const isToday = displayDate ? new Date(displayDate).toDateString() === new Date().toDateString() : false;
  const formattedDate = displayDate
    ? isToday
      ? 'අද දින'
      : new Date(displayDate).toLocaleDateString('si-LK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
    : '';

  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80';

  if (featured) {
    return (
      <article className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden bg-slate-100">
          <img
            src={article.featuredImage || fallbackImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {Array.isArray(article.categories) && article.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="bg-rose-900/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              {article.newspaper && (
                <span className="flex items-center gap-1 font-medium text-rose-800">
                  <Newspaper className="w-3.5 h-3.5" />
                  {article.newspaper.name}
                </span>
              )}
            </div>

            <Link to={`/articles/${article.slug}`}>
              <h2 className="text-2xl font-bold font-serif text-slate-900 group-hover:text-rose-900 transition mb-3 leading-snug">
                {article.title}
              </h2>
            </Link>

            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {article.author?.name || 'කර්තෘ මණ්ඩලය'}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.viewCount} කියවීම්
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={article.featuredImage || fallbackImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {article.categories?.[0] && (
          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded">
            {article.categories[0].name}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            {article.newspaper && (
              <>
                <span>•</span>
                <span className="truncate max-w-[140px] text-rose-800 font-medium">
                  {article.newspaper.name}
                </span>
              </>
            )}
          </div>

          <Link to={`/articles/${article.slug}`}>
            <h3 className="text-lg font-bold font-serif text-slate-900 group-hover:text-rose-900 transition line-clamp-2 leading-snug mb-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[160px]">
            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{article.author?.name}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0" title="කියවීම් වාර ගණන">
            <Eye className="w-3 h-3 text-slate-400" />
            <span>{article.viewCount || 0} කියවීම්</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
