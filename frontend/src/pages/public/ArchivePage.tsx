import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticlesService } from '../../services/articles.service';
import { Article, FilterOptions } from '../../types';
import ArticleList from '../../components/articles/ArticleList';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEO from '../../components/common/SEO';
import SearchBar from '../../components/filters/SearchBar';
import YearFilter from '../../components/filters/YearFilter';
import PublisherFilter from '../../components/filters/PublisherFilter';
import AuthorFilter from '../../components/filters/AuthorFilter';
import CategoryFilter from '../../components/filters/CategoryFilter';
import DateRangeFilter from '../../components/filters/DateRangeFilter';
import { RotateCcw, Filter, FileSpreadsheet, X, SlidersHorizontal, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

export const ArchivePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('samabima_saved_articles');
      if (saved) setSavedIds(JSON.parse(saved));
    } catch {}
  }, []);

  // Active filter state from URL
  const query = searchParams.get('q') || '';
  const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const publisherId = searchParams.get('publisherId') || undefined;
  const authorId = searchParams.get('authorId') || undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  const sort = (searchParams.get('sort') as 'newest' | 'oldest' | 'popular') || 'newest';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await ArticlesService.getAvailableFilters();
        setFilterOptions(opts);
      } catch (err) {
        console.error('Failed to load filter facets:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch articles when query params change
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await ArticlesService.getArticles({
          q: query || undefined,
          year,
          from,
          to,
          publisherId,
          authorId,
          categoryId,
          sort,
          page,
          limit: 12,
        });
        setArticles(Array.isArray(res?.data) ? res.data : []);
        setTotalCount(res?.meta?.total || 0);
        setTotalPages(res?.meta?.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch archive articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [query, year, from, to, publisherId, authorId, categoryId, sort, page]);

  const updateParam = (key: string, value?: string | number) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '') {
      next.set(key, String(value));
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeAuthor = filterOptions?.authors.find((a) => a.id === authorId);
  const activePublisher = filterOptions?.publishers.find((p) => p.id === publisherId);
  const activeCategory = filterOptions?.categories.find((c) => c.id === categoryId);

  const hasActiveFilters = !!(query || year || from || to || publisherId || authorId || categoryId || sort !== 'newest');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO
        title="සමබිම ඩිජිටල් ලේඛනාගාරය (Archive & Discovery)"
        description="2010 සිට 2021 දක්වා පළ වූ සමස්ත ඓතිහාසික ලිපි එකතුව වර්ෂ, කතුවරුන්, පුවත්පත් සහ ප්‍රවර්ග අනුව සොයන්න."
      />
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900">
            සමබිම ඩිජිටල් ලේඛනාගාරය (Digital Archive)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            2010 සිට 2021 දක්වා පළ වූ සමස්ත ලිපි එකතුව සම්පූර්ණ දත්ත පෙරහන් සහ මූල පද ඔස්සේ සොයන්න.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedIds.length > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                showSavedOnly
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
              }`}
              title="මා විසින් සුරකින ලද ලිපි පමණක් පෙන්වන්න"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>සුරැකි ලිපි ({savedIds.length})</span>
            </button>
          )}

          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-rose-800" />
            <span>සොයාගත් ලිපි ගණන: {totalCount}</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>නැවත සකසන්න</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-1">
          <SearchBar
            initialValue={query}
            onSearch={(q) => updateParam('q', q)}
            placeholder="ලේඛනාගාරයේ මාතෘකා, අන්තර්ගතය හෝ වචන සොයන්න..."
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="sm:hidden flex items-center justify-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-rose-800" />
          <span>පෙරහන් නිර්ණායක {mobileFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-semibold">සක්‍රීය පෙරහන්:</span>

          {query && (
            <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-900 px-2.5 py-1 rounded-full font-medium">
              <span>සෙවුම: "{query}"</span>
              <button onClick={() => updateParam('q', undefined)}><X className="w-3 h-3 hover:text-rose-950" /></button>
            </span>
          )}

          {year && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-full font-medium">
              <span>වර්ෂය: {year}</span>
              <button onClick={() => updateParam('year', undefined)}><X className="w-3 h-3 hover:text-blue-950" /></button>
            </span>
          )}

          {activePublisher && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-medium">
              <span>ප්‍රකාශක: {activePublisher.name}</span>
              <button onClick={() => updateParam('publisherId', undefined)}><X className="w-3 h-3 hover:text-amber-950" /></button>
            </span>
          )}

          {activeAuthor && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-900 px-2.5 py-1 rounded-full font-medium">
              <span>කතුවර: {activeAuthor.name}</span>
              <button onClick={() => updateParam('authorId', undefined)}><X className="w-3 h-3 hover:text-purple-950" /></button>
            </span>
          )}

          {activeCategory && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full font-medium">
              <span>ප්‍රවර්ග: {activeCategory.name}</span>
              <button onClick={() => updateParam('categoryId', undefined)}><X className="w-3 h-3 hover:text-emerald-950" /></button>
            </span>
          )}

          {from && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              <span>සිට: {from}</span>
              <button onClick={() => updateParam('from', undefined)}><X className="w-3 h-3 hover:text-slate-950" /></button>
            </span>
          )}

          {to && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              <span>දක්වා: {to}</span>
              <button onClick={() => updateParam('to', undefined)}><X className="w-3 h-3 hover:text-slate-950" /></button>
            </span>
          )}
        </div>
      )}

      {/* Filter Panel (Desktop visible, mobile collapsible) */}
      <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all ${mobileFiltersOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-4 h-4 text-rose-800" />
            <span>පෙරහන් නිර්ණායක (Filter Facets)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDateRange(!showDateRange)}
            className="text-xs font-medium text-rose-900 hover:underline"
          >
            {showDateRange ? 'දින පරාසය සඟවන්න' : '+ දින පරාසය (Date Range)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <YearFilter
            years={filterOptions?.years || []}
            selectedYear={year}
            onSelectYear={(y) => updateParam('year', y)}
          />

          <PublisherFilter
            publishers={filterOptions?.publishers || []}
            selectedId={publisherId}
            onSelect={(pId) => updateParam('publisherId', pId)}
          />

          <AuthorFilter
            authors={filterOptions?.authors || []}
            selectedId={authorId}
            onSelect={(aId) => updateParam('authorId', aId)}
          />

          <CategoryFilter
            categories={filterOptions?.categories || []}
            selectedId={categoryId}
            onSelect={(cId) => updateParam('categoryId', cId)}
          />

          {/* Sort selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">පිළිවෙල (Sort)</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
            >
              <option value="newest">නවතම ලිපි පළමුව</option>
              <option value="oldest">පැරණිතම ලිපි පළමුව</option>
              <option value="popular">වැඩිම කියවීම් අනුව</option>
            </select>
          </div>
        </div>

        {/* Expandable Date Range Panel */}
        {showDateRange && (
          <div className="mt-4 pt-4 border-t border-slate-100 max-w-md">
            <DateRangeFilter
              from={from}
              to={to}
              onChange={(f, t) => {
                updateParam('from', f);
                updateParam('to', t);
              }}
            />
          </div>
        )}
      </div>

      {/* Articles Listing */}
      {loading ? (
        <LoadingSpinner message="ලේඛනාගාර වාර්තා පිරික්සමින් පවතී..." />
      ) : showSavedOnly && articles.filter((a) => savedIds.includes(a.id)).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">සුරැකි ලිපි කිසිවක් මෙම පිටුවේ නොමැත</p>
          <p className="text-xs text-slate-400 mt-1">ලිපියක් කියවන අතරතුර "සුරකින්න" බොත්තම ක්ලික් කිරීමෙන් මෙහි එකතු කරගත හැක.</p>
        </div>
      ) : (
        <>
          <ArticleList
            articles={showSavedOnly ? articles.filter((a) => savedIds.includes(a.id)) : articles}
            columns={3}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParam('page', p)}
          />
        </>
      )}
    </div>
  );
};

export default ArchivePage;
