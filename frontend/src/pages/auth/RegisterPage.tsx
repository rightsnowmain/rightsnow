import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await AuthService.register(email, password, displayName);
      navigate('/');
    } catch (err: any) {
      setError('ලියාපදිංචි වීම අසාර්ථක විය. මෙම විද්‍යුත් තැපෑල දැනටමත් භාවිතයේ තිබිය හැක.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-serif text-slate-900">නව ගිණුමක් ලියාපදිංචි කිරීම</h2>
        <p className="text-xs text-slate-500 mt-1">සමබිම පාඨක ප්‍රජාව සමඟ එක්වන්න</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">සම්පූර්ණ නම</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="නිමල් පෙරේරා"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">විද්‍යුත් තැපෑල</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nimal@example.com"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">මුරපදය</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="අවම අක්ෂර 6ක්"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-900 hover:bg-rose-800 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'ලියාපදිංචි වෙමින්...' : 'ලියාපදිංචි වන්න'}</span>
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span>දැනටමත් ගිණුමක් තිබේද? </span>
        <Link to="/auth/login" className="text-rose-900 font-semibold hover:underline">
          ඇතුල්වීම
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
