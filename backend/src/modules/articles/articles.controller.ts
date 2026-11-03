import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { FilterArticleDto } from './dto/filter-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Articles')
@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Public Endpoints
  @Get('articles')
  @ApiOperation({ summary: 'Public search, filter, and list published articles' })
  findPublic(@Query() filter: FilterArticleDto) {
    return this.articlesService.findPublic(filter);
  }

  @Get('articles/:slug')
  @ApiOperation({ summary: 'Public article detail by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post('articles/:id/view')
  @ApiOperation({ summary: 'Atomically increment article view metrics' })
  incrementView(@Param('id') id: string) {
    return this.articlesService.incrementViewCount(id);
  }

  @Get('filters')
  @Header('Cache-Control', 'public, max-age=1800')
  @ApiOperation({ summary: 'Get available filter facets (years, publishers, newspapers, authors, categories)' })
  getFilters() {
    return this.articlesService.getFilters();
  }

  // Admin / Editorial CMS Endpoints
  @Get('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List articles by workflow status (Draft, In Review, Approved, etc.)' })
  findAdmin(
    @Query('status') status?: ArticleStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.articlesService.findAdminArticles(status, Number(page), Number(limit));
  }

  @Post('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new article draft (Editorial)' })
  create(@Body() dto: CreateArticleDto, @CurrentUser('id') userId?: string) {
    return this.articlesService.create(dto, userId);
  }

  @Patch('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article and record revision' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.articlesService.update(id, dto, userId);
  }

  @Post('admin/articles/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit article draft for editorial review' })
  submitForReview(@Param('id') id: string) {
    return this.articlesService.submitForReview(id);
  }

  @Post('admin/articles/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve article (Editor or Admin only)' })
  approve(@Param('id') id: string) {
    return this.articlesService.approve(id);
  }

  @Post('admin/articles/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish or schedule article (Editor or Admin only)' })
  publish(@Param('id') id: string, @Body('scheduledAt') scheduledAt?: string) {
    return this.articlesService.publish(id, scheduledAt ? new Date(scheduledAt) : undefined);
  }

  @Delete('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete article' })
  remove(@Param('id') id: string) {
    return this.articlesService.softDelete(id);
  }

  @Get('admin/articles/:id/revisions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full revision history for an article' })
  getRevisions(@Param('id') id: string) {
    return this.articlesService.getRevisions(id);
  }
}
