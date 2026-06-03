import { IsString, MinLength, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateStudentGroupDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsEmail()
  curatorEmail?: string;
}