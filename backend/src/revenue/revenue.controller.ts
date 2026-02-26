import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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

  @Get('additional')
  getAdditionalIncome(
    @CurrentUser() user: UserPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.revenueService.getAdditionalIncome(
      user.id,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Post('additional')
  createAdditionalIncome(
    @CurrentUser() user: UserPayload,
    @Body()
    body: { year: number; month: number; amount: number; description?: string },
  ) {
    return this.revenueService.createAdditionalIncome(
      user.id,
      body.year,
      body.month,
      body.amount,
      body.description,
    );
  }

  @Delete('additional/:id')
  deleteAdditionalIncome(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.revenueService.deleteAdditionalIncome(user.id, id);
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
