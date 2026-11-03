import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArticlesService } from '../../services/articles.service';
import { Article } from '../../types';
import ArticleDetail from '../../components/articles/ArticleDetail';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEO from '../../components/common/SEO';
import { ArrowLeft } from 'lucide-react';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const data = await ArticlesService.getArticleBySlug(slug);
        setArticle(data);
      } catch (err: any) {
        console.error('Failed to load article:', err);
        setError('අදාළ ලිපිය සොයා ගැනීමට නොහැකි විය.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner message="ලිපිය පූරණය වෙමින් පවතී..." />;
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <SEO title="ලිපිය හමු නොවීය" description="සොයන ලද ලිපිය ඉවත් කර හෝ පවතින්නේ නැත." />
        <h2 className="text-2xl font-bold font-serif text-slate-800 mb-2">ලිපිය හමු නොවීය</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'සොයන ලද ලිපිය ඉවත් කර හෝ පවතින්නේ නැත.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-rose-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>මුල් පිටුවට ආපසු යන්න</span>
        </Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.featuredImage ? [article.featuredImage] : undefined,
    datePublished: article.originalPublishedAt || article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.author ? {
      '@type': 'Person',
      name: article.author.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: article.publisher?.name || 'සමබිම ප්‍රකාශන භාරය',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : '',
    },
  };

  return (
    <div className="bg-white min-h-screen py-4">
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        ogImage={article.featuredImage}
        ogType="article"
        articleMeta={{
          publishedTime: article.originalPublishedAt || article.publishedAt,
          modifiedTime: article.updatedAt,
          authorName: article.author?.name,
          section: article.categories?.[0]?.name,
        }}
        jsonLd={jsonLd}
      />
      <ArticleDetail article={article} />
    </div>
  );
};

export default ArticlePage;
