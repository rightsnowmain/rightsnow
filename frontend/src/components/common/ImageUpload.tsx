import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'ප්‍රධාන ඡායාරූපය (Featured Image)',
  helperText = 'JPG, PNG, WebP, GIF, SVG (උපරිම 15MB)',
  className = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('කරුණාකර වලංගු ඡායාරූප ගොනුවක් පමණක් තෝරන්න (JPEG, PNG, WebP, ආදිය)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('ගොනුවේ ප්‍රමාණය 15MB ට වඩා අඩු විය යුතුය.');
      return;
    }

    setError(null);
    setUploading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය.');
      }

      if (data.url) {
        onChange(data.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'ගොනුව උඩුගත කිරීමේදී දෝෂයක් සිදු විය.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Preview Card if image is already selected */}
      {value ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
            <img
              src={value}
              alt="Featured Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] text-white/90 truncate font-mono">
                {value}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                onChange('');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ඉවත් කරන්න</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-rose-900" />
              <span>වෙනත් ඡායාරූපයක් තෝරන්න</span>
            </button>
          </div>
        </div>
      ) : (
        /* Upload / URL Selector */
        <div className="space-y-2">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setMode('upload'); setError(null); }}
              className={`pb-1.5 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                mode === 'upload'
                  ? 'border-rose-900 text-rose-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>ගොනුවක් උඩුගත කරන්න</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('url'); setError(null); }}
              className={`pb-1.5 px-3 inline-flex items-center gap-1.5 transition border-b-2 -mb-px ${
                mode === 'url'
                  ? 'border-rose-900 text-rose-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>සබැඳියක් (URL)</span>
            </button>
          </div>

          {mode === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-rose-900 bg-rose-50/50'
                  : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
              } ${uploading ? 'opacity-60 cursor-wait' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-rose-900 animate-spin" />
                  <span className="text-xs font-semibold text-slate-700">
                    ඡායාරූපය උඩුගත වෙමින් පවතී...
                  </span>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-rose-100/60 rounded-full text-rose-900">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-900 hover:underline">
                      ඡායාරූපය මෙහි ඇද දමන්න (Drag & Drop)
                    </span>
                    <span className="text-xs text-slate-500"> හෝ </span>
                    <span className="text-xs font-bold text-slate-700 underline">
                      පරිගණකයෙන් තෝරන්න
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {helperText}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/... හෝ /03_IMAGES/featured/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400">
                බාහිර හෝ අභ්‍යන්තර ඡායාරූප සබැඳිය ඇතුළත් කරන්න.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Status Notifications */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>ඡායාරූපය සාර්ථකව උඩුගත විය!</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

