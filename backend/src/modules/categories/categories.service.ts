import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            article: {
              include: { author: true, newspaper: true },
            },
          },
          take: 20,
        },
      },
    });

    if (!category) throw new NotFoundException(`Category '${slug}' not found`);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      articles: category.articles.map((a) => a.article),
    };
  }
}
