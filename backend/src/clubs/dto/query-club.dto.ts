import {
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class QueryClubDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}