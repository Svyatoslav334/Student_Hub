import {
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMaterialCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;
}