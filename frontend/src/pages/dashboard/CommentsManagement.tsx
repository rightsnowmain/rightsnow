import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Search,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface CommentAdminItem {
  id: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    role: string;
  };
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

export const CommentsManagement: React.FC = () => {
  const [comments, setComments] = useState<CommentAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    SPAM: 0,
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const res = await api.get('/admin/comments', { params });
      setComments(res.data.data || []);
      if (res.data.meta?.statusCounts) {
        setStatusCounts(res.data.meta.statusCounts);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComments();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/comments/${id}/status`, { status: newStatus });
      fetchComments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'තත්ත්වය යාවත්කාලීන කිරීම අසාර්ථක විය.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('මෙම අදහස ස්ථිරවම ඉවත් කිරීමට ඔබට සහතිකද?')) return;
    try {
      await api.delete(`/admin/comments/${id}`);
      fetchComments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ඉවත් කිරීම අසාර්ථක විය.');
    }
  };

  const tabs = [
    { key: 'PENDING', label: 'පොරොත්තු (Pending)', count: statusCounts.PENDING },
    { key: 'APPROVED', label: 'අනුමත (Approved)', count: statusCounts.APPROVED },
    { key: 'REJECTED', label: 'ප්‍රතික්ෂේපිත (Rejected)', count: statusCounts.REJECTED },
    { key: 'SPAM', label: 'ස්පෑම් (Spam)', count: statusCounts.SPAM },
    { key: 'ALL', label: 'සියල්ල (All)', count: statusCounts.ALL },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            අනුමතයි (Approved)
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            පොරොත්තු (Pending)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            ප්‍රතික්ෂේපිත (Rejected)
          </span>
        );
      case 'SPAM':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            ස්පෑම් (Spam)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            අදහස් හා ප්‍රතිචාර කළමනාකරණය (Comment Moderation Queue)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            පාඨකයන් විසින් එක් කරන ලද අදහස් සමාලෝචනය කර ප්‍රසිද්ධ කිරීමට අනුමත හෝ ප්‍රතික්ෂේප කරන්න.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-rose-800 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="අදහස් හෝ නම සොයන්න..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-900 focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">මෙම කාණ්ඩයේ අදහස් හමු නොවීය</p>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'PENDING'
              ? 'පොරොත්තු සමාලෝචන අදහස් කිසිවක් නොමැත. සියල්ල යාවත්කාලීනයි!'
              : 'වෙනත් කාණ්ඩයක් තෝරා බලන්න.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition"
            >
              {/* Top metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {comment.user.displayName ? comment.user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{comment.user.displayName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({comment.user.email})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    • {new Date(comment.createdAt).toLocaleDateString('si-LK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(comment.status)}
                </div>
              </div>

              {/* Associated Article Link */}
              <div className="bg-slate-50 rounded-lg px-3 py-1.5 mb-3 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium truncate">
                  ලිපිය: <strong className="text-slate-800">{comment.article.title}</strong>
                </span>
                <Link
                  to={`/articles/${comment.article.slug}`}
                  target="_blank"
                  className="text-rose-900 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>කියවන්න</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Comment Body */}
              <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-line mb-4 font-sans">
                {comment.body}
              </p>

              {/* Moderation Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {comment.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
                    title="අනුමත කර ප්‍රසිද්ධ කරන්න"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>අනුමත කරන්න</span>
                  </button>
                )}

                {comment.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition"
                    title="ප්‍රතික්ෂේප කරන්න"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ප්‍රතික්ෂේප කරන්න</span>
                  </button>
                )}

                {comment.status !== 'SPAM' && (
                  <button
                    onClick={() => handleUpdateStatus(comment.id, 'SPAM')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    title="ස්පෑම් ලෙස සලකුණු කරන්න"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>ස්පෑම්</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comment.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs transition"
                  title="ස්ථිරවම මකා දමන්න"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>මකන්න</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
