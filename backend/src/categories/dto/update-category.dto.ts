import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFixed?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
