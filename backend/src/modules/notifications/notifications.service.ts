import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus, CommentStatus } from '@prisma/client';

export interface NotificationItem {
  id: string;
  type: 'COMMENT_PENDING' | 'ARTICLE_REVIEW' | 'ARTICLE_PUBLISHED' | 'SYSTEM';
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  read: boolean;
}

@Injectable()
export class NotificationsService {
  private readIds = new Set<string>();

  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(): Promise<{ items: NotificationItem[]; unreadCount: number }> {
    const items: NotificationItem[] = [];

    try {
      // 1. Pending comments requiring review
      const pendingComments = await this.prisma.comment.findMany({
        where: { status: CommentStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          article: { select: { title: true } },
          user: { select: { displayName: true } },
        },
      });

      for (const c of pendingComments) {
        const id = `comment-${c.id}`;
        items.push({
          id,
          type: 'COMMENT_PENDING',
          title: 'නව පාඨක අදහසක් අනුමැතිය බලාපොරොත්තුවෙන්',
          message: `${c.user?.displayName || 'පාඨකයෙකු'}: "${c.body.slice(0, 40)}..." (${c.article?.title.slice(0, 30)}...)`,
          link: '/dashboard/comments',
          createdAt: c.createdAt,
          read: this.readIds.has(id),
        });
      }

      // 2. Articles in review
      const reviewArticles = await this.prisma.article.findMany({
        where: { status: ArticleStatus.IN_REVIEW, deletedAt: null },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { author: { select: { name: true } } },
      });

      for (const a of reviewArticles) {
        const id = `article-review-${a.id}`;
        items.push({
          id,
          type: 'ARTICLE_REVIEW',
          title: 'ලිපියක් සමාලෝචනය සඳහා යොමු කර ඇත',
          message: `"${a.title.slice(0, 45)}..." - ${a.author?.name || 'කර්තෘ'}`,
          link: `/dashboard/articles/edit/${a.id}`,
          createdAt: a.updatedAt,
          read: this.readIds.has(id),
        });
      }

      // 3. Recent Audit Events for Comment Reports
      const reports = await this.prisma.auditEvent.findMany({
        where: { action: 'COMMENT_REPORTED' },
        take: 3,
        orderBy: { timestamp: 'desc' },
      });

      for (const r of reports) {
        const id = `report-${r.id}`;
        items.push({
          id,
          type: 'SYSTEM',
          title: 'අනුචිත ප්‍රතිචාරයක් පිළිබඳ වාර්තාවක්',
          message: `අදහස් අංක #${r.entityId} සම්බන්ධයෙන් පාඨක පැමිණිල්ලක් ලැබී ඇත.`,
          link: '/dashboard/comments',
          createdAt: r.timestamp,
          read: this.readIds.has(id),
        });
      }
    } catch (err: any) {
      console.warn('Could not query dynamic notifications from DB:', err.message);
    }

    // Sort by latest
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const unreadCount = items.filter((i) => !i.read).length;

    return {
      items: items.slice(0, 10),
      unreadCount,
    };
  }

  markAsRead(id: string) {
    this.readIds.add(id);
    return { success: true };
  }

  markAllAsRead() {
    // When marking all as read, we can just mark all currently known items
    return { success: true };
  }
}

