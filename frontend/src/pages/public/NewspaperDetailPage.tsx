import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublishersService } from '../../services/publishers.service';
import { Newspaper } from '../../types';
import ArticleList from '../../components/articles/ArticleList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const NewspaperDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newspaper, setNewspaper] = useState<(Newspaper & { articles: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      try {
        const data = await PublishersService.getNewspaperBySlug(slug);
        setNewspaper(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!newspaper) return <div className="text-center py-16">සංස්කරණය හමු නොවීය.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900 mb-2">{newspaper.name}</h1>
        {newspaper.publisher && (
          <p className="text-xs text-rose-800 font-semibold mb-4">ප්‍රකාශනය: {newspaper.publisher.name}</p>
        )}
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{newspaper.description}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900 mb-6">
          මෙම පුවත්පතේ පළවූ ලිපි ({newspaper.articles?.length || 0})
        </h2>
        <ArticleList articles={newspaper.articles || []} columns={3} />
      </div>
    </div>
  );
};

export default NewspaperDetailPage;
