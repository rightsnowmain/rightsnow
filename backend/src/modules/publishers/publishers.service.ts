import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublishersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.publisher.findMany({
      include: {
        newspapers: true,
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const publisher = await this.prisma.publisher.findUnique({
      where: { slug },
      include: {
        newspapers: true,
        articles: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: { author: true },
        },
      },
    });

    if (!publisher) throw new NotFoundException(`Publisher '${slug}' not found`);
    return publisher;
  }
}
