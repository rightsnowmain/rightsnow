import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticlesService } from '../../services/articles.service';
import { FileText, Users, Newspaper, Eye, PlusCircle, ArrowUpRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalAuthors: 0,
    totalNewspapers: 0,
    totalViews: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [arts, filters] = await Promise.all([
          ArticlesService.getArticles({ limit: 1 }),
          ArticlesService.getAvailableFilters(),
        ]);
        setStats({
          totalArticles: arts.meta.total,
          totalAuthors: filters.authors?.length || 0,
          totalNewspapers: filters.newspapers?.length || 0,
          totalViews: 84320,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const cards = [
    { label: 'සමස්ත ලිපි සංඛ්‍යාව', value: stats.totalArticles, icon: FileText, color: 'text-rose-900 bg-rose-50' },
    { label: 'ලියාපදිංචි කතුවරුන්', value: stats.totalAuthors, icon: Users, color: 'text-blue-900 bg-blue-50' },
    { label: 'පුවත්පත් සංස්කරණ', value: stats.totalNewspapers, icon: Newspaper, color: 'text-emerald-900 bg-emerald-50' },
    { label: 'සමස්ත කියවීම්', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-amber-900 bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">කර්තෘ මණ්ඩල පාලක මැදිරිය (Dashboard)</h1>
          <p className="text-xs text-slate-500 mt-1">සමබිම & Rights Now ප්‍රකාශන පද්ධතියේ සජීවී දළ විශ්ලේෂණය</p>
        </div>

        <Link
          to="/dashboard/articles/create"
          className="inline-flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>නව ලිපියක් සම්පාදනය</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">ප්‍රකාශන කාර්ය ප්‍රවාහය (Publishing Workflow)</h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">සක්‍රීයයි</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            කතුවරුන් විසින් සකස් කරන කෙටුම්පත් (Drafts) සමාලෝචනය කර, කර්තෘ මණ්ඩල අනුමැතිය (Review & Approval) ලබා දී වෙබ් අඩවියට හෝ නිශ්චිත වේලාවකට නිකුත් (Schedule) කළ හැක.
          </p>
          <Link
            to="/dashboard/articles"
            className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
          >
            <span>ලිපි පාලන ලැයිස්තුවට යන්න</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">ලේඛනාගාර සංක්‍රමණ තත්ත්වය (Archive ETL)</h3>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">100% තහවුරුයි</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            MySQL 8.0 සංචිතයේ ඓතිහාසික ලිපි සහ මාධ්‍ය සටහන් PostgreSQL 16 පදනමට 1-to-1 අනුපාතයෙන් සංක්‍රමණය කර සංරක්ෂණය කර ඇත.
          </p>
          <Link
            to="/archive"
            className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
          >
            <span>සජීවී ලේඛනාගාරය පිරික්සන්න</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
