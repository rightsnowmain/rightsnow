import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Shield, UserCheck, UserX, Mail, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'READER';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  _count?: { comments: number };
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError('පරිශීලක ලැයිස්තුව ලබා ගැනීමට නොහැකි විය. කරුණාකර පරිපාලක (Admin) ගිණුමකින් ඇතුළු වී ඇත්දැයි බලන්න.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err) {
      alert('භූමිකාව යාවත්කාලීන කිරීම අසාර්ථක විය.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setUpdatingId(userId);
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus as any } : u))
      );
    } catch (err) {
      alert('ගිණුම් තත්ත්වය වෙනස් කිරීම අසාර්ථක විය.');
    } finally {
      setUpdatingId(null);
    }
  };

  const roleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      ADMIN: { bg: 'bg-rose-100 text-rose-800', text: 'පරිපාලක (ADMIN)' },
      EDITOR: { bg: 'bg-purple-100 text-purple-800', text: 'කර්තෘ (EDITOR)' },
      AUTHOR: { bg: 'bg-blue-100 text-blue-800', text: 'ලේඛක (AUTHOR)' },
      READER: { bg: 'bg-slate-100 text-slate-700', text: 'පාඨක (READER)' },
    };
    const c = config[role] || { bg: 'bg-slate-100 text-slate-600', text: role };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.bg}`}>
        {c.text}
      </span>
    );
  };

  if (loading) return <LoadingSpinner message="පරිශීලක දත්ත පූරණය වෙමින් පවතී..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-900" />
            <span>පරිශීලකයන් සහ භූමිකා කළමනාකරණය (Users & RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            පරිපාලක (Admin), කර්තෘ (Editor), ලේඛක (Author) සහ පාඨක (Reader) ප්‍රවේශ අවසර කළමනාකරණය
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition"
        >
          යාවත්කාලීන කරන්න
        </button>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-xs text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">අවසර හෝ දත්ත දෝෂයක්</h4>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">පරිශීලකයා</th>
                <th className="px-4 py-3">වත්මන් භූමිකාව</th>
                <th className="px-4 py-3">භූමිකාව වෙනස් කරන්න</th>
                <th className="px-4 py-3">තත්ත්වය</th>
                <th className="px-4 py-3">ලියාපදිංචි දිනය</th>
                <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    පරිශීලකයන් සටහන් වී නොමැත.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {u.displayName?.slice(0, 1) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.displayName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {roleBadge(u.role)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-800 disabled:opacity-50"
                      >
                        <option value="READER">READER (පාඨක)</option>
                        <option value="AUTHOR">AUTHOR (ලේඛක)</option>
                        <option value="EDITOR">EDITOR (කර්තෘ)</option>
                        <option value="ADMIN">ADMIN (පරිපාලක)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'ක්‍රියාකාරී' : 'අත්හිටුවූ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('si-LK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        disabled={updatingId === u.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          u.status === 'ACTIVE'
                            ? 'text-red-700 hover:bg-red-50 border border-red-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        } disabled:opacity-50`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>අත්හිටුවන්න</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>සක්‍රිය කරන්න</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
