import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpsertBudgetDto {
  @IsString()
  categoryId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}
