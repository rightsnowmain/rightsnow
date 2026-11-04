import api from './api';
import { Article, FilterOptions, PaginatedResponse } from '../types';

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'art-demo-1',
    slug: 'democraciat-abbehivenna-22822',
    title: 'ප්‍රජාතන්ත්‍රවාදයට ඇබ්බැහි වෙන්න !',
    excerpt: 'ශ්‍රී ලංකාවේ ව්‍යවස්ථාපිත ප්‍රජාතන්ත්‍රවාදය හා පුරවැසි අයිතිවාසිකම් රැකගැනීමේ අත්‍යාවශ්‍ය සටන පිළිබඳ ගැඹුරු විග්‍රහයක්.',
    body: '<p>ශ්‍රී ලංකාවේ ප්‍රජාතන්ත්‍රවාදී ව්‍යුහයන්ගේ ශක්තිමත්භාවය රඳා පවතින්නේ පුරවැසියාගේ ක්‍රියාකාරී සහභාගිත්වය මතය.</p>',
    publishedAt: '2021-10-04T20:36:08Z',
    originalPublishedAt: '2021-10-04T20:36:08Z',
    viewCount: 1420,
    author: { id: 'auth-1', name: 'සුදර්ශන ගුණවර්ධන', slug: 'සුදර්ශන-ගුණවර්ධන' },
    newspaper: { id: 'np-1', name: 'සමබිම පුවත්පත', slug: 'samabima-newspaper' },
    categories: [
      { id: 'c1', name: 'දේශපාලන', slug: 'politics' },
      { id: 'c2', name: 'මානව හිමිකම්', slug: 'human-rights' },
    ],
  },
  {
    id: 'art-demo-2',
    slug: 'kotalawala-act-threat-22802',
    title: 'කොතලාවල පනත භයානක ප්‍රවණතාවයක්, සිවිල් සංවිධාන රජයට කියයි',
    excerpt: 'කොතලාවල ආරක්ෂක විශ්වවිද්‍යාල පනත හරහා අධ්‍යාපනය මිලිටරිකරණයට ගන්නා උත්සාහය නතර කරන ලෙස සිවිල් සංවිධාන ඉල්ලයි.',
    body: '<p>කොතලාවල ආරක්ෂක විශ්වවිද්‍යාල පනත හරහා අධ්‍යාපනය මිලිටරිකරණයට ගන්නා උත්සාහය නතර කරන ලෙස සිවිල් ක්‍රියාකාරීන් රජයට බල කරයි.</p>',
    publishedAt: '2021-09-14T10:00:00Z',
    originalPublishedAt: '2021-09-14T10:00:00Z',
    viewCount: 890,
    author: { id: 'auth-2', name: 'Rightsnow Collective for Democracy', slug: 'author-526967687473' },
    newspaper: { id: 'np-2', name: 'රයිට්ස් නව් වෙබ්', slug: 'rights-now-web' },
    categories: [
      { id: 'c3', name: 'සාමකාමී ලෙස රැස්වීමේ නිදහස', slug: 'freedom-of-assembly' },
      { id: 'c4', name: 'ප්‍රජාතන්ත්‍රවාදය', slug: 'democracy' },
    ],
  },
  {
    id: 'art-demo-3',
    slug: 'national-reconciliation-citizens-democracy',
    title: 'ජාතික ප්‍රතිසන්ධානය සහ පුරවැසි ප්‍රජාතන්ත්‍රවාදය',
    excerpt: 'පශ්චාත් යුද සමාජයක සැබෑ සංහිඳියාවක් සහ තිරසාර සාමයක් ගොඩනැගීමට නම් ජාතික ගැටලුවට දේශපාලන විසඳුමක් අවශ්‍ය වේ.',
    body: '<p>පශ්චාත් යුද සමාජයක සැබෑ සංහිඳියාවක් සහ තිරසාර සාමයක් ගොඩනැගීමට නම් ජාතික ගැටලුවට දේශපාලන විසඳුමක් අවශ්‍ය වේ.</p>',
    publishedAt: '2020-11-20T14:30:00Z',
    originalPublishedAt: '2020-11-20T14:30:00Z',
    viewCount: 654,
    author: { id: 'auth-3', name: 'මහාචාර්ය දීපිකා උඩගම', slug: 'මහාචාර්ය-දීපිකා-උඩගම' },
    newspaper: { id: 'np-1', name: 'සමබිම පුවත්පත', slug: 'samabima-newspaper' },
    categories: [
      { id: 'c5', name: 'ජාතික ගැටලුව', slug: 'national-question' },
      { id: 'c6', name: 'සංහිඳියාව', slug: 'reconciliation-peace' },
    ],
  },
  {
    id: 'art-demo-4',
    slug: 'freedom-of-information-governance',
    title: 'තොරතුරු දැනගැනීමේ අයිතිය සහ යහපාලනය',
    excerpt: 'තොරතුරු දැනගැනීමේ පනත මඟින් රාජ්‍ය ආයතනවල විනිවිදභාවය තහවුරු කර දූෂණය පිටුදැකීමට පුරවැසියා සවිබල ගන්වයි.',
    body: '<p>තොරතුරු දැනගැනීමේ පනත මඟින් රාජ්‍ය ආයතනවල විනිවිදභාවය තහවුරු කරයි.</p>',
    publishedAt: '2019-08-15T09:15:00Z',
    originalPublishedAt: '2019-08-15T09:15:00Z',
    viewCount: 520,
    author: { id: 'auth-4', name: 'ලාල් විජේනායක', slug: 'ලාල්-විජේනායක' },
    newspaper: { id: 'np-1', name: 'සමබිම පුවත්පත', slug: 'samabima-newspaper' },
    categories: [
      { id: 'c7', name: 'තොරතුරු නිදහස', slug: 'right-to-information' },
      { id: 'c8', name: 'නීතිය', slug: 'law-justice' },
    ],
  },
  {
    id: 'art-demo-5',
    slug: 'rule-of-law-human-rights',
    title: 'නීතියේ ආධිපත්‍යය හා මානව හිමිකම් සුරැකීම',
    excerpt: 'අධිකරණයේ ස්වාධීනත්වය සහ අපක්ෂපාතී නීතිය ක්‍රියාත්මක වීම ශිෂ්ට සම්පන්න සමාජයක පැවැත්ම තීරණය කරයි.',
    body: '<p>අධිකරණයේ ස්වාධීනත්වය සහ අපක්ෂපාතී නීතිය ක්‍රියාත්මක වීම ශිෂ්ට සම්පන්න සමාජයක පැවැත්ම තීරණය කරයි.</p>',
    publishedAt: '2018-05-10T12:00:00Z',
    originalPublishedAt: '2018-05-10T12:00:00Z',
    viewCount: 710,
    author: { id: 'auth-5', name: 'දීප්ති කුමාර ගුණරත්න', slug: 'දීප්ති-කුමාර-ගුණරත්න' },
    newspaper: { id: 'np-2', name: 'රයිට්ස් නව් වෙබ්', slug: 'rights-now-web' },
    categories: [
      { id: 'c9', name: 'නීතියේ ආධිපත්‍ය', slug: 'rule-of-law' },
      { id: 'c1', name: 'දේශපාලන', slug: 'politics' },
    ],
  },
  {
    id: 'art-demo-6',
    slug: 'economic-crisis-social-justice',
    title: 'ආර්ථික අර්බුදය හමුවේ සමාජ සාධාරණත්වය',
    excerpt: 'ආර්ථික ප්‍රතිසංස්කරණවලදී පීඩිත ජනතාවගේ මූලික සුබසාධන අයිතිවාසිකම් සහ රැකියා සුරක්ෂිතභාවය තහවුරු කළ යුතුය.',
    body: '<p>ආර්ථික ප්‍රතිසංස්කරණවලදී පීඩිත ජනතාවගේ මූලික සුබසාධන අයිතිවාසිකම් තහවුරු කළ යුතුය.</p>',
    publishedAt: '2017-03-22T08:45:00Z',
    originalPublishedAt: '2017-03-22T08:45:00Z',
    viewCount: 430,
    author: { id: 'auth-6', name: 'ආචාර්ය නිමල්කා ප්‍රනාන්දු', slug: 'ආචාර්ය-නිමල්කා-ප්-රනාන්දු' },
    newspaper: { id: 'np-1', name: 'සමබිම පුවත්පත', slug: 'samabima-newspaper' },
    categories: [
      { id: 'c10', name: 'ආර්ථිකය', slug: 'economy' },
      { id: 'c11', name: 'කාන්තා අයිතිවාසිකම්', slug: 'womens-rights' },
    ],
  },
];

