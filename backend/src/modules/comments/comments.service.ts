import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
import { CommentStatus, Role, Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(articleId: string, userId: string, userRole: Role, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, deletedAt: true },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException('Article not found');
    }

    if (article.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot comment on an unpublished article');
    }

    // 1. Flood Rate Limiting (15s cooldown per user)
    const recent = await this.prisma.comment.findFirst({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 15 * 1000) },
      },
      select: { id: true },
    });

    if (recent) {
      throw new BadRequestException('කරුණාකර තත්පර 15ක් රැඳී සිට මීළඟ අදහස පළ කරන්න (Please wait 15 seconds before posting again)');
    }

    // 2. Duplicate Comment Detection (10m window)
    const trimmedBody = dto.body.trim();
    const duplicate = await this.prisma.comment.findFirst({
      where: {
        userId,
        articleId,
        body: trimmedBody,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new BadRequestException('මෙම අදහස ඔබ විසින් මෑතකදී පළ කර ඇත (Duplicate comment detected)');
    }

    // 3. Verify parent comment if replying
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, articleId: true, parentId: true },
      });

      if (!parent || parent.articleId !== articleId) {
        throw new BadRequestException('Invalid parent comment');
      }
    }

    // 4. Automated Spam & Keyword Filter
    const spamWordPattern = /\b(casino|viagra|cialis|crypto|free\s*bonus|forex|poker|whatsapp\s*group|telegram\s*group)\b/i;
    const urlMatches = trimmedBody.match(/https?:\/\/[^\s]+/g) || [];
    const isSpam = spamWordPattern.test(trimmedBody) || urlMatches.length > 2;

    let status: CommentStatus;
    if (isSpam) {
      status = CommentStatus.SPAM;
    } else if (userRole === Role.ADMIN || userRole === Role.EDITOR) {
      status = CommentStatus.APPROVED;
    } else {
      status = CommentStatus.PENDING;
    }

    const comment = await this.prisma.comment.create({
      data: {
        articleId,
        userId,
        parentId: dto.parentId || null,
        body: trimmedBody,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    let message = 'Comment submitted and pending editorial approval';
    if (status === CommentStatus.APPROVED) {
      message = 'Comment published successfully';
    } else if (status === CommentStatus.SPAM) {
      message = 'Comment flagged for spam review';
    }

    return {
      message,
      comment,
    };
  }

  async findForArticle(articleId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
        status: CommentStatus.APPROVED,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    // Build hierarchy: root comments with nested replies
    const roots = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const structured = roots.map((root) => ({
      ...root,
      replies: replies.filter((r) => r.parentId === root.id),
    }));

    return structured;
  }

  async findAllForAdmin(query: {
    status?: CommentStatus;
    page?: number;
    limit?: number;
    q?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { body: { contains: query.q, mode: 'insensitive' } },
        { user: { displayName: { contains: query.q, mode: 'insensitive' } } },
        { user: { email: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    const counts = await this.prisma.comment.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const statusCounts = {
      ALL: total,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      SPAM: 0,
    };

    counts.forEach((c) => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status] = c._count._all;
      }
    });

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        statusCounts,
      },
    };
  }

  async updateStatus(id: string, dto: UpdateCommentStatusDto, moderatorId: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        actorId: moderatorId,
        action: `COMMENT_STATUS_${dto.status}`,
        entity: 'Comment',
        entityId: id,
        metadata: {
          previousStatus: existing.status,
          newStatus: dto.status,
        },
      },
    });

    return updated;
  }

  async remove(id: string, moderatorId: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    await this.prisma.auditEvent.create({
      data: {
        actorId: moderatorId,
        action: 'COMMENT_DELETED',
        entity: 'Comment',
        entityId: id,
      },
    });

    return { message: 'Comment deleted successfully' };
  }

  async report(id: string, reason?: string, userId?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.auditEvent.create({
      data: {
        actorId: userId || null,
        action: 'COMMENT_REPORTED',
        entity: 'Comment',
        entityId: id,
        metadata: {
          reason: reason || 'Inappropriate content',
          articleId: comment.articleId,
        },
      },
    });

    return {
      success: true,
      message: 'Comment reported for editorial review',
    };
  }

  async removeOwnComment(id: string, userId: string, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        replies: {
          where: { status: CommentStatus.APPROVED },
          select: { id: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isStaff = userRole === Role.ADMIN || userRole === Role.EDITOR;
    const isOwner = comment.userId === userId;

    if (!isStaff && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    if (!isStaff) {
      // Configurable policy: readers can delete within 24 hours
      const ageHours = (Date.now() - new Date(comment.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageHours > 24) {
        throw new BadRequestException('පාඨකයන්ට අදහස් මකා දැමිය හැක්කේ පළ කර පැය 24ක් ඇතුළත පමණි (Comments can only be deleted within 24 hours)');
      }

      // Check if there are approved replies
      if (comment.replies && comment.replies.length > 0) {
        throw new BadRequestException('වෙනත් පාඨකයන්ගේ අනුමත පිළිතුරු සහිත අදහස් මකා දැමිය නොහැක (Cannot delete comment with existing approved replies)');
      }
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    await this.prisma.auditEvent.create({
      data: {
        actorId: userId,
        action: isOwner ? 'COMMENT_DELETED_BY_AUTHOR' : 'COMMENT_DELETED_BY_STAFF',
        entity: 'Comment',
        entityId: id,
      },
    });

    return { message: 'Comment deleted successfully' };
  }
}
