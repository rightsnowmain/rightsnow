const test = require('node:test');
const assert = require('node:assert');

// 1. Test SeoService
test('SeoService generates valid XML sitemap and robots.txt', async (t) => {
  const { SeoService } = require('../dist/modules/seo/seo.service');

  const mockPrisma = {
    article: {
      findMany: async () => [
        { slug: 'human-rights-2021', updatedAt: new Date('2021-05-10T12:00:00Z'), publishedAt: new Date('2021-05-10T12:00:00Z') }
      ]
    },
    newspaper: {
      findMany: async () => [
        { slug: 'samabima-official', updatedAt: new Date('2021-01-01T00:00:00Z') }
      ]
    },
    category: {
      findMany: async () => [
        { slug: 'politics', updatedAt: new Date('2021-01-01T00:00:00Z') }
      ]
    },
    author: {
      findMany: async () => [
        { slug: 'dr-nihal', updatedAt: new Date('2021-01-01T00:00:00Z') }
      ]
    }
  };

  const mockConfig = {
    get: (key) => key === 'CLIENT_URL' ? 'https://samabima.org' : null
  };

  const seoService = new SeoService(mockPrisma, mockConfig);

  await t.test('sitemap xml output format', async () => {
    const xml = await seoService.generateSitemapXml();
    assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Has XML header');
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Has urlset');
    assert.ok(xml.includes('https://samabima.org/articles/human-rights-2021'), 'Contains article URL');
    assert.ok(xml.includes('https://samabima.org/newspapers/samabima-official'), 'Contains newspaper URL');
    assert.ok(xml.includes('https://samabima.org/archive'), 'Contains archive URL');
  });

  await t.test('robots.txt disallows protected routes and links sitemap', () => {
    const robots = seoService.generateRobotsTxt();
    assert.ok(robots.includes('User-agent: *'), 'Specifies user-agent');
    assert.ok(robots.includes('Disallow: /dashboard/'), 'Protects dashboard');
    assert.ok(robots.includes('Disallow: /admin/'), 'Protects admin');
    assert.ok(robots.includes('Sitemap: https://samabima.org/sitemap.xml'), 'Links sitemap');
  });
});

// 2. Test AnalyticsService
test('AnalyticsService overview calculation and metrics', async (t) => {
  const { AnalyticsService } = require('../dist/modules/analytics/analytics.service');

  const mockPrisma = {
    article: {
      count: async () => 3133,
      groupBy: async () => [
        { status: 'PUBLISHED', _count: { id: 3100 } },
        { status: 'DRAFT', _count: { id: 33 } }
      ],
      aggregate: async () => ({
        _sum: { viewCount: 125000 },
        _avg: { viewCount: 40.3 }
      }),
      findMany: async () => [
        {
          id: 'art-1',
          slug: 'featured-historical',
          title: 'මාධ්‍ය නිදහස සහ සමාජය',
          viewCount: 3400,
          author: { id: 'a1', name: 'කර්තෘ' },
          newspaper: { id: 'n1', name: 'සමබිම' }
        }
      ]
    },
    $queryRaw: async () => [
      { year: 2021, count: BigInt(37) },
      { year: 2020, count: BigInt(231) },
      { year: 2014, count: BigInt(383) }
    ],
    publisher: {
      findMany: async () => [
        { id: 'p1', name: 'සමබිම ප්‍රකාශන භාරය', slug: 'samabima-trust', _count: { articles: 3133 } }
      ]
    },
    author: {
      findMany: async () => [
        { id: 'a1', name: 'admin', slug: 'admin', avatarUrl: null, _count: { articles: 2402 } }
      ]
    },
    category: {
      findMany: async () => [
        { id: 'c1', name: 'දේශපාලන', slug: 'politics', _count: { articles: 492 } }
      ]
    },
    comment: {
      groupBy: async () => [
        { status: 'APPROVED', _count: { id: 85 } },
        { status: 'PENDING', _count: { id: 4 } }
      ]
    }
  };

  const analyticsService = new AnalyticsService(mockPrisma);

  await t.test('kpi metrics calculation', async () => {
    const data = await analyticsService.getOverview();
    assert.strictEqual(data.kpi.totalArticles, 3133);
    assert.strictEqual(data.kpi.publishedArticles, 3100);
    assert.strictEqual(data.kpi.draftArticles, 33);
    assert.strictEqual(data.kpi.totalViews, 125000);
    assert.strictEqual(data.kpi.pendingComments, 4);
    assert.strictEqual(data.yearDistribution.length, 3);
    assert.strictEqual(data.yearDistribution[0].year, 2021);
    assert.strictEqual(data.topArticles[0].title, 'මාධ්‍ය නිදහස සහ සමාජය');
    assert.strictEqual(data.topAuthors[0].name, 'admin');
  });
});

