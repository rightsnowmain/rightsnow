import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900">
          සම්බන්ධීකරණය (Contact Us)
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          සමබිම සහ Rights Now ලේඛනාගාර කණ්ඩායම සමඟ සම්බන්ධ වන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-rose-900 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">කාර්යාල ලිපිනය</h3>
              <p className="text-sm text-slate-600 mt-1">කොළඹ, ශ්‍රී ලංකාව.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-rose-900 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">විද්‍යුත් තැපෑල</h3>
              <p className="text-sm text-slate-600 mt-1">info@samabima.org | contact@rightsnow.net</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-rose-900 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">දුරකථන අංකය</h3>
              <p className="text-sm text-slate-600 mt-1">+94 (0) 11 234 5678</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {submitted ? (
            <div className="text-center py-8">
              <h4 className="text-lg font-bold text-slate-900 mb-2">ස්තූතියි!</h4>
              <p className="text-xs text-slate-600">ඔබගේ පණිවිඩය සාර්ථකව ලැබිණි. අප කණ්ඩායම ඔබ හා සම්බන්ධ වනු ඇත.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">නම</label>
                <input
                  type="text"
                  required
                  placeholder="ඔබගේ නම"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">විද්‍යුත් තැපෑල</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">පණිවිඩය</label>
                <textarea
                  rows={4}
                  required
                  placeholder="ඔබගේ විමසීම හෝ අදහස..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-900 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-900 hover:bg-rose-800 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>පණිවිඩය යවන්න</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
