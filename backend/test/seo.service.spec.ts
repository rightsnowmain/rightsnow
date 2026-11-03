import { SeoService } from '../src/modules/seo/seo.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('SeoService', () => {
  let service: SeoService;
  let prismaMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      article: {
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'test-article-1',
            updatedAt: new Date('2021-05-10T10:00:00Z'),
            publishedAt: new Date('2021-05-10T10:00:00Z'),
          },
        ]),
      },
      newspaper: {
        findMany: jest.fn().mockResolvedValue([
          { slug: 'samabima-official', updatedAt: new Date('2021-01-01T00:00:00Z') },
        ]),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([
          { slug: 'human-rights', updatedAt: new Date('2021-01-01T00:00:00Z') },
        ]),
      },
      author: {
        findMany: jest.fn().mockResolvedValue([
          { slug: 'admin-author', updatedAt: new Date('2021-01-01T00:00:00Z') },
        ]),
      },
    };

    configMock = {
      get: jest.fn().mockReturnValue('https://samabima.org'),
    };

    service = new SeoService(prismaMock as PrismaService, configMock as ConfigService);
  });

  it('should generate valid sitemap xml with published articles and routes', async () => {
    const xml = await service.generateSitemapXml();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('https://samabima.org/articles/test-article-1');
    expect(xml).toContain('https://samabima.org/newspapers/samabima-official');
    expect(xml).toContain('https://samabima.org/archive');
  });

  it('should generate robots.txt protecting admin and dashboard paths', () => {
    const robots = service.generateRobotsTxt();

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Disallow: /dashboard/');
    expect(robots).toContain('Disallow: /admin/');
    expect(robots).toContain('Sitemap: https://samabima.org/sitemap.xml');
  });
});

