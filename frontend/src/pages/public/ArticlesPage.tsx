import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticlesService } from '../../services/articles.service';
import { Article } from '../../types';
import ArticleList from '../../components/articles/ArticleList';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const ArticlesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await ArticlesService.getArticles({ page, limit: 12, sort: 'newest' });
        setArticles(Array.isArray(res?.data) ? res.data : []);
        setTotalPages(res?.meta?.totalPages || 1);
        setTotalCount(res?.meta?.total || 0);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          සියලු ප්‍රකාශිත ලිපි (All Articles)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          සමබිම සහ Rights Now ප්‍රකාශන එකතුවේ නවතම ලිපි පෙළ (මුළු ලිපි: {totalCount})
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ArticleList articles={articles} columns={3} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ArticlesPage;
