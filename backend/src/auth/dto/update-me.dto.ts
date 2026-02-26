import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMeDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyIncome?: number;
}
