import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
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
      await AuthService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('විද්‍යුත් තැපෑල හෝ මුරපදය වැරදිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-serif text-slate-900">පද්ධතියට ඇතුල්වීම</h2>
        <p className="text-xs text-slate-500 mt-1">කර්තෘ මණ්ඩලය සහ පාඨක ගිණුම් සඳහා</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">විද්‍යුත් තැපෑල</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@samabima.org"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">මුරපදය</label>
            <Link to="/auth/forgot-password" className="text-xs text-rose-900 hover:underline">
              මුරපදය අමතකද?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-900 hover:bg-rose-800 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'ඇතුල් වෙමින් පවතී...' : 'ඇතුල්වීම'}</span>
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span>නව පාඨකයෙක්ද? </span>
        <Link to="/auth/register" className="text-rose-900 font-semibold hover:underline">
          ලියාපදිංචි වන්න
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
