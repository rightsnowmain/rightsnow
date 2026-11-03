import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorsService } from './authors.service';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all authors with published article counts' })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get author profile and publications by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.authorsService.findBySlug(slug);
  }
}
