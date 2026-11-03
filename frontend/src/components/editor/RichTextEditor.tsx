import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  UploadCloud,
  Eye,
  Edit3,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'ලිපියේ අන්තර්ගතය (Body Content) *',
  placeholder = '<p>ලිපියේ ඡේද සහ විස්තර මෙහි සටහන් කරන්න...</p>',
  rows = 15,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal image form state
  const [imageModalMode, setImageModalMode] = useState<'upload' | 'url'>('upload');
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalImageCaption, setModalImageCaption] = useState('');
  const [modalSelectedFile, setModalSelectedFile] = useState<File | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Insert text/tags at current cursor position
  const insertAtCursor = (textBefore: string, textAfter = '', defaultSelection = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + textBefore + defaultSelection + textAfter);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultSelection;
    const replacement = textBefore + selectedText + textAfter;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textBefore.length, start + textBefore.length + selectedText.length);
    }, 50);
  };

  // Upload an image file to the backend
  const uploadImageFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'කරුණාකර වලංගු ඡායාරූප ගොනුවක් පමණක් තෝරන්න (JPEG, PNG, WebP, ආදිය).');
      return null;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'ඡායාරූපයේ ප්‍රමාණය 15MB ට වඩා අඩු විය යුතුය.');
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය.');
      }

      showToast('success', 'ඡායාරූපය සාර්ථකව උඩුගත කර අන්තර්ගතයට එක් කරන ලදී!');
      return data.url;
    } catch (err: any) {
      showToast('error', err.message || 'ඡායාරූපය උඩුගත කිරීමේදී දෝෂයක් සිදු විය.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle uploading and formatting HTML insertion
  const handleUploadAndInsert = async (file: File, caption?: string) => {
    const url = await uploadImageFile(file);
    if (url) {
      const cap = caption?.trim() || file.name.replace(/\.[^/.]+$/, '');
      const figureHtml = `\n<figure class="my-5">\n  <img src="${url}" alt="${cap}" class="rounded-xl w-full max-h-[500px] object-cover shadow-sm border border-slate-200" />\n  <figcaption class="text-xs text-center text-slate-500 mt-2 italic">${cap}</figcaption>\n</figure>\n`;
      insertAtCursor(figureHtml);
    }
  };

  // Drag and drop onto textarea
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          await handleUploadAndInsert(file);
        }
      }
    }
  };

  // Clipboard paste (Ctrl+V) handler
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleUploadAndInsert(file, 'සමබිම අන්තර්ගත ඡායාරූපය');
        }
        return;
      }
    }
  };

  // Handle submit from the Image Modal
  const handleInsertFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageModalMode === 'upload') {
      if (!modalSelectedFile) {
        showToast('error', 'කරුණාකර පරිගණකයෙන් ඡායාරූපයක් තෝරන්න.');
        return;
      }
      await handleUploadAndInsert(modalSelectedFile, modalImageCaption);
    } else {
      if (!modalImageUrl.trim()) {
        showToast('error', 'කරුණාකර ඡායාරූපයේ URL සබැඳිය ඇතුළත් කරන්න.');
        return;
      }
      const cap = modalImageCaption.trim() || 'ඡායාරූපය';
      const figureHtml = `\n<figure class="my-5">\n  <img src="${modalImageUrl.trim()}" alt="${cap}" class="rounded-xl w-full max-h-[500px] object-cover shadow-sm border border-slate-200" />\n  <figcaption class="text-xs text-center text-slate-500 mt-2 italic">${cap}</figcaption>\n</figure>\n`;
      insertAtCursor(figureHtml);
    }

    // Reset modal
    setShowImageModal(false);
    setModalImageUrl('');
    setModalImageCaption('');
    setModalSelectedFile(null);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">
            HTML & ඡායාරූප Drag/Paste සහාය දක්වයි
          </span>
        </div>
      )}

      {/* Editor Box */}
      <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-900 bg-white shadow-xs">
        {/* Toolbar Header */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-700">
          {/* Formatting Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertAtCursor('<strong>', '</strong>', 'තද පැහැති පාඨය')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Bold (තද පැහැති)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('<em>', '</em>', 'ඇල අකුරු')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Italic (ඇල අකුරු)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={() => insertAtCursor('<h2>', '</h2>', 'උප ශීර්ෂය')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Heading 2 (උප ශීර්ෂය)"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('<h3>', '</h3>', 'අතුරු ශීර්ෂය')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Heading 3 (අතුරු ශීර්ෂය)"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('<blockquote><p>', '</p></blockquote>', 'උපුටා දැක්වීම')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Quote (උපුටා දැක්වීම)"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>', 'ලැයිස්තු අංගය')}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Bullet List (ලැයිස්තුව)"
            >
              <List className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-0.5" />

            {/* Quick Upload Button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => quickFileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 rounded text-rose-900 font-semibold transition"
              title="පරිගණකයෙන් ඡායාරූපයක් සෘජුව උඩුගත කරන්න"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>ඡායාරූපයක් Upload කරන්න</span>
            </button>

            {/* Modal Image Button */}
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="ඡායාරූපයක් ඇතුළත් කිරීමේ විකල්ප (Upload / URL)"
            >
              <ImageIcon className="w-4 h-4 text-rose-900" />
            </button>

            {/* Link Button */}
            <button
              type="button"
              onClick={() => {
                const url = prompt('සබැඳිය (URL):', 'https://');
                if (url) insertAtCursor(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-rose-900 underline">`, '</a>', 'සබැඳි පාඨය');
              }}
              className="p-1.5 hover:bg-white rounded transition text-slate-700 hover:text-slate-900"
              title="Link (සබැඳියක්)"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            {/* Hidden Quick File Input */}
            <input
              ref={quickFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadAndInsert(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>

          {/* Edit / Preview Mode Switch */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'edit'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>සංස්කරණය (Edit)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-white text-rose-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>පෙරදසුන (Preview)</span>
            </button>
          </div>
        </div>

        {/* Uploading Status Banner */}
        {uploading && (
          <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center gap-2 text-xs text-rose-900 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-rose-900 shrink-0" />
            <span>ඡායාරූපය සේවාදායකයට උඩුගත වෙමින් පවතී, කරුණාකර රැඳී සිටින්න...</span>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            className={`px-4 py-2 border-b flex items-center justify-between text-xs font-medium transition ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'edit' ? (
          <div
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              rows={rows}
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              placeholder={placeholder}
              className="w-full p-4 text-xs font-mono leading-relaxed bg-slate-50 focus:bg-white focus:outline-hidden transition min-h-[300px]"
            />

            {/* Drag & Drop Visual Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-rose-900/10 backdrop-blur-2xs border-2 border-dashed border-rose-900 rounded-b-xl flex flex-col items-center justify-center gap-3 p-6 pointer-events-none z-10">
                <div className="p-4 bg-white rounded-full shadow-lg text-rose-900">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-rose-950">
                    ඡායාරූපය ලිපියට එක් කිරීමට මෙහි දමන්න (Drop image here)
                  </p>
                  <p className="text-xs text-rose-800 mt-1">
                    ස්වයංක්‍රීයව Upload වී HTML ලෙස අන්තර්ගතයට ඇතුළත් වේ.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Live Visual Preview */
          <div className="p-6 bg-white min-h-[300px] overflow-y-auto max-h-[500px]">
            {value.trim() ? (
              <div
                className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-12">
                පෙරදසුන නැරඹීම සඳහා ලිපියට අන්තර්ගතයක් එක් කරන්න.
              </p>
            )}
          </div>
        )}

        {/* Footer Hint */}
        <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>
            💡 <strong>ඉඟිය:</strong> පරිගණකයෙන් ඡායාරූපයක් කෙලින්ම මෙහි <strong>Drag & Drop</strong> කරන්න, නැතහොත් Copy කර <strong>Ctrl + V</strong> මගින් Paste කරන්න.
          </span>
          <span className="font-mono">
            {value.length} අක්ෂර
          </span>
        </div>
      </div>

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-900" />
                <span>ලිපියට ඡායාරූපයක් එක් කරන්න</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setImageModalMode('upload')}
                className={`pb-2 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                  imageModalMode === 'upload'
                    ? 'border-rose-900 text-rose-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>ගොනුවක් උඩුගත කරන්න</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalMode('url')}
                className={`pb-2 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                  imageModalMode === 'url'
                    ? 'border-rose-900 text-rose-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>සබැඳියක් (URL)</span>
              </button>
            </div>

            <form onSubmit={handleInsertFromModal} className="space-y-3 text-xs">
              {imageModalMode === 'upload' ? (
                <div>
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-rose-900 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50/20"
                  >
                    <div className="p-2.5 bg-rose-100 rounded-full text-rose-900">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    {modalSelectedFile ? (
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[280px]">
                          {modalSelectedFile.name}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          තෝරාගත් ගොනුව ({(modalSelectedFile.size / 1024).toFixed(0)} KB) — වෙනස් කිරීමට ක්ලික් කරන්න
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-rose-900">පරිගණකයෙන් ඡායාරූපයක් තෝරන්න</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          JPEG, PNG, WebP (උපරිම 15MB)
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setModalSelectedFile(e.target.files[0]);
                        if (!modalImageCaption) {
                          setModalImageCaption(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ඡායාරූප සබැඳිය (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... හෝ /03_IMAGES/featured/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ඡායාරූප සිරස්තලය / විස්තරය (Caption / Alt Text)
                </label>
                <input
                  type="text"
                  value={modalImageCaption}
                  onChange={(e) => setModalImageCaption(e.target.value)}
                  placeholder="e.g. කොළඹ පැවති විරෝධතාවයේ දසුනක්"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>අන්තර්ගතයට එක් කරන්න</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
