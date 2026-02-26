import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isFixed?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