// 3. Test CommentsService
test('CommentsService moderation, spam detection, flood control & hierarchy', async (t) => {
  const { CommentsService } = require('../dist/modules/comments/comments.service');

  const mockPrisma = {
    article: {
      findUnique: async () => ({ id: 'art-1', status: 'PUBLISHED', deletedAt: null }),
    },
    comment: {
      findFirst: async ({ where }) => {
        if (where?.userId === 'flooder') return { id: 'c-prev' };
        if (where?.body === 'Duplicate message') return { id: 'c-dup' };
        return null;
      },
      findUnique: async ({ where }) => {
        if (where.id === 'c-parent') return { id: 'c-parent', articleId: 'art-1', parentId: null };
        if (where.id === 'c-owned') return { id: 'c-owned', userId: 'user-1', createdAt: new Date(), replies: [] };
        if (where.id === 'c-not-owned') return { id: 'c-not-owned', userId: 'other-user', createdAt: new Date(), replies: [] };
        return null;
      },
      create: async ({ data }) => ({
        id: 'c-new',
        ...data,
        user: { id: data.userId, displayName: 'Test User', email: 'test@example.com', role: 'READER' },
      }),
      findMany: async () => [
        { id: 'c1', parentId: null, body: 'Main comment 1', createdAt: new Date() },
        { id: 'c2', parentId: 'c1', body: 'Reply to comment 1', createdAt: new Date() },
        { id: 'c3', parentId: null, body: 'Main comment 2', createdAt: new Date() },
      ],
      delete: async () => ({ id: 'c-deleted' }),
    },
    auditEvent: {
      create: async () => ({ id: 'audit-1' }),
    },
  };

  const commentsService = new CommentsService(mockPrisma);

  await t.test('Reader comment defaults to PENDING moderation', async () => {
    const res = await commentsService.create('art-1', 'user-1', 'READER', { body: 'This is a thoughtful reader comment.' });
    assert.strictEqual(res.comment.status, 'PENDING');
    assert.ok(res.message.includes('pending editorial approval'));
  });

  await t.test('Editor/Admin comment is automatically APPROVED', async () => {
    const res = await commentsService.create('art-1', 'user-editor', 'EDITOR', { body: 'Official editorial note.' });
    assert.strictEqual(res.comment.status, 'APPROVED');
    assert.ok(res.message.includes('published successfully'));
  });

  await t.test('Spam keyword or multi-link is automatically flagged as SPAM', async () => {
    const res = await commentsService.create('art-1', 'user-spammer', 'READER', {
      body: 'Visit our casino for free bonus! http://spam1.com http://spam2.com http://spam3.com',
    });
    assert.strictEqual(res.comment.status, 'SPAM');
  });

  await t.test('Flood protection blocks rapid comments within 15s', async () => {
    await assert.rejects(
      async () => commentsService.create('art-1', 'flooder', 'READER', { body: 'Rapid spamming' }),
      /Please wait 15 seconds/
    );
  });

  await t.test('findForArticle structures roots with nested replies', async () => {
    const tree = await commentsService.findForArticle('art-1');
    assert.strictEqual(tree.length, 2);
    assert.strictEqual(tree[0].id, 'c1');
    assert.strictEqual(tree[0].replies.length, 1);
    assert.strictEqual(tree[0].replies[0].id, 'c2');
    assert.strictEqual(tree[1].id, 'c3');
    assert.strictEqual(tree[1].replies.length, 0);
  });

  await t.test('removeOwnComment permits owner and rejects unauthorized user', async () => {
    const ownRes = await commentsService.removeOwnComment('c-owned', 'user-1', 'READER');
    assert.ok(ownRes.message.includes('deleted successfully'));

    await assert.rejects(
      async () => commentsService.removeOwnComment('c-not-owned', 'user-1', 'READER'),
      /You do not have permission/
    );
  });
});

// 4. Test HtmlSanitizer (Sprint 5 Security Hardening)
test('HtmlSanitizer cleans XSS vectors and script injections', async (t) => {
  const { sanitizeHtml } = require('../dist/common/utils/html-sanitizer');

  await t.test('strips <script> tags and inner code', () => {
    const dirty = '<p>Normal text</p><script>alert("hacked")</script>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean, '<p>Normal text</p>');
    assert.ok(!clean.includes('alert'));
  });

  await t.test('strips inline event handlers', () => {
    const dirty = '<img src="photo.jpg" onerror="alert(1)" onload="evil()" />';
    const clean = sanitizeHtml(dirty);
    assert.ok(!clean.includes('onerror'));
    assert.ok(!clean.includes('onload'));
  });

  await t.test('strips javascript: protocol in links', () => {
    const dirty = '<a href="javascript:alert(\'xss\')">Click here</a>';
    const clean = sanitizeHtml(dirty);
    assert.ok(!clean.includes('javascript:'));
    assert.ok(clean.includes('href="#"'));
  });
});

// 5. Test HealthController (Sprint 5 Diagnostics & Monitoring)
test('HealthController diagnostics and system metrics', async (t) => {
  const { HealthController } = require('../dist/modules/health/health.controller');

  const mockPrisma = {
    $queryRaw: async () => [{ '?column?': 1 }],
  };

  const healthController = new HealthController(mockPrisma);

  await t.test('health report includes database status, memory and uptime', async () => {
    const report = await healthController.check();
    assert.strictEqual(report.status, 'ok');
    assert.strictEqual(report.database, 'connected');
    assert.strictEqual(report.version, '1.0.0');
    assert.ok(typeof report.uptime === 'number');
    assert.ok(typeof report.memory.heapUsedMb === 'number');
  });
});

// 6. Test RateLimitMiddleware (Sprint 5 Brute-Force & Flood Protection)
test('RateLimitMiddleware request tracking and limits', async (t) => {
  const { RateLimitMiddleware } = require('../dist/common/middleware/rate-limit.middleware');
  const limiter = new RateLimitMiddleware();

  await t.test('allows requests within limit and sets headers', () => {
    const req = { headers: {}, socket: { remoteAddress: '192.168.1.100' }, path: '/api/v1/articles', method: 'GET' };
    const headers = {};
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      status: () => res,
      json: () => {},
    };
    let calledNext = false;
    limiter.use(req, res, () => { calledNext = true; });

    assert.ok(calledNext);
    assert.strictEqual(headers['X-RateLimit-Limit'], 150);
  });
});

