import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

type UserPayload = { id: string; email: string };

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: UserPayload,
    @Query('accountId') accountId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAll(user.id, {
      accountId,
      categoryId,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }

  @Post('bulk-delete')
  bulkDelete(
    @CurrentUser() user: UserPayload,
    @Body() body: { ids: string[] },
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    return this.transactionsService.removeMany(user.id, ids);
  }

  @Delete()
  removeByDateRange(
    @CurrentUser() user: UserPayload,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }
    return this.transactionsService.removeByDateRange(
      user.id,
      fromDate,
      toDate,
    );
  }
}
