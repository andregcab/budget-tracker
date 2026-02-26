import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
