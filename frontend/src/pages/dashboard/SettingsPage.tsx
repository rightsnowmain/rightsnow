import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-serif text-slate-900">පද්ධති සැකසුම් (System Settings)</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">වෙබ් අඩවියේ නම (Site Name)</label>
          <input
            type="text"
            defaultValue="සමබිම & Rights Now Digital Publishing & Archive"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">ප්‍රධාන විද්‍යුත් තැපෑල</label>
          <input
            type="email"
            defaultValue="info@samabima.org"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">පෙරනිමි කාල කලාපය (Timezone)</label>
          <input
            type="text"
            defaultValue="Asia/Colombo (UTC+5:30)"
            disabled
            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
