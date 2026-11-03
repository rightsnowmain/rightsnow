import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900">
          අප පිළිබඳව (About Us)
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          සමබිම පුවත්පත සහ Rights Now ප්‍රකාශන එකතුවේ ඉතිහාසය සහ අරමුණ
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-base">
        <p>
          <strong>සමබිම</strong> යනු ශ්‍රී ලංකාවේ මානව හිමිකම්, නීතියේ ආධිපත්‍යය, සාධාරණත්වය සහ ප්‍රජාතන්ත්‍රවාදී පුරවැසි අයිතිවාසිකම් වෙනුවෙන් හඬ නැගූ ප්‍රමුඛතම විකල්ප මුද්‍රිත පුවත්පතකි. 2010 වසරේදී ආරම්භ වූ මෙම ප්‍රකාශනය, ශ්‍රී ලංකා සමාජයේ ගැඹුරු සමාජ-දේශපාලනික පරිවර්තනයන් පිළිබඳ ගැඹුරු විග්‍රහයන් සහ පුරවැසි සංවාද ජනගත කිරීමේ තීරණාත්මක කාර්යභාරයක් ඉටු කළේය.
        </p>
        <p>
          <strong>Rights Now Collective for Democracy</strong> ආයතනය සමඟ එක්ව ගොඩනැගූ මෙම ඩිජිටල් සංරක්ෂණාගාරය හරහා, 2010 සිට 2021 දක්වා වූ දශකයකට වැඩි කාලයක් පුරා පළවූ 5,000කට අධික ලිපි, පුවත්පත් සංස්කරණ, පර්යේෂණ වාර්තා සහ ඡායාරූප සදාකාලිකවම පර්යේෂකයන්, මාධ්‍යවේදීන් සහ අනාගත පරපුර උදෙසා සුරක්ෂිතව තබා ඇත.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
