import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateSitemapXml(): Promise<string> {
    const clientUrl = (this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173').replace(/\/$/, '');

    const [articles, newspapers, categories, authors] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.newspaper.findMany({
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.author.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticRoutes = [
      { path: '', changefreq: 'daily', priority: '1.0' },
      { path: '/archive', changefreq: 'daily', priority: '0.9' },
      { path: '/newspapers', changefreq: 'weekly', priority: '0.8' },
      { path: '/authors', changefreq: 'weekly', priority: '0.7' },
      { path: '/categories', changefreq: 'weekly', priority: '0.7' },
      { path: '/about', changefreq: 'monthly', priority: '0.5' },
      { path: '/contact', changefreq: 'monthly', priority: '0.5' },
    ];

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const r of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}${r.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Published articles
    for (const art of articles) {
      const lastmod = (art.updatedAt || art.publishedAt || new Date()).toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/articles/${encodeURIComponent(art.slug)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Newspapers
    for (const np of newspapers) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/newspapers/${encodeURIComponent(np.slug)}</loc>\n`;
      xml += `    <lastmod>${np.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    // Authors
    for (const a of authors) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/authors?slug=${encodeURIComponent(a.slug)}</loc>\n`;
      xml += `    <lastmod>${a.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    // Categories
    for (const c of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/archive?category=${encodeURIComponent(c.slug)}</loc>\n`;
      xml += `    <lastmod>${c.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  generateRobotsTxt(): string {
    const clientUrl = (this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173').replace(/\/$/, '');
    return `# Robots.txt for Samabima / Rights Now News Publishing Platform
User-agent: *
Allow: /
Allow: /articles/
Allow: /archive
Allow: /newspapers/
Allow: /authors
Allow: /categories
Allow: /about
Allow: /contact

# Protect administrative and operational dashboards
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /api/

Sitemap: ${clientUrl}/sitemap.xml
`;
  }
}

