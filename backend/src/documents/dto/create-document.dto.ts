import { Transform } from 'class-transformer';
import { IsString, MinLength, IsEnum, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { DocumentType } from '../document.entity';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(DocumentType)
  type!: DocumentType;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  categoryId!: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;
}