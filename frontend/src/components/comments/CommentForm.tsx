import React, { useState } from 'react';
import { Send, LogIn, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  articleId,
  parentId,
  placeholder = 'ලිපිය පිළිබඳ ඔබගේ අදහස හෝ ප්‍රතිචාරය මෙහි සටහන් කරන්න...',
  onSuccess,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; isSessionExpired?: boolean } | null>(null);

  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  if (!token) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center my-4">
        <p className="text-sm font-medium text-slate-700 mb-3">
          මෙම ලිපිය පිළිබඳ අදහස් හෝ ප්‍රතිචාර දැක්වීම සඳහා කරුණාකර ඔබගේ ගිණුමට පිවිසෙන්න.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>පිවිසෙන්න (Sign In)</span>
          </Link>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <span>නොමිලේ ලියාපදිංචි වන්න</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/v1/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          body: text.trim(),
          parentId: parentId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          setFeedback({
            type: 'error',
            message: 'ඔබගේ පිවිසුම් සැසිය (Login Session) අවසන් වී ඇත. කරුණාකර නැවත ඇතුල් වන්න.',
            isSessionExpired: true,
          });
          return;
        }
        throw new Error(data.message || 'අදහස් එක් කිරීම අසාර්ථක විය');
      }

      setText('');
      setFeedback({
        type: 'success',
        message: data.message || 'ඔබගේ අදහස කර්තෘ මණ්ඩල සමාලෝචනය සඳහා සාර්ථකව යොමු කෙරිණි!',
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setFeedback(null);
        if (onCancel) onCancel();
      }, 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <span>
          ප්‍රතිචාරය දක්වන්නේ: <strong className="text-slate-800">{currentUser?.displayName || 'පාඨකයා'}</strong>
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>අවලංගු කරන්න</span>
          </button>
        )}
      </div>

      <textarea
        rows={parentId ? 2 : 3}
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-900 focus:outline-hidden transition"
      />

      {feedback && (
        <div
          className={`flex items-start gap-2.5 p-3 rounded-lg text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="leading-snug">{feedback.message}</p>
            {feedback.isSessionExpired && (
              <Link
                to="/auth/login"
                className="inline-block mt-2 font-bold text-rose-900 underline hover:text-rose-700"
              >
                නැවත ඇතුල්වීම සඳහා මෙහි ක්ලික් කරන්න (Sign In) →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            අවලංගු කරන්න
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-rose-900 hover:bg-rose-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'යොමු වෙමින් පවතී...' : parentId ? 'පිළිතුර එක් කරන්න' : 'අදහස එක් කරන්න'}</span>
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