export interface ArticleFilters {
  q?: string;
  year?: number;
  from?: string;
  to?: string;
  publisherId?: string;
  newspaperId?: string;
  authorId?: string;
  categoryId?: string;
  sort?: 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
}

export const ArticlesService = {
  getArticles: async (filters: ArticleFilters = {}): Promise<PaginatedResponse<Article>> => {
    try {
      const res = await api.get('/articles', { params: filters });
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {}

    // Fallback in case backend API is not yet reachable in cloud environment
    let filtered = [...FALLBACK_ARTICLES];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || (a.excerpt && a.excerpt.toLowerCase().includes(q)));
    }
    if (filters.authorId) {
      const byAuthor = filtered.filter(a => a.author?.id === filters.authorId);
      if (byAuthor.length > 0) filtered = byAuthor;
    }
    if (filters.categoryId) {
      const byCat = filtered.filter(a => a.categories?.some(c => c.id === filters.categoryId));
      if (byCat.length > 0) filtered = byCat;
    }
    if (filters.newspaperId) {
      const byNp = filtered.filter(a => a.newspaper?.id === filters.newspaperId);
      if (byNp.length > 0) filtered = byNp;
    }
    return {
      data: filtered,
      meta: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: filtered.length,
        totalPages: 1,
      },
    };
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    try {
      const res = await api.get(`/articles/${slug}`);
      if (res.data && typeof res.data === 'object' && res.data.title) {
        return res.data;
      }
    } catch {}
    const found = FALLBACK_ARTICLES.find(a => a.slug === slug) || FALLBACK_ARTICLES[0];
    return found;
  },

  getAvailableFilters: async (): Promise<FilterOptions> => {
    try {
      const res = await api.get('/filters');
      if (res.data && typeof res.data === 'object') {
        return {
          years: Array.isArray(res.data.years) ? res.data.years : [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
          publishers: Array.isArray(res.data.publishers) ? res.data.publishers : [],
          newspapers: Array.isArray(res.data.newspapers) ? res.data.newspapers : [],
          authors: Array.isArray(res.data.authors) ? res.data.authors : [],
          categories: Array.isArray(res.data.categories) ? res.data.categories : [],
        };
      }
    } catch {}
    return {
      years: [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
      publishers: [],
      newspapers: [],
      authors: [],
      categories: [],
    };
  },
};
