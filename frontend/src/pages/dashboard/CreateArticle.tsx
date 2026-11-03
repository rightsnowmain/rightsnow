import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArticlesService } from '../../services/articles.service';
import { FilterOptions } from '../../types';
import { Send, Save, Eye, Clock } from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import RichTextEditor from '../../components/editor/RichTextEditor';

export const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [newspaperId, setNewspaperId] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    ArticlesService.getAvailableFilters().then((opts) => {
      setFilterOptions(opts);
      if (opts.authors?.[0]) setAuthorId(opts.authors[0].id);
      if (opts.newspapers?.[0]) setNewspaperId(opts.newspapers[0].id);
      if (opts.publishers?.[0]) setPublisherId(opts.publishers[0].id);
    });
  }, []);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (workflowAction: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'SCHEDULED') => {
    if (!title || !body || !authorId) {
      alert('කරුණාකර ශීර්ෂ පාඨය, කතුවරයා සහ අන්තර්ගතය සම්පූර්ණ කරන්න.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/admin/articles', {
        title,
        excerpt,
        body,
        authorId,
        newspaperId: newspaperId || undefined,
        publisherId: publisherId || undefined,
        categoryIds: selectedCategoryIds,
        featuredImage: featuredImage || undefined,
        status: workflowAction,
        scheduledAt: workflowAction === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });

      const messageMap: Record<string, string> = {
        DRAFT: 'කෙටුම්පතක් ලෙස සාර්ථකව සුරකින ලදී!',
        IN_REVIEW: 'සමාලෝචනය සඳහා කර්තෘ මණ්ඩලයට යොමු කරන ලදී!',
        PUBLISHED: 'ලිපිය සාර්ථකව සජීවීව පළ කරන ලදී!',
        SCHEDULED: `ලිපිය ${scheduledAt} දින පළ කිරීම සඳහා නියම කරන ලදී!`,
      };
      alert(messageMap[workflowAction]);
      navigate('/dashboard/articles');
    } catch (err) {
      alert('ලිපිය සුරැකීම අසාර්ථක විය.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900">නව ලිපියක් සම්පාදනය (CMS Editor)</h1>
          <p className="text-xs text-slate-500 mt-1">කර්තෘ මණ්ඩල ප්‍රකාශන ප්‍රමිතීන්ට අනුව ලිපි සකස් කරන්න</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreview ? 'සංස්කාරකය (Editor)' : 'පූර්වදර්ශනය (Preview)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>කෙටුම්පත (Draft)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('IN_REVIEW')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>සමාලෝචනයට (Submit)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-sm"
          >
            <span>සෘජුව පළ කරන්න (Publish)</span>
          </button>
        </div>
      </div>

      {isPreview ? (
        /* Live Preview Mode */
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <span className="text-xs font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded">පූර්වදර්ශන පිටුව</span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900 mt-4 mb-4">{title || 'නොදන්නා ශීර්ෂ පාඨයක්'}</h1>
          {excerpt && <p className="text-base italic text-slate-600 border-l-4 border-rose-900 pl-4 py-2 my-4 bg-slate-50">{excerpt}</p>}
          {featuredImage && (
            <img src={featuredImage} alt="Featured" className="w-full max-h-96 object-cover rounded-lg my-4" />
          )}
          <div className="prose prose-slate max-w-none text-slate-800 mt-6" dangerouslySetInnerHTML={{ __html: body || '<p>ලිපියේ අන්තර්ගතය මෙතෙක් ඇතුළත් කර නොමැත.</p>' }} />
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ලිපියේ ශීර්ෂ පාඨය (Headline) *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ශීර්ෂ පාඨය ඇතුළත් කරන්න..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-serif font-bold focus:ring-2 focus:ring-rose-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">සාරාංශය / හැඳින්වීම (Excerpt)</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="ලිපියේ මූලික හරය සාරාංශ කර දක්වන්න..."
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

          {/* Sidebar Publishing Settings */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
                ප්‍රකාශන සැකසුම් (Metadata)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">කතුවරයා (Author) *</label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                >
                  {filterOptions?.authors?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">පුවත්පත (Newspaper)</label>
                <select
                  value={newspaperId}
                  onChange={(e) => setNewspaperId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                >
                  <option value="">තෝරන්න...</option>
                  {filterOptions?.newspapers?.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ප්‍රකාශකයා (Publisher)</label>
                <select
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                >
                  <option value="">තෝරන්න...</option>
                  {filterOptions?.publishers?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
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

              {/* Schedule Release */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>පළකිරීම නියම කරන්න (Schedule)</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                />
                {scheduledAt && (
                  <button
                    type="button"
                    onClick={() => handleSubmit('SCHEDULED')}
                    className="w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold py-1.5 rounded-lg text-xs transition"
                  >
                    නියමිත වේලාවට පළ කරන්න
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArticle;
