import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewspapersService } from './newspapers.service';

@ApiTags('Newspapers')
@Controller('newspapers')
export class NewspapersController {
  constructor(private readonly newspapersService: NewspapersService) {}

  @Get()
  @ApiOperation({ summary: 'List all newspapers and digital publications' })
  findAll() {
    return this.newspapersService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get newspaper details and recent issues/articles' })
  findBySlug(@Param('slug') slug: string) {
    return this.newspapersService.findBySlug(slug);
  }
}
