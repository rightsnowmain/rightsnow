import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Article } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle, Calendar, Eye, CheckCircle2, Clock, Send, Check, Trash2, Edit3, AlertCircle } from 'lucide-react';

export const ArticlesManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await api.get('/admin/articles', {
        params: { status: statusParam, limit: 30 },
      });
      setArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  const handleAction = async (action: 'submit' | 'approve' | 'publish' | 'delete', id: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('මෙම ලිපිය ඉවත් කිරීමට ඔබට සහතිකද?')) return;
        await api.delete(`/admin/articles/${id}`);
      } else {
        await api.post(`/admin/articles/${id}/${action}`);
      }
      alert('ක්‍රියාව සාර්ථකයි!');
      fetchArticles();
    } catch (err) {
      alert('ක්‍රියාවලිය අසාර්ථක විය. ඔබගේ පරිශීලක අවසර පරීක්ෂා කරන්න.');
    }
  };

  const tabs = [
    { key: 'ALL', label: 'සියල්ල (All)' },
    { key: 'DRAFT', label: 'කෙටුම්පත් (Drafts)' },
    { key: 'IN_REVIEW', label: 'සමාලෝචනයේ (In Review)' },
    { key: 'APPROVED', label: 'අනුමත (Approved)' },
    { key: 'PUBLISHED', label: 'ප්‍රකාශිත (Published)' },
  ];

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      PUBLISHED: { bg: 'bg-emerald-100 text-emerald-800', text: 'ප්‍රකාශිත', label: 'PUBLISHED' },
      APPROVED: { bg: 'bg-blue-100 text-blue-800', text: 'අනුමත', label: 'APPROVED' },
      IN_REVIEW: { bg: 'bg-amber-100 text-amber-800', text: 'සමාලෝචනයේ', label: 'IN REVIEW' },
      DRAFT: { bg: 'bg-slate-100 text-slate-700', text: 'කෙටුම්පත', label: 'DRAFT' },
      SCHEDULED: { bg: 'bg-purple-100 text-purple-800', text: 'නියමිත', label: 'SCHEDULED' },
      ARCHIVED: { bg: 'bg-zinc-100 text-zinc-600', text: 'සංරක්ෂිත', label: 'ARCHIVED' },
    };
    const c = config[status] || { bg: 'bg-slate-100 text-slate-600', text: status, label: status };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.bg}`}>
        {status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {c.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900">ලිපි කළමනාකරණය (Editorial CMS)</h1>
          <p className="text-xs text-slate-500 mt-1">කෙටුම්පත්, කර්තෘ සමාලෝචන, අනුමැතිය සහ ප්‍රකාශන කාර්ය ප්‍රවාහය</p>
        </div>

        <Link
          to="/dashboard/articles/create"
          className="inline-flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>නව ලිපියක් ලියන්න</span>
        </Link>
      </div>

      {/* Workflow Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === t.key
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="කර්තෘ මණ්ඩල වාර්තා පූරණය වෙමින් පවතී..." />
      ) : articles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
          මෙම කාණ්ඩය යටතේ දැනට ලිපි නොමැත.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ශීර්ෂ පාඨය</th>
                  <th className="px-4 py-3">කතුවරයා</th>
                  <th className="px-4 py-3">ප්‍රකාශනය</th>
                  <th className="px-4 py-3">තත්ත්වය</th>
                  <th className="px-4 py-3">දිනය</th>
                  <th className="px-4 py-3 text-right">ක්‍රියා (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 max-w-xs font-serif font-bold text-slate-900 truncate">
                      <Link to={`/articles/${art.slug}`} className="hover:text-rose-900">
                        {art.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{art.author?.name || '-'}</td>
                    <td className="px-4 py-3">{art.newspaper?.name || art.publisher?.name || '-'}</td>
                    <td className="px-4 py-3">{statusBadge(art.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {art.originalPublishedAt
                        ? new Date(art.originalPublishedAt).toLocaleDateString()
                        : art.publishedAt
                        ? new Date(art.publishedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.status === 'DRAFT' && (
                          <button
                            onClick={() => handleAction('submit', art.id)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded transition"
                            title="සමාලෝචනයට යොමු කරන්න (Submit for Review)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {art.status === 'IN_REVIEW' && (
                          <button
                            onClick={() => handleAction('approve', art.id)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded transition"
                            title="අනුමත කරන්න (Approve)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {(art.status === 'APPROVED' || art.status === 'DRAFT') && (
                          <button
                            onClick={() => handleAction('publish', art.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded transition"
                            title="සෘජුව පළ කරන්න (Publish)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <Link
                          to={`/dashboard/articles/edit/${art.id}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                          title="සංස්කරණය සහ සංශෝධන ඉතිහාසය"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleAction('delete', art.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition"
                          title="ඉවත් කරන්න"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesManagement;
