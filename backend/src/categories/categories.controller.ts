import {
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type UserPayload = { id: string; email: string };

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.categoriesService.findAllActive(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.categoriesService.findOneWithCount(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Query('migrateTo') migrateTo?: string,
  ) {
    return this.categoriesService.remove(user.id, id, migrateTo);
  }
}
