import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryBudgetService } from './category-budget.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

type UserPayload = { id: string; email: string };

@Controller('category-budgets')
@UseGuards(JwtAuthGuard)
export class CategoryBudgetController {
  constructor(private readonly categoryBudgetService: CategoryBudgetService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.categoryBudgetService.findAll(user.id);
  }

  @Put()
  upsert(@CurrentUser() user: UserPayload, @Body() dto: UpsertBudgetDto) {
    return this.categoryBudgetService.upsert(user.id, dto.categoryId, dto.amount);
  }

  @Delete(':categoryId')
  remove(
    @CurrentUser() user: UserPayload,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoryBudgetService.remove(user.id, categoryId);
  }
}
