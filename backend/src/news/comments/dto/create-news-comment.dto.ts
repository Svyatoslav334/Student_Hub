import { IsString, MinLength } from 'class-validator';

export class CreateNewsCommentDto {
  @IsString()
  @MinLength(3)
  content!: string;
}