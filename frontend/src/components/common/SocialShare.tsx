import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface SocialShareProps {
  url?: string;
  title: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 px-5 bg-slate-50 border border-slate-200 rounded-xl my-8">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <Share2 className="w-4 h-4 text-rose-900" />
        <span>මෙම ලිපිය බෙදාහරින්න (Share Article):</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1877F2] text-white hover:opacity-90 transition flex items-center gap-1 shadow-xs"
        >
          <span>Facebook</span>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black text-white hover:opacity-90 transition flex items-center gap-1 shadow-xs"
        >
          <span>X</span>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:opacity-90 transition flex items-center gap-1 shadow-xs"
        >
          <span>WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#229ED9] text-white hover:opacity-90 transition flex items-center gap-1 shadow-xs"
        >
          <span>Telegram</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 shadow-xs"
          title="ලිපි සබැඳිය පිටපත් කරන්න"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">පිටපත් විය!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
