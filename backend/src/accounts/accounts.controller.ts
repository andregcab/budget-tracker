import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

type UserPayload = { id: string; email: string };

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.accountsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.accountsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.accountsService.remove(user.id, id);
  }
}
