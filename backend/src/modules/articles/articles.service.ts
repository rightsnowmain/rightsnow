import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterArticleDto } from './dto/filter-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus, Prisma, Role } from '@prisma/client';
import { sanitizeHtml } from '../../common/utils/html-sanitizer';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(filter: FilterArticleDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 12;
    const skip = (page - 1) * limit;

    const conditions: Prisma.ArticleWhereInput[] = [
      { status: ArticleStatus.PUBLISHED },
      { deletedAt: null },
    ];

    if (filter.q) {
      conditions.push({
        OR: [
          { title: { contains: filter.q, mode: 'insensitive' } },
          { excerpt: { contains: filter.q, mode: 'insensitive' } },
          { body: { contains: filter.q, mode: 'insensitive' } },
        ],
      });
    }

    if (filter.year) {
      const yearStart = new Date(`${filter.year}-01-01T00:00:00.000Z`);
      const yearEnd = new Date(`${filter.year + 1}-01-01T00:00:00.000Z`);
      conditions.push({
        OR: [
          { originalPublishedAt: { gte: yearStart, lt: yearEnd } },
          { AND: [{ originalPublishedAt: null }, { publishedAt: { gte: yearStart, lt: yearEnd } }] },
        ],
      });
    }

    if (filter.from || filter.to) {
      const dateRange: Prisma.DateTimeNullableFilter = {};
      if (filter.from) dateRange.gte = new Date(filter.from);
      if (filter.to) dateRange.lte = new Date(filter.to);
      conditions.push({
        OR: [
          { originalPublishedAt: dateRange },
          { AND: [{ originalPublishedAt: null }, { publishedAt: dateRange }] },
        ],
      });
    }

    if (filter.publisherId) conditions.push({ publisherId: filter.publisherId });
    if (filter.newspaperId) conditions.push({ newspaperId: filter.newspaperId });
    if (filter.authorId) conditions.push({ authorId: filter.authorId });

    if (filter.categoryId) {
      conditions.push({
        categories: { some: { categoryId: filter.categoryId } },
      });
    }

    const where: Prisma.ArticleWhereInput = { AND: conditions };

    let orderBy: Prisma.ArticleOrderByWithRelationInput = { publishedAt: 'desc' };
    if (filter.sort === 'oldest') {
      orderBy = { publishedAt: 'asc' };
    } else if (filter.sort === 'popular') {
      orderBy = { viewCount: 'desc' };
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: { select: { id: true, name: true, slug: true, avatarUrl: true } },
          newspaper: { select: { id: true, name: true, slug: true, logoUrl: true } },
          publisher: { select: { id: true, name: true, slug: true } },
          categories: { include: { category: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map((art) => ({
        ...art,
        categories: art.categories.map((c) => c.category),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findBySlug(slug: string) {
    let decodedSlug = slug;
    let encodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {
      decodedSlug = slug;
    }
    try {
      encodedSlug = encodeURIComponent(decodedSlug);
    } catch {
      encodedSlug = slug;
    }

    const article = await this.prisma.article.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: encodedSlug },
          { slug: encodedSlug.toLowerCase() },
          { slug: { equals: slug, mode: 'insensitive' } },
          { id: slug },
        ],
        status: ArticleStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        author: true,
        newspaper: true,
        publisher: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        comments: {
          where: { status: 'APPROVED' },
          include: { user: { select: { id: true, displayName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }

    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    const related = await this.prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        deletedAt: null,
        OR: [
          { authorId: article.authorId },
          { newspaperId: article.newspaperId },
        ],
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        featuredImage: true,
        publishedAt: true,
        originalPublishedAt: true,
      },
    });

    return {
      ...article,
      viewCount: article.viewCount + 1,
      categories: article.categories.map((c) => c.category),
      tags: article.tags.map((t) => t.tag),
      relatedArticles: related,
    };
  }

  async getFilters() {
    const [publishers, newspapers, authors, categories] = await Promise.all([
      this.prisma.publisher.findMany({
        select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
      }),
      this.prisma.newspaper.findMany({
        select: { id: true, name: true, slug: true, publisherId: true, _count: { select: { articles: true } } },
      }),
      this.prisma.author.findMany({
        select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.findMany({
        select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    const rawYears: { year: number }[] = await this.prisma.$queryRaw`
      SELECT DISTINCT EXTRACT(YEAR FROM COALESCE("originalPublishedAt", "publishedAt"))::integer as year
      FROM articles
      WHERE "status" = 'PUBLISHED'::"ArticleStatus" AND "deletedAt" IS NULL AND (("originalPublishedAt" IS NOT NULL) OR ("publishedAt" IS NOT NULL))
      ORDER BY year DESC
    `;

    return {
      years: rawYears.map((r) => r.year).filter(Boolean),
      publishers,
      newspapers,
      authors,
      categories,
    };
  }

  // Admin / Editorial CMS Methods
  async findAdminArticles(status?: ArticleStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
    };

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: true,
          newspaper: true,
          publisher: true,
          categories: { include: { category: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map((art) => ({
        ...art,
        categories: art.categories.map((c) => c.category),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async incrementViewCount(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!article) {
      throw new NotFoundException(`Article with id '${id}' not found`);
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });
    return { success: true, viewCount: updated.viewCount };
  }

  async create(dto: CreateArticleDto, userId?: string) {
    const slug = dto.slug || this.slugify(dto.title) + '-' + Date.now();
    const { categoryIds, ...rest } = dto;
    if (rest.body) {
      rest.body = sanitizeHtml(rest.body);
    }
    if (rest.excerpt) {
      rest.excerpt = sanitizeHtml(rest.excerpt);
    }
    const body = dto.body ? sanitizeHtml(dto.body) : '';
    const excerpt = dto.excerpt ? sanitizeHtml(dto.excerpt) : dto.excerpt;

    const now = new Date();
    const isPublished = rest.status === ArticleStatus.PUBLISHED;
    const publishedAt = rest.publishedAt
      ? new Date(rest.publishedAt)
      : isPublished
      ? now
      : undefined;
    const originalPublishedAt = rest.originalPublishedAt
      ? new Date(rest.originalPublishedAt)
      : (publishedAt || now);

    const article = await this.prisma.article.create({
      data: {
        ...rest,
        body,
        excerpt,
        slug,
        publishedAt,
        originalPublishedAt,
        categories: categoryIds?.length
          ? {
              create: categoryIds.map((cId) => ({
                category: { connect: { id: cId } },
              })),
            }
          : undefined,
      },
      include: { author: true, categories: { include: { category: true } } },
    });

    // Record initial revision
    if (userId) {
      await this.prisma.revision.create({
        data: {
          articleId: article.id,
          editorId: userId,
          snapshot: {
            title: article.title,
            excerpt: article.excerpt,
            body: article.body,
            status: article.status,
          },
        },
      });
    }

    return article;
  }

  async update(id: string, dto: UpdateArticleDto, userId?: string) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Article with id '${id}' not found`);

    const { categoryIds, ...rest } = dto;
    if (rest.body) {
      rest.body = sanitizeHtml(rest.body);
    }
    if (rest.excerpt) {
      rest.excerpt = sanitizeHtml(rest.excerpt);
    }

    const isPublishing = rest.status === ArticleStatus.PUBLISHED;
    let publishedAt = rest.publishedAt ? new Date(rest.publishedAt) : undefined;
    if (isPublishing && !existing.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }
    const originalPublishedAt = rest.originalPublishedAt
      ? new Date(rest.originalPublishedAt)
      : (existing.originalPublishedAt || publishedAt || undefined);

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        ...rest,
        publishedAt,
        originalPublishedAt,
        categories: categoryIds
          ? {
              deleteMany: {},
              create: categoryIds.map((cId) => ({
                category: { connect: { id: cId } },
              })),
            }
          : undefined,
      },
      include: { author: true, categories: { include: { category: true } } },
    });

    // Create revision snapshot on every meaningful update
    if (userId) {
      await this.prisma.revision.create({
        data: {
          articleId: updated.id,
          editorId: userId,
          snapshot: {
            title: updated.title,
            excerpt: updated.excerpt,
            body: updated.body,
            status: updated.status,
          },
        },
      });
    }

    return updated;
  }

  async submitForReview(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.IN_REVIEW },
    });
  }

  async approve(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.APPROVED },
    });
  }

  async publish(id: string, scheduledAt?: Date) {
    const now = new Date();
    const isFuture = scheduledAt && scheduledAt > now;
    const pubDate = isFuture ? scheduledAt : now;
    const existing = await this.prisma.article.findUnique({
      where: { id },
      select: { originalPublishedAt: true },
    });
    return this.prisma.article.update({
      where: { id },
      data: {
        status: isFuture ? ArticleStatus.SCHEDULED : ArticleStatus.PUBLISHED,
        publishedAt: pubDate,
        originalPublishedAt: existing?.originalPublishedAt || pubDate,
        scheduledAt: isFuture ? scheduledAt : null,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRevisions(articleId: string) {
    return this.prisma.revision.findMany({
      where: { articleId },
      include: { editor: { select: { id: true, displayName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'article';
  }
}
