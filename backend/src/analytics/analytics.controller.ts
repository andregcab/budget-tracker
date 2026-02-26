import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

type UserPayload = { id: string; email: string };

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('monthly')
  async monthly(
    @CurrentUser() user: UserPayload,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    return this.analyticsService.getMonthlySummary(user.id, y, m);
  }
}
