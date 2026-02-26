import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsBoolean()
  @IsOptional()
  isExcluded?: boolean;
}
