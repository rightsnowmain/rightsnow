import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArticlesService } from '../../services/articles.service';
import { FilterOptions } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { Save, History, Eye, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface RevisionItem {
  id: string;
  createdAt: string;
  editor?: { displayName: string; email: string };
  snapshot: any;
}

export const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [newspaperId, setNewspaperId] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'revisions'>('edit');
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [opts, res, revRes] = await Promise.all([
          ArticlesService.getAvailableFilters(),
          api.get(`/admin/articles?limit=100`),
          api.get(`/admin/articles/${id}/revisions`).catch(() => ({ data: [] })),
        ]);
        setFilterOptions(opts);
        setRevisions(revRes.data || []);

        const current = res.data.data.find((a: any) => a.id === id);
        if (current) {
          setTitle(current.title || '');
          setExcerpt(current.excerpt || '');
          setBody(current.body || '');
          setAuthorId(current.authorId || opts.authors?.[0]?.id || '');
          setNewspaperId(current.newspaperId || '');
          setPublisherId(current.publisherId || '');
          setFeaturedImage(current.featuredImage || '');
          setStatus(current.status || 'DRAFT');
          setSelectedCategoryIds(current.categories?.map((c: any) => c.id) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = async (publish = false) => {
    if (!id || !title || !body) return;
    try {
      setSaving(true);
      await api.patch(`/admin/articles/${id}`, {
        title,
        excerpt,
        body,
        authorId,
        newspaperId: newspaperId || undefined,
        publisherId: publisherId || undefined,
        categoryIds: selectedCategoryIds,
        featuredImage: featuredImage || undefined,
      });

      if (publish) {
        await api.post(`/admin/articles/${id}/publish`);
        setStatus('PUBLISHED');
      }

      alert('සංශෝධනයන් සාර්ථකව සුරකින ලදී!');
      // Refresh revisions
      const revRes = await api.get(`/admin/articles/${id}/revisions`).catch(() => ({ data: [] }));
      setRevisions(revRes.data || []);
    } catch (err) {
      alert('සුරැකීම අසාර්ථක විය.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreRevision = (snapshot: any) => {
    if (confirm('මෙම පෙර සංශෝධනය නැවත පිහිටුවීමට ඔබට සහතිකද?')) {
      if (snapshot.title) setTitle(snapshot.title);
      if (snapshot.excerpt) setExcerpt(snapshot.excerpt);
      if (snapshot.body) setBody(snapshot.body);
      setActiveTab('edit');
    }
  };

  if (loading) return <LoadingSpinner message="ලිපි විස්තර සහ සංශෝධන ඉතිහාසය පූරණය වෙමින් පවතී..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/articles')}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900 truncate max-w-lg">{title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">වත්මන් තත්ත්වය: <span className="font-semibold text-rose-900">{status}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 rounded transition ${activeTab === 'edit' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
            >
              සංස්කාරකය
            </button>
            <button
              onClick={() => setActiveTab('revisions')}
              className={`px-3 py-1 rounded transition flex items-center gap-1 ${activeTab === 'revisions' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
            >
              <History className="w-3.5 h-3.5" />
              <span>සංශෝධන ({revisions.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>සුරකින්න</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ශීර්ෂ පාඨය *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-serif font-bold focus:ring-2 focus:ring-rose-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">සාරාංශය (Excerpt)</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
              ></textarea>
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              value={body}
              onChange={setBody}
              label="ලිපියේ අන්තර්ගතය (Body Content) *"
              placeholder="<p>ලිපියේ ඡේද සහ විස්තර මෙහි සටහන් කරන්න...</p>"
              rows={16}
            />
          </div>

          {/* Sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              ප්‍රකාශන විස්තර
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">කතුවරයා</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              >
                {filterOptions?.authors?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">පුවත්පත</label>
              <select
                value={newspaperId}
                onChange={(e) => setNewspaperId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              >
                <option value="">තෝරන්න...</option>
                {filterOptions?.newspapers?.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            <ImageUpload
              value={featuredImage}
              onChange={setFeaturedImage}
              label="ප්‍රධාන ඡායාරූපය (Featured Image)"
              helperText="JPG, PNG, WebP (උපරිම 15MB)"
            />

            {/* Categories Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ප්‍රවර්ග (Categories)</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                {filterOptions?.categories
                  ?.filter((cat) => cat.name !== 'Pages' && cat.name !== 'Uncategorized')
                  .map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => handleToggleCategory(cat.id)}
                        className="rounded text-rose-900 focus:ring-rose-900"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Revisions History Tab */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-rose-900" />
            <span>සංශෝධන ලේඛනය (Article Revisions & Audit Trail)</span>
          </div>

          {revisions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">මෙම ලිපිය සඳහා තවමත් අතීත සංශෝධන සටහන් වී නොමැත.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {revisions.map((rev) => (
                <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      සංස්කාරක: {rev.editor?.displayName || 'කර්තෘ මණ්ඩලය'} ({rev.editor?.email})
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      දිනය: {new Date(rev.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 italic font-serif">
                      "{rev.snapshot?.title}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestoreRevision(rev.snapshot)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    මෙම අනුවාදය ලබාගන්න
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditArticle;
