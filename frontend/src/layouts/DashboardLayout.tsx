import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Newspaper, Users, FolderTree, Image, BarChart3, Settings, LogOut, Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { AuthService } from '../services/auth.service';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  createdAt: string;
  read: boolean;
}

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if offline
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string, link: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setShowNotifications(false);
      navigate(link);
    } catch {
      navigate(link);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/auth/login');
  };

  const navLinks = [
    { name: 'දළ විශ්ලේෂණය (Overview)', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ලිපි කළමනාකරණය (Articles)', path: '/dashboard/articles', icon: FileText },
    { name: 'අදහස් කළමනාකරණය (Comments)', path: '/dashboard/comments', icon: MessageSquare },
    { name: 'ප්‍රකාශන & පුවත්පත් (Publications)', path: '/dashboard/publishers', icon: Newspaper },
    { name: 'කතුවරුන් (Authors)', path: '/dashboard/authors', icon: Users },
    { name: 'ප්‍රවර්ග (Categories)', path: '/dashboard/categories', icon: FolderTree },
    { name: 'මාධ්‍ය පුස්තකාලය (Media)', path: '/dashboard/media', icon: Image },
    { name: 'විශ්ලේෂණ (Analytics)', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'සැකසුම් (Settings)', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-rose-900 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-hidden text-xs font-bold"
      >
        පාලක පුවරු අන්තර්ගතය වෙත යන්න (Skip to dashboard content)
      </a>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-rose-900 text-white flex items-center justify-center font-bold">
              ස
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">සමබිම CMS</h2>
              <p className="text-xs text-slate-400">කර්තෘ මණ්ඩල පාලක මැදිරිය</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-800 hover:text-white transition"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <p className="font-semibold text-white">{user?.displayName || 'පරිපාලක'}</p>
            <p className="text-slate-500 text-[10px]">{user?.role || 'ADMIN'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-400 transition"
            title="පිටවීම"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs font-semibold text-rose-900 hover:underline">
            ← ප්‍රධාන වෙබ් අඩවියට පිවිසෙන්න
          </Link>
          <div className="flex items-center gap-4 text-xs">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="දැනුම්දීම් (Notifications)"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">පද්ධති දැනුම්දීම්</span>
                    <span className="text-[10px] text-slate-400">{unreadCount} ක් නොකියවූ</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        දැනුම්දීම් නොමැත.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id, n.link)}
                          className={`p-3 cursor-pointer hover:bg-slate-50 transition ${
                            !n.read ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 text-xs line-clamp-1">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs border-l border-slate-200 pl-4">
              <span className="text-slate-500">පරිශීලක:</span>
              <span className="font-medium text-slate-800">{user?.email || 'admin@samabima.org'}</span>
            </div>
          </div>
        </header>

        <main id="dashboard-main" className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
