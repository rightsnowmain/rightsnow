import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-serif text-slate-900">මුරපදය නැවත සැකසීම</h2>
        <p className="text-xs text-slate-500 mt-1">ඔබගේ විද්‍යුත් තැපෑලට මුරපදය යළි සැකසීමේ සබැඳියක් ලැබෙනු ඇත</p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-lg text-center">
          මුරපදය යළි සැකසීමේ සබැඳිය ඔබගේ ලිපිනයට යවන ලදී. කරුණාකර ඔබගේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">විද්‍යුත් තැපෑල</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-900 hover:bg-rose-800 text-white font-semibold py-2.5 rounded-lg text-xs transition"
          >
            සබැඳිය එවන්න
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        <Link to="/auth/login" className="text-rose-900 font-semibold hover:underline">
          ← ඇතුල්වීමේ පිටුවට ආපසු
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
