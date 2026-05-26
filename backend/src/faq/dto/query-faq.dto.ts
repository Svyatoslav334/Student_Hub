import { IsOptional, IsString, IsEnum, IsNumberString, IsBoolean } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class QueryFaqDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FaqCategory)
  category?: FaqCategory;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsBoolean()
  showUnpublished?: boolean;
}