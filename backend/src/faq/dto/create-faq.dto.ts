
import { IsString, MinLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class CreateFaqDto {
  @IsString()
  @MinLength(10)
  question!: string;

  @IsString()
  @MinLength(20)
  answer!: string;

  @IsEnum(FaqCategory)
  category!: FaqCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}