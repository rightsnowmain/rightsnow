import api from './api';
import { Author, Category, Newspaper, Publisher } from '../types';
import { FALLBACK_ARTICLES } from './articles.service';

const FALLBACK_NEWSPAPERS: Newspaper[] = [
  {
    id: 'np-samabima',
    name: 'සමබිම පුවත්පත (Samabima Newspaper)',
    slug: 'samabima-newspaper',
    description: 'මානව හිමිකම්, සමානාත්මතාවය සහ පුරවැසි ප්‍රජාතන්ත්‍රවාදය වෙනුවෙන් පෙනී සිටින ප්‍රමුඛ මුද්‍රිත සහ ඩිජිටල් ප්‍රකාශනය.',
    _count: { articles: 282 },
  },
  {
    id: 'np-rightsnow',
    name: 'රයිට්ස් නව් වෙබ් (Rights Now Web)',
    slug: 'rights-now-web',
    description: 'නීතියේ ආධිපත්‍යය, ප්‍රතිපත්ති විශ්ලේෂණ සහ සිවිල් සමාජ නිවේදන ඇතුළත් ඩිජිටල් මාධ්‍ය වේදිකාව.',
    _count: { articles: 124 },
  },
];

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-politics', name: 'දේශපාලන', slug: 'politics', description: 'දේශපාලන විග්‍රහ සහ ආණ්ඩුකරණය', _count: { articles: 1782 } },
  { id: 'cat-human-rights', name: 'මානව හිමිකම්', slug: 'human-rights', description: 'මූලික අයිතිවාසිකම් සහ සමාජ සාධාරණත්වය', _count: { articles: 871 } },
  { id: 'cat-economy', name: 'ආර්ථිකය', slug: 'economy', description: 'ආර්ථික අර්බුදය සහ ප්‍රතිපත්ති', _count: { articles: 606 } },
  { id: 'cat-weekend', name: 'සමබිම සතිඅන්ත අතිරේකය', slug: 'samabima-weekend-supplement', description: 'සතිඅන්ත විශේෂ සංස්කරණ ලිපි', _count: { articles: 514 } },
  { id: 'cat-interviews', name: 'සම්මුඛ සාකච්ඡා', slug: 'cat-e0b783e0b6', description: 'විද්වත් හා දේශපාලන සාකච්ඡා', _count: { articles: 461 } },
  { id: 'cat-law', name: 'නීතිය', slug: 'cat-e0b6b1e0b7', description: 'අධිකරණය සහ නීතිමය විග්‍රහ', _count: { articles: 441 } },
  { id: 'cat-culture', name: 'කලාව සහ සංස්කෘතිය', slug: 'cat-e0b69ae0b6', description: 'සිනමා, සාහිත්‍ය හා සංස්කෘතික විචාර', _count: { articles: 417 } },
  { id: 'cat-national', name: 'ජාතික ගැටලුව', slug: 'cat-e0b6a2e0b7', description: 'ජාතික ගැටලුව සහ සංහිඳියාව', _count: { articles: 402 } },
];

const FALLBACK_AUTHORS: Author[] = [
  { id: 'auth-sudharshana', name: 'සුදර්ශන ගුණවර්ධන', slug: 'සුදර්ශන-ගුණවර්ධන', bio: 'මානව හිමිකම් ක්‍රියාකාරී සහ නීතිවේදී', _count: { articles: 119 } },
  { id: 'auth-ranil', name: 'රනිල් වික්‍රමසිංහ', slug: 'රනිල්-වික්-රමසිංහ', bio: 'දේශපාලන ලිපි සහ විග්‍රහ', _count: { articles: 82 } },
  { id: 'auth-deepthi', name: 'දීප්ති කුමාර ගුණරත්න', slug: 'දීප්ති-කුමාර-ගුණරත්න', bio: 'දේශපාලන න්‍යාය සහ දාර්ශනික විචාරක', _count: { articles: 55 } },
  { id: 'auth-nimalka', name: 'ආචාර්ය නිමල්කා ප්‍රනාන්දු', slug: 'ආචාර්ය-නිමල්කා-ප්-රනාන්දු', bio: 'කාන්තා සහ මානව හිමිකම් ක්‍රියාකාරිණී', _count: { articles: 26 } },
  { id: 'auth-bahu', name: 'ආචාර්ය වික්‍රමබාහු කරුණාරත්න', slug: 'ආචාර්ය-වික්-රමබාහු-කරුණාරත්න', bio: 'දේශපාලන විශ්ලේෂක සහ ලේඛක', _count: { articles: 25 } },
  { id: 'auth-udagama', name: 'මහාචාර්ය දීපිකා උඩගම', slug: 'මහාචාර්ය-දීපිකා-උඩගම', bio: 'නීති මහාචාර්ය සහ මානව හිමිකම් විශාරද', _count: { articles: 15 } },
];

export const PublishersService = {
  getPublishers: async (): Promise<Publisher[]> => {
    try {
      const res = await api.get('/publishers');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return [];
  },

  getPublisherBySlug: async (slug: string): Promise<Publisher & { articles: any[] }> => {
    const res = await api.get(`/publishers/${slug}`);
    return res.data;
  },

  getNewspapers: async (): Promise<Newspaper[]> => {
    try {
      const res = await api.get('/newspapers');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return FALLBACK_NEWSPAPERS;
  },

  getNewspaperBySlug: async (slug: string): Promise<Newspaper & { articles: any[] }> => {
    try {
      const res = await api.get(`/newspapers/${slug}`);
      if (res.data && typeof res.data === 'object' && res.data.name) return res.data;
    } catch {}
    const fb = FALLBACK_NEWSPAPERS.find((n) => n.slug === slug) || FALLBACK_NEWSPAPERS[0];
    const matching = FALLBACK_ARTICLES.filter((a) => a.newspaper?.slug === fb.slug);
    const articles = matching.length > 0 ? matching : FALLBACK_ARTICLES.slice(0, 3);
    return { ...fb, articles };
  },

  getAuthors: async (): Promise<Author[]> => {
    try {
      const res = await api.get('/authors');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return FALLBACK_AUTHORS;
  },

  getAuthorBySlug: async (slug: string): Promise<Author & { articles: any[] }> => {
    try {
      const res = await api.get(`/authors/${slug}`);
      if (res.data && typeof res.data === 'object' && res.data.name) return res.data;
    } catch {}
    const fb = FALLBACK_AUTHORS.find((a) => a.slug === slug) || FALLBACK_AUTHORS[0];
    const matching = FALLBACK_ARTICLES.filter((a) => a.author?.slug === fb.slug);
    const articles = matching.length > 0 ? matching : FALLBACK_ARTICLES.slice(0, 2);
    return { ...fb, articles };
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await api.get('/categories');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return FALLBACK_CATEGORIES;
  },
};
