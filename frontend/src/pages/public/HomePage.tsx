import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArticlesService } from '../../services/articles.service';
import { PublishersService } from '../../services/publishers.service';
import { Article, Newspaper } from '../../types';
import ArticleCard from '../../components/articles/ArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEO from '../../components/common/SEO';
import { ArrowRight, Newspaper as NewspaperIcon, Search, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artsRes, newsRes] = await Promise.all([
          ArticlesService.getArticles({ limit: 7, sort: 'newest' }),
          PublishersService.getNewspapers(),
        ]);
        setArticles(artsRes.data || []);
        setNewspapers(newsRes || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/archive?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="නවතම ප්‍රවෘත්ති සහ ලේඛනාගාර ලිපි පූරණය වෙමින් පවතී..." />;
  }

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const remainingArticles = articles.slice(4);

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'සමබිම ඩිජිටල් ලේඛනාගාරය',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${typeof window !== 'undefined' ? window.location.origin : ''}/archive?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <SEO
        title="ප්‍රධාන පිටුව | නිල ඩිජිටල් ප්‍රකාශන සංරක්ෂණාගාරය"
        description="වසර 11කට වැඩි මානව හිමිකම්, දේශපාලන සහ සමාජ විශ්ලේෂණ ලේඛන එකතුව. සමබිම සහ Rights Now ඓතිහාසික පුවත්පත් ලේඛනාගාරය."
        jsonLd={homeJsonLd}
      />
      {/* Search & Fast-Access Filter Bar */}
      <section className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            ඓතිහාසික ඩිජිටල් ප්‍රකාශන සංරක්ෂණාගාරය
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif leading-tight mb-4">
            වසර 11කට වැඩි මානව හිමිකම් සහ ප්‍රජාතන්ත්‍රවාදී අරගලයේ ලිඛිත මතකය
          </h2>
          <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed mb-6">
            සමබිම පුවත්පත, Rights Now සහ අනුබද්ධ ලේඛන එකතුවෙන් ලිපි දහස් ගණනක් වර්ෂ, කතුවරුන් සහ මාතෘකා අනුව එකම තැනකින් ගවේෂණය කරන්න.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ශීර්ෂ පාඨය, කතුවරයා හෝ මූල පදය ඇතුළත් කරන්න..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm"
            >
              සොයන්න
            </button>
          </form>

          {/* Quick Year Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="text-rose-200">වසර අනුව සොයන්න:</span>
            {[2021, 2020, 2018, 2017, 2015, 2010].map((y) => (
              <Link
                key={y}
                to={`/archive?year=${y}`}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition font-medium"
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Featured Article */}
      {featuredArticle && (
        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-rose-900">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              ප්‍රමුඛ පුවත (Lead Story)
            </h3>
            <span className="text-xs text-rose-900 font-semibold uppercase tracking-wider">
              විශේෂාංග
            </span>
          </div>
          <ArticleCard article={featuredArticle} featured={true} />
        </section>
      )}

      {/* Secondary Top Stories Grid */}
      {secondaryArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              නවතම ලිපි සහ විග්‍රහ (Latest Analyses)
            </h3>
            <Link
              to="/articles"
              className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
            >
              <span>සියල්ල බලන්න</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Newspaper Publications Banner */}
      {newspapers.length > 0 && (
        <section className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <NewspaperIcon className="w-6 h-6 text-rose-400" />
            <h3 className="text-2xl font-bold font-serif">ප්‍රකාශන සහ පුවත්පත් සංස්කරණ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newspapers.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-bold font-serif text-white mb-2">{item.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                </div>
                <Link
                  to={`/newspapers/${item.slug}`}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                >
                  <span>සංස්කරණයේ ලිපි කියවන්න</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* More From Archive */}
      {remainingArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              තවත් විශේෂාංග ලිපි
            </h3>
            <Link
              to="/archive"
              className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
            >
              <span>ලේඛනාගාරයට පිවිසෙන්න</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
