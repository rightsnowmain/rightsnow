import React, { useState } from 'react';
import { User, MessageSquare, CornerDownRight, Flag, Check, Trash2 } from 'lucide-react';
import CommentForm from './CommentForm';

export interface CommentUser {
  id: string;
  displayName: string;
  role?: string;
}

export interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  parentId?: string | null;
  user?: CommentUser;
  replies?: CommentItem[];
}

interface CommentListProps {
  comments: CommentItem[];
  articleId: string;
  onRefresh?: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, articleId, onRefresh }) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  const handleReport = async (commentId: string) => {
    if (reportedIds.has(commentId)) return;
    try {
      await fetch(`/api/v1/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Reported by reader' }),
      });
      setReportedIds((prev) => new Set(prev).add(commentId));
    } catch (err) {
      console.error('Failed to report comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('ඔබට මෙම ප්‍රතිචාරය මකා දැමීමට අවශ්‍ය බව සහතිකද?')) return;
    try {
      const res = await fetch(`/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'අදහස මකා දැමීම අසාර්ථක විය.');
        return;
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('දෝෂයක් සිදු විය: ' + err.message);
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl my-4">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">
          මෙම ලිපිය සඳහා තවමත් ප්‍රතිචාර පළ කර නොමැත. ඔබේ අදහස පළමුවෙන්ම එක් කරන්න!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((c) => (
        <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          {/* Main Comment Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {c.user?.displayName ? c.user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{c.user?.displayName || 'පාඨකයා'}</span>
                  {c.user?.role && (c.user.role === 'ADMIN' || c.user.role === 'EDITOR') && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
                      කර්තෘ මණ්ඩලය
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString('si-LK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setReplyingToId(replyingToId === c.id ? null : c.id)}
                className="text-xs font-semibold text-rose-900 hover:text-rose-700 flex items-center gap-1 transition"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>පිළිතුරු දෙන්න</span>
              </button>

              <button
                onClick={() => handleReport(c.id)}
                disabled={reportedIds.has(c.id)}
                className={`text-[11px] font-medium flex items-center gap-1 transition ${
                  reportedIds.has(c.id) ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="අනුචිත අන්තර්ගතයක් ලෙස වාර්තා කරන්න"
              >
                {reportedIds.has(c.id) ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>වාර්තා විය</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3 h-3" />
                    <span>වාර්තා කරන්න</span>
                  </>
                )}
              </button>

              {currentUser && (currentUser.id === c.user?.id || currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR') && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
                  title="මකා දමන්න"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>මකන්න</span>
                </button>
              )}
            </div>
          </div>

          {/* Comment Body */}
          <p className="text-sm text-slate-800 leading-relaxed pl-10 whitespace-pre-line">{c.body}</p>

          {/* Inline Reply Form */}
          {replyingToId === c.id && (
            <div className="mt-4 pl-10">
              <CommentForm
                articleId={articleId}
                parentId={c.id}
                placeholder={`${c.user?.displayName || 'පාඨකයා'} හට පිළිතුරක් සටහන් කරන්න...`}
                onSuccess={() => {
                  setReplyingToId(null);
                  if (onRefresh) onRefresh();
                }}
                onCancel={() => setReplyingToId(null)}
              />
            </div>
          )}

          {/* Nested Replies List */}
          {c.replies && c.replies.length > 0 && (
            <div className="mt-4 pl-8 border-l-2 border-slate-200 space-y-3">
              {c.replies.map((reply) => (
                <div key={reply.id} className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700">
                        {reply.user?.displayName ? reply.user.displayName.charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{reply.user?.displayName || 'පාඨකයා'}</span>
                      {reply.user?.role && (reply.user.role === 'ADMIN' || reply.user.role === 'EDITOR') && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
                          කර්තෘ මණ්ඩලය
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        • {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReport(reply.id)}
                      disabled={reportedIds.has(reply.id)}
                      className={`text-[10px] font-medium flex items-center gap-0.5 transition ${
                        reportedIds.has(reply.id) ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="වාර්තා කරන්න"
                    >
                      {reportedIds.has(reply.id) ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Flag className="w-2.5 h-2.5" />
                      )}
                    </button>

                    {currentUser && (currentUser.id === reply.user?.id || currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR') && (
                      <button
                        onClick={() => handleDelete(reply.id)}
                        className="text-[10px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-0.5 transition ml-1"
                        title="මකා දමන්න"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>මකන්න</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-line">{reply.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
