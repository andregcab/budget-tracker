import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpsertRevenueDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}
