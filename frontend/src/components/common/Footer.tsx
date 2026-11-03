import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-900 text-white rounded flex items-center justify-center font-bold text-lg">
              ස
            </div>
            <span className="text-xl font-serif font-bold text-white">සමබිම & Rights Now</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 max-w-md">
            ශ්‍රී ලංකාවේ ප්‍රජාතන්ත්‍රවාදය, නීතියේ ආධිපත්‍යය සහ සමාජ සමානාත්මතාවය උදෙසා පළ වූ ඓතිහාසික ප්‍රකාශන එකතුව සහ ඩිජිටල් මාධ්‍ය ලේඛනාගාරය. 2010 සිට 2021 දක්වා පළ වූ ලිපි සහ පුවත්පත් සංරක්ෂණය කර ඇත.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">අංශ</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/articles" className="hover:text-white transition">සියලු ලිපි</Link></li>
            <li><Link to="/archive" className="hover:text-white transition">ඓතිහාසික ලේඛනාගාරය</Link></li>
            <li><Link to="/newspapers" className="hover:text-white transition">පුවත්පත් සංස්කරණ</Link></li>
            <li><Link to="/authors" className="hover:text-white transition">කතුවරුන්ගේ එකතුව</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">නීතිමය & තොරතුරු</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition">අප පිළිබඳව</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">සම්බන්ධීකරණය</Link></li>
            <li><span className="text-slate-500">ප්‍රකාශන හිමිකම් © 2010 - 2026</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        සමබිම ප්‍රකාශන භාරය සහ Rights Now Collective for Democracy සංරක්ෂිතයි.
      </div>
    </footer>
  );
};

export default Footer;
