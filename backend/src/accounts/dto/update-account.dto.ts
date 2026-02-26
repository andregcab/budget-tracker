import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
