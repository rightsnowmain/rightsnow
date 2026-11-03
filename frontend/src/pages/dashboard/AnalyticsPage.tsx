import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Eye,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface AnalyticsData {
  kpi: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    inReviewArticles: number;
    approvedArticles: number;
    scheduledArticles: number;
    archivedArticles: number;
    totalViews: number;
    avgViewsPerArticle: number;
    totalComments: number;
    pendingComments: number;
  };
  statusDistribution: Record<string, number>;
  yearDistribution: { year: number; count: number }[];
  topArticles: {
    id: string;
    slug: string;
    title: string;
    viewCount: number;
    publishedAt?: string;
    originalPublishedAt?: string;
    author?: { id: string; name: string };
    newspaper?: { id: string; name: string };
  }[];
  topPublishers: { id: string; name: string; slug: string; articleCount: number }[];
  topAuthors: { id: string; name: string; slug: string; avatarUrl?: string; articleCount: number }[];
  topCategories: { id: string; name: string; slug: string; articleCount: number }[];
  commentsSummary: {
    total: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    SPAM: number;
  };
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load analytics: HTTP ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('විශ්ලේෂණ දත්ත පූරණය කිරීමට නොහැකි විය. කරුණාකර පරිපාලක ගිණුමෙන් ඇතුළු වී ඇත්දැයි පරීක්ෂා කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    let csv = 'Article Title,View Count,Author,Newspaper\n';
    data.topArticles.forEach((a) => {
      const cleanTitle = `"${(a.title || '').replace(/"/g, '""')}"`;
      const author = `"${(a.author?.name || '').replace(/"/g, '""')}"`;
      const newspaper = `"${(a.newspaper?.name || '').replace(/"/g, '""')}"`;
      csv += `${cleanTitle},${a.viewCount},${author},${newspaper}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `samabima_top_articles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="ප්‍රකාශන විශ්ලේෂණ වාර්තා සකස් වෙමින් පවතී..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-900 mb-1">දත්ත පූරණය අසාර්ථකයි</h3>
        <p className="text-xs text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          නැවත උත්සාහ කරන්න
        </button>
      </div>
    );
  }

  const { kpi, yearDistribution, topArticles, topAuthors, topCategories, statusDistribution } = data;

  // Find max count for year chart scaling
  const maxYearCount = Math.max(...yearDistribution.map((y) => y.count), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-900" />
            <span>ප්‍රකාශන විශ්ලේෂණ සහ වාර්තා (Analytics & Reports)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ලිපි සංඛ්‍යාලේඛන, කියවීම් ප්‍රවණතා, ඓතිහාසික වර්ෂ ව්‍යාප්තිය සහ පාඨක ප්‍රතිචාර ප්‍රමිතික.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="ලිපි සංඛ්‍යාලේඛන CSV ගොනුවක් ලෙස බාගන්න"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV වාර්තාව බාගන්න</span>
          </button>
          <button
            onClick={fetchAnalytics}
            className="text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-lg hover:bg-rose-100 transition"
          >
            වාර්තාව යාවත්කාලීන කරන්න
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>සමස්ත ලිපි සංඛ්‍යාව</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpi.totalArticles.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{kpi.publishedArticles.toLocaleString()} පළ වූ ලිපි</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>සමස්ත කියවීම් වාර (Views)</span>
            <Eye className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpi.totalViews.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2">
            සාමාන්‍ය: ~{kpi.avgViewsPerArticle.toLocaleString()} කියවීම් / ලිපියකට
          </div>
        </div>

        {/* Reader Comments */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>පාඨක අදහස් සහ ප්‍රතිචාර</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpi.totalComments.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpi.pendingComments > 0 ? (
              <Link
                to="/dashboard/comments"
                className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 hover:underline"
              >
                <Clock className="w-3 h-3" />
                <span>{kpi.pendingComments} අනුමැතිය බලාපොරොත්තුවෙන්</span>
              </Link>
            ) : (
              <span className="text-xs text-slate-400">නව අනුමැති පෝලිමක් නැත</span>
            )}
          </div>
        </div>

        {/* Publishing Workflow Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>කර්තෘ මණ්ඩල ක්‍රියාකාරකම්</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpi.inReviewArticles + kpi.draftArticles}</div>
          <div className="text-xs text-slate-500 mt-2 space-x-2">
            <span>{kpi.inReviewArticles} සමාලෝචනයේ</span>
            <span>•</span>
            <span>{kpi.draftArticles} කෙටුම්පත්</span>
          </div>
        </div>
      </div>

      {/* Status Distribution Pills */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          ප්‍රකාශන තත්ව ව්‍යාප්තිය (Status Breakdown)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'පළ වූ (PUBLISHED)', count: statusDistribution.PUBLISHED || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'සමාලෝචනයේ (IN REVIEW)', count: statusDistribution.IN_REVIEW || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'අනුමත කළ (APPROVED)', count: statusDistribution.APPROVED || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'කෙටුම්පත් (DRAFT)', count: statusDistribution.DRAFT || 0, color: 'text-slate-700 bg-slate-50 border-slate-200' },
            { label: 'කාලසටහන්ගත (SCHEDULED)', count: statusDistribution.SCHEDULED || 0, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
            { label: 'සංරක්ෂිත (ARCHIVED)', count: statusDistribution.ARCHIVED || 0, color: 'text-rose-700 bg-rose-50 border-rose-200' },
          ].map((item, idx) => (
            <div key={idx} className={`border rounded-lg p-3 text-center ${item.color}`}>
              <div className="text-xl font-bold">{item.count.toLocaleString()}</div>
              <div className="text-[10px] font-medium mt-1 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Year Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-900" />
            <h3 className="text-base font-bold font-serif text-slate-900">
              ඓතිහාසික වර්ෂ ව්‍යාප්තිය (Articles by Year)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            වසර {yearDistribution.length} ක දත්ත වාර්තා
          </span>
        </div>

        {yearDistribution.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">වර්ෂ දත්ත සටහන් වී නැත.</p>
        ) : (
          <div className="space-y-3">
            {yearDistribution.map((item) => {
              const percentage = Math.round((item.count / maxYearCount) * 100);
              return (
                <div key={item.year} className="flex items-center gap-4 text-xs">
                  <span className="w-12 font-bold text-slate-700">{item.year}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-rose-800 to-rose-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-semibold text-slate-800">
                    {item.count.toLocaleString()} ලිපි
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout: Top Articles + Authors / Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Viewed Articles (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-900" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                වැඩිම කියවීම් ලැබූ ලිපි (Top 10 Most Viewed)
              </h3>
            </div>
            <Link
              to="/archive?sort=popular"
              className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-0.5"
            >
              <span>සියල්ල</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topArticles.map((art, idx) => (
              <div key={art.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <Link
                      to={`/articles/${art.slug}`}
                      className="font-semibold text-slate-900 hover:text-rose-900 transition line-clamp-1"
                    >
                      {art.title}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5 space-x-2">
                      {art.author && <span>{art.author.name}</span>}
                      {art.newspaper && (
                        <>
                          <span>•</span>
                          <span>{art.newspaper.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-bold text-slate-800 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5 text-rose-800" />
                  <span>{art.viewCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Authors & Categories (1 Column) */}
        <div className="space-y-6">
          {/* Top Authors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-rose-900" />
              <h4 className="text-sm font-bold font-serif text-slate-900">වැඩිම ලිපි ලියූ කතුවරුන්</h4>
            </div>
            <div className="space-y-2.5 text-xs">
              {topAuthors.map((author) => (
                <div key={author.id} className="flex items-center justify-between py-1">
                  <Link
                    to={`/archive?authorId=${author.id}`}
                    className="font-medium text-slate-800 hover:text-rose-900 truncate"
                  >
                    {author.name}
                  </Link>
                  <span className="font-semibold text-rose-900 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                    {author.articleCount} ලිපි
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-rose-900" />
              <h4 className="text-sm font-bold font-serif text-slate-900">ප්‍රධාන ප්‍රවර්ග (Top Categories)</h4>
            </div>
            <div className="space-y-2.5 text-xs">
              {topCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between py-1">
                  <Link
                    to={`/archive?categoryId=${category.id}`}
                    className="font-medium text-slate-800 hover:text-rose-900 truncate"
                  >
                    {category.name}
                  </Link>
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {category.articleCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
