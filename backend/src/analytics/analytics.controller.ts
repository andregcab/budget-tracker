import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { GetMonthlyQueryDto } from './dto/get-monthly-query.dto';

import type { UserPayload } from '../auth/types/user-payload';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('monthly')
  async monthly(
    @CurrentUser() user: UserPayload,
    @Query() query: GetMonthlyQueryDto,
  ) {
    const now = new Date();
    const y = query.year ?? now.getFullYear();
    const m = query.month ?? now.getMonth() + 1;
    return this.analyticsService.getMonthlySummary(user.id, y, m);
  }
}
