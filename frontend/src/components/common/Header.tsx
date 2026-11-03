import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, Newspaper, Bookmark, LogOut, LayoutDashboard, UserPlus } from 'lucide-react';
import Navbar from './Navbar';
import { AuthService } from '../../services/auth.service';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const today = new Intl.DateTimeFormat('si-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Top Utility Bar */}
      <div className="border-b border-slate-100 bg-slate-900 text-slate-300 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ඩිජිටල් සංරක්ෂණාගාරය සහ පුවත් සේවාව | {today}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/archive" className="hover:text-white transition flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>ඓතිහාසික ලිපි (2010 - 2021)</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {(currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR' || currentUser.role === 'AUTHOR') && (
                  <Link to="/dashboard" className="text-amber-300 hover:text-white transition flex items-center gap-1 font-semibold">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>පාලක පුවරුව</span>
                  </Link>
                )}
                <span className="text-slate-400 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold text-slate-200">{currentUser.displayName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="hover:text-rose-300 text-slate-400 transition flex items-center gap-1"
                  title="පද්ධතියෙන් ඉවත් වන්න"
                >
                  <LogOut className="w-3 h-3" />
                  <span>ඉවත් වන්න</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>ඇතුල්වීම</span>
                </Link>
                <span className="text-slate-600">|</span>
                <Link to="/auth/register" className="hover:text-rose-300 transition flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ලියාපදිංචි වන්න</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-rose-900 text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-sm">
            ස
          </div>
          <div>
            <Link to="/" className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-serif hover:text-rose-900 transition">
              සමබිම & Rights Now
            </Link>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              මානව හිමිකම්, සමාජ යුක්තිය සහ පුරවැසි ප්‍රජාතන්ත්‍රවාදය සඳහා වූ ප්‍රකාශන එකතුව
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/archive"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>සොයන්න</span>
          </Link>
          <Link
            to="/newspapers"
            className="flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Newspaper className="w-4 h-4" />
            <span>පුවත්පත් සංස්කරණ</span>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <Navbar />
    </header>
  );
};

export default Header;
