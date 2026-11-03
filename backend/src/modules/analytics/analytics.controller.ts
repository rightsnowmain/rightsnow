import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('report')
  @Roles(Role.ADMIN, Role.EDITOR)
  async getReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getReport(from, to);
  }
}
