import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';

interface RelatedArticlesProps {
  articles: Partial<Article>[];
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';

  return (
    <section className="border-t border-slate-200 pt-10 mt-10">
      <h3 className="text-xl font-bold font-serif text-slate-900 mb-6">
        සම්බන්ධිත සහ තවත් ලිපි
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {articles.map((item) => (
          <Link
            key={item.id}
            to={`/articles/${item.slug}`}
            className="group block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="h-32 bg-slate-100 overflow-hidden">
              <img
                src={item.featuredImage || fallbackImage}
                alt={item.title || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-semibold font-serif text-slate-900 group-hover:text-rose-900 transition line-clamp-2 leading-snug">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
