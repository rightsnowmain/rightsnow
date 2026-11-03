import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({ description: 'Article title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Article slug (auto-generated if omitted)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Short summary or excerpt' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'Article body content in HTML or Markdown' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.DRAFT })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiProperty({ description: 'Author UUID' })
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiPropertyOptional({ description: 'Newspaper UUID' })
  @IsOptional()
  @IsString()
  newspaperId?: string;

  @ApiPropertyOptional({ description: 'Publisher UUID' })
  @IsOptional()
  @IsString()
  publisherId?: string;

  @ApiPropertyOptional({ description: 'Featured image URL or path' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'Publication timestamp' })
  @IsOptional()
  publishedAt?: Date | string;

  @ApiPropertyOptional({ description: 'Original publication timestamp' })
  @IsOptional()
  originalPublishedAt?: Date | string;

  @ApiPropertyOptional({ description: 'Category UUIDs', type: [String] })
  @IsOptional()
  @IsArray()
  categoryIds?: string[];
}
