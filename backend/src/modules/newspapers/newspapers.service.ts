import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewspapersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.newspaper.findMany({
      include: {
        publisher: true,
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const newspaper = await this.prisma.newspaper.findUnique({
      where: { slug },
      include: {
        publisher: true,
        articles: {
          where: { status: 'PUBLISHED' },
          take: 12,
          orderBy: { publishedAt: 'desc' },
          include: { author: true, categories: { include: { category: true } } },
        },
      },
    });

    if (!newspaper) throw new NotFoundException(`Newspaper '${slug}' not found`);
    return {
      ...newspaper,
      articles: newspaper.articles.map((art) => ({
        ...art,
        categories: art.categories.map((c) => c.category),
      })),
    };
  }
}
