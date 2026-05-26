import {
  IsOptional,
  IsString,
  IsNumberString,
  IsEnum,
} from 'class-validator';
import { NewsCategory } from '../news.entity';

export class QueryNewsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;
}