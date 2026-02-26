import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  accountId: string;

  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsIn(['debit', 'credit'])
  type: 'debit' | 'credit';

  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;
}
