import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.author.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          take: 12,
          orderBy: { publishedAt: 'desc' },
          include: { newspaper: true, categories: { include: { category: true } } },
        },
        _count: { select: { articles: true } },
      },
    });

    if (!author) throw new NotFoundException(`Author '${slug}' not found`);
    return {
      ...author,
      articles: author.articles.map((art) => ({
        ...art,
        categories: art.categories.map((c) => c.category),
      })),
    };
  }
}
