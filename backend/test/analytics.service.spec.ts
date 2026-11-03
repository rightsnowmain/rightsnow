import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ArticleStatus } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      article: {
        count: jest.fn().mockResolvedValue(3133),
        groupBy: jest.fn().mockResolvedValue([
          { status: ArticleStatus.PUBLISHED, _count: { id: 3100 } },
          { status: ArticleStatus.DRAFT, _count: { id: 33 } },
        ]),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { viewCount: 154000 },
          _avg: { viewCount: 49.6 },
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'art-1',
            slug: 'popular-article-1',
            title: 'ජනප්‍රිය ඓතිහාසික ලිපිය',
            viewCount: 4500,
            author: { id: 'auth-1', name: 'ආචාර්ය නිහාල්' },
            newspaper: { id: 'news-1', name: 'සමබිම' },
          },
        ]),
      },
      $queryRaw: jest.fn().mockResolvedValue([
        { year: 2021, count: BigInt(37) },
        { year: 2020, count: BigInt(231) },
      ]),
      publisher: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'pub-1', name: 'සමබිම ප්‍රකාශන භාරය', slug: 'samabima-trust', _count: { articles: 3133 } },
        ]),
      },
      author: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'auth-1', name: 'admin', slug: 'admin', avatarUrl: null, _count: { articles: 2402 } },
        ]),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'cat-1', name: 'දේශපාලන', slug: 'politics', _count: { articles: 492 } },
        ]),
      },
      comment: {
        groupBy: jest.fn().mockResolvedValue([
          { status: 'APPROVED', _count: { id: 120 } },
          { status: 'PENDING', _count: { id: 5 } },
        ]),
      },
    };

    service = new AnalyticsService(prismaMock as PrismaService);
  });

  it('should calculate complete overview KPI metrics and distributions', async () => {
    const overview = await service.getOverview();

    expect(overview.kpi.totalArticles).toBe(3133);
    expect(overview.kpi.publishedArticles).toBe(3100);
    expect(overview.kpi.draftArticles).toBe(33);
    expect(overview.kpi.totalViews).toBe(154000);
    expect(overview.kpi.pendingComments).toBe(5);

    expect(overview.yearDistribution).toEqual([
      { year: 2021, count: 37 },
      { year: 2020, count: 231 },
    ]);
    expect(overview.topArticles.length).toBe(1);
    expect(overview.topArticles[0].title).toBe('ජනප්‍රිය ඓතිහාසික ලිපිය');
    expect(overview.topPublishers[0].name).toBe('සමබිම ප්‍රකාශන භාරය');
  });
});

