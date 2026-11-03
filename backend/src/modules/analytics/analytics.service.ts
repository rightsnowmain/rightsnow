import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus, CommentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalArticles,
      statusCounts,
      totalViewsResult,
      articlesByYearRaw,
      topArticles,
      topPublishers,
      topAuthors,
      topCategories,
      commentCounts,
    ] = await Promise.all([
      // Total articles
      this.prisma.article.count({ where: { deletedAt: null } }),

      // Counts by status
      this.prisma.article.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),

      // Total view count
      this.prisma.article.aggregate({
        where: { deletedAt: null },
        _sum: { viewCount: true },
        _avg: { viewCount: true },
      }),

      // Articles distribution by publication year
      this.prisma.$queryRaw<{ year: number; count: bigint }[]>`
        SELECT 
          EXTRACT(YEAR FROM COALESCE("originalPublishedAt", "publishedAt"))::integer AS year,
          COUNT(*)::bigint AS count
        FROM articles
        WHERE "status" = 'PUBLISHED'::"ArticleStatus" 
          AND "deletedAt" IS NULL 
          AND (("originalPublishedAt" IS NOT NULL) OR ("publishedAt" IS NOT NULL))
        GROUP BY year
        ORDER BY year DESC
      `,

      // Top 10 most viewed articles
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          viewCount: true,
          publishedAt: true,
          originalPublishedAt: true,
          author: { select: { id: true, name: true } },
          newspaper: { select: { id: true, name: true } },
        },
      }),

      // Publishers with article counts
      this.prisma.publisher.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { articles: true } },
        },
        orderBy: { articles: { _count: 'desc' } },
        take: 5,
      }),

      // Top authors with article counts
      this.prisma.author.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          _count: { select: { articles: true } },
        },
        orderBy: { articles: { _count: 'desc' } },
        take: 5,
      }),

      // Top categories with article counts
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { articles: true } },
        },
        orderBy: { articles: { _count: 'desc' } },
        take: 8,
      }),

      // Comment counts by status
      this.prisma.comment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Format status breakdown
    const statusMap: Record<string, number> = {};
    for (const sc of statusCounts) {
      statusMap[sc.status] = sc._count.id;
    }

    // Format comments breakdown
    const commentsMap: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      SPAM: 0,
    };
    let totalComments = 0;
    for (const cc of commentCounts) {
      commentsMap[cc.status] = cc._count.id;
      totalComments += cc._count.id;
    }

    // Format year distribution
    const yearDistribution = articlesByYearRaw.map((r) => ({
      year: r.year,
      count: Number(r.count),
    }));

    return {
      kpi: {
        totalArticles,
        publishedArticles: statusMap[ArticleStatus.PUBLISHED] || 0,
        draftArticles: statusMap[ArticleStatus.DRAFT] || 0,
        inReviewArticles: statusMap[ArticleStatus.IN_REVIEW] || 0,
        approvedArticles: statusMap[ArticleStatus.APPROVED] || 0,
        scheduledArticles: statusMap[ArticleStatus.SCHEDULED] || 0,
        archivedArticles: statusMap[ArticleStatus.ARCHIVED] || 0,
        totalViews: totalViewsResult._sum.viewCount || 0,
        avgViewsPerArticle: Math.round(totalViewsResult._avg.viewCount || 0),
        totalComments,
        pendingComments: commentsMap[CommentStatus.PENDING] || 0,
      },
      statusDistribution: statusMap,
      yearDistribution,
      topArticles,
      topPublishers: topPublishers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        articleCount: p._count.articles,
      })),
      topAuthors: topAuthors.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        avatarUrl: a.avatarUrl,
        articleCount: a._count.articles,
      })),
      topCategories: topCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        articleCount: c._count.articles,
      })),
      commentsSummary: {
        total: totalComments,
        ...commentsMap,
      },
    };
  }

  async getReport(from?: string, to?: string) {
    const where: any = { deletedAt: null };

    if (from || to) {
      where.publishedAt = {};
      if (from) where.publishedAt.gte = new Date(from);
      if (to) where.publishedAt.lte = new Date(to);
    }

    const articles = await this.prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        viewCount: true,
        publishedAt: true,
        originalPublishedAt: true,
        author: { select: { name: true } },
        newspaper: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });

    return {
      count: articles.length,
      from,
      to,
      articles,
    };
  }
}

