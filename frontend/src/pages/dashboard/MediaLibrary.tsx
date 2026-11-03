import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Image, Upload, Copy, Check, ExternalLink, Plus, HardDrive, Filter, UploadCloud, Loader2 } from 'lucide-react';

interface MediaItem {
  id: string;
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
  credit?: string;
  createdAt: string;
}

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [filename, setFilename] = useState('');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [credit, setCredit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDirectUpload = async (file: File) => {
    if (!file) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', altText || file.name);
      formData.append('credit', credit || 'සමබිම මාධ්‍ය ඒකකය');

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'උඩුගත කිරීම අසාර්ථක විය.');

      setShowAddModal(false);
      setFilename('');
      setUrl('');
      setAltText('');
      setCredit('');
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'දෝෂයක් සිදු විය.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/media?limit=50');
      setMedia(res.data.data || []);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !url) return;

    try {
      setSubmitting(true);
      await api.post('/admin/media', {
        filename,
        url,
        storageKey: `media-${Date.now()}-${filename}`,
        mimeType: url.endsWith('.png') ? 'image/png' : 'image/jpeg',
        sizeBytes: 1024 * 50,
        altText: altText || filename,
        credit: credit || 'සමබිම ලේඛනාගාරය',
      });
      setShowAddModal(false);
      setFilename('');
      setUrl('');
      setAltText('');
      setCredit('');
      fetchMedia();
    } catch (err) {
      alert('මාධ්‍ය සටහන එක් කිරීම අසාර්ථක විය.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="මාධ්‍ය පුස්තකාලය පූරණය වෙමින් පවතී..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-rose-900" />
            <span>මාධ්‍ය සහ ඡායාරූප පුස්තකාලය (Media Assets)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ලිපි සඳහා භාවිත කරන ඡායාරූප, නිදර්ශන සහ ඓතිහාසික ලේඛන ගොනු
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>නව මාධ්‍යයක් එක් කරන්න</span>
        </button>
      </div>

      {/* Historical Media Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-500" />
          <span>ඓතිහාසික ලේඛනාගාරයේ මුළු ඡායාරූප <strong>2,820ක්</strong> සෘජුව ගොනු පද්ධතිය තුළ සංරක්ෂණය කර ඇත.</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">03_IMAGES/featured</span>
      </div>

      {/* Gallery Grid */}
      {media.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
          <Image className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>තවමත් අමතර මාධ්‍ය ගොනු ලියාපදිංචි කර නොමැත.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-rose-900 font-semibold hover:underline"
          >
            පළමු මාධ්‍ය ගොනුව එක් කරන්න →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <div className="aspect-video bg-slate-100 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.altText || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-slate-800 truncate" title={item.filename}>
                    {item.filename}
                  </div>
                  {item.credit && (
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      ඡායාරූප: {item.credit}
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {item.mimeType?.split('/')[1] || 'IMG'}
                  </span>
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-900 hover:text-rose-700"
                    title="URL පිටපත් කරන්න"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">පිටපත් විය</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-serif text-slate-900">නව මාධ්‍ය ගොනුවක් එක් කරන්න</h3>

            {/* Mode Selector */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setModalMode('upload')}
                className={`pb-2 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                  modalMode === 'upload'
                    ? 'border-rose-900 text-rose-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>ගොනුවක් උඩුගත කරන්න</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('url')}
                className={`pb-2 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                  modalMode === 'url'
                    ? 'border-rose-900 text-rose-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>URL ලියාපදිංචි කරන්න</span>
              </button>
            </div>

            {modalMode === 'upload' ? (
              <div className="space-y-3 text-xs">
                <div
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-rose-900 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-8 h-8 text-rose-900 animate-spin" />
                      <span className="font-semibold text-slate-700">උඩුගත වෙමින් පවතී...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-rose-100 rounded-full text-rose-900">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-rose-900">පරිගණකයෙන් ඡායාරූපයක් තෝරන්න</span>
                      <span className="text-[11px] text-slate-400">JPEG, PNG, WebP, GIF, SVG (උපරිම 15MB)</span>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDirectUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    වසන්න
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateMedia} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ගොනු නාමය (Filename) *</label>
                  <input
                    type="text"
                    required
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="e.g. samabima-march-2026.jpg"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">මාධ්‍ය URL සබැඳිය *</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://... or /03_IMAGES/featured/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">විකල්ප පාඨය (Alt Text)</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="ඡායාරූපය විස්තර කෙරෙන පාඨය"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ඡායාරූප ශිල්පියා / හිමිකම (Credit)</label>
                  <input
                    type="text"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                    placeholder="e.g. සමබිම ඡායාරූප ඒකකය"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    අවලංගු කරන්න
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {submitting ? 'සුරකිමින්...' : 'ලියාපදිංචි කරන්න'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
