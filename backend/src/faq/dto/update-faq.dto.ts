import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  category?: FaqCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}