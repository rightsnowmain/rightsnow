import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishersService } from './publishers.service';

@ApiTags('Publishers')
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  @ApiOperation({ summary: 'List all publishers with newspaper catalogs' })
  findAll() {
    return this.publishersService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get publisher details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.publishersService.findBySlug(slug);
  }
}
