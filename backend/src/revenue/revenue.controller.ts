import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RevenueService } from './revenue.service';
import { UpsertRevenueDto } from './dto/upsert-revenue.dto';

type UserPayload = { id: string; email: string };

@Controller('revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  getForMonth(
    @CurrentUser() user: UserPayload,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    if (!year || !month) {
      return null;
    }
    return this.revenueService.getForMonth(
      user.id,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Put()
  upsert(@CurrentUser() user: UserPayload, @Body() dto: UpsertRevenueDto) {
    return this.revenueService.upsert(user.id, dto);
  }

  @Delete()
  remove(
    @CurrentUser() user: UserPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.revenueService.remove(
      user.id,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }
}
