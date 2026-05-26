import {
  IsString,
  MinLength,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { MaterialType } from '../material.entity';

export class CreateMaterialDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsInt()
  categoryId!: number;
}