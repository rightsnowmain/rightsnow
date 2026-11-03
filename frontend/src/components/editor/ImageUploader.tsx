import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export const ImageUploader: React.FC<{ onUpload: (url: string) => void }> = ({ onUpload }) => {
  const [url, setUrl] = useState('');

  return (
    <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3">
      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
      <p className="text-xs text-slate-500">ඡායාරූප සබැඳිය (URL) හෝ ගොනුව තෝරන්න</p>
      <div className="flex max-w-sm mx-auto gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={() => { if (url) onUpload(url); }}
          className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg"
        >
          එක් කරන්න
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
