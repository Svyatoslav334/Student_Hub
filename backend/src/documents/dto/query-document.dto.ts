import { IsOptional, IsString, IsNumberString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '../document.entity';

export class QueryDocumentDto {
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
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showUnpublished?: boolean;
}