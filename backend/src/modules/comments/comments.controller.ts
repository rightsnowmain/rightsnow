import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommentStatus, Role, User } from '@prisma/client';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('articles/:articleId/comments')
  @ApiOperation({ summary: 'Get approved comments for an article' })
  findForArticle(@Param('articleId') articleId: string) {
    return this.commentsService.findForArticle(articleId);
  }

  @Post('articles/:articleId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment or reply to an article (requires login)' })
  create(
    @Param('articleId') articleId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(articleId, user.id, user.role, dto);
  }

  @Get('admin/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List comments for editorial moderation' })
  @ApiQuery({ name: 'status', enum: CommentStatus, required: false })
  @ApiQuery({ name: 'q', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findAllForAdmin(
    @Query('status') status?: CommentStatus,
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.findAllForAdmin({ status, q, page, limit });
  }

  @Patch('admin/comments/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve, reject, or mark a comment as spam' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommentStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.updateStatus(id, dto, user.id);
  }

  @Delete('admin/comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (editorial admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user.id);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own comment (or staff delete)' })
  removeOwn(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentsService.removeOwnComment(id, user.id, user.role);
  }

  @Post('comments/:id/report')
  @ApiOperation({ summary: 'Report an inappropriate comment' })
  report(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.commentsService.report(id, reason);
  }
}
