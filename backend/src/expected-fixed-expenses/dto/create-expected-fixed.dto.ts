import { IsInt, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateExpectedFixedDto {
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
