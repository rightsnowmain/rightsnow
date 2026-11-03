import React from 'react';
import { Article } from '../../types';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  columns?: 2 | 3 | 4;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, columns = 3 }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
        <p className="text-slate-500 font-medium">කිසිදු ලිපියක් හමු නොවීය.</p>
        <p className="text-xs text-slate-400 mt-1">කරුණාකර ඔබගේ පෙරහන් හෝ සෙවුම් පදය වෙනස් කර නැවත උත්සාහ කරන්න.</p>
      </div>
    );
  }

  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridColsClass} gap-6`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleList;
