import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpectedFixedExpensesService } from './expected-fixed-expenses.service';
import { CreateExpectedFixedDto } from './dto/create-expected-fixed.dto';

type UserPayload = { id: string; email: string };

@Controller('expected-fixed-expenses')
@UseGuards(JwtAuthGuard)
export class ExpectedFixedExpensesController {
  constructor(
    private readonly expectedFixedExpensesService: ExpectedFixedExpensesService,
  ) {}

  @Get()
  getForMonth(
    @CurrentUser() user: UserPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (!year || !month) return [];
    return this.expectedFixedExpensesService.getForMonth(
      user.id,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateExpectedFixedDto,
  ) {
    return this.expectedFixedExpensesService.create(
      user.id,
      dto.year,
      dto.month,
      dto.categoryId,
      dto.amount,
    );
  }

  @Delete(':id')
  delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.expectedFixedExpensesService.delete(user.id, id);
  }
}
