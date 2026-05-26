import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NewsCommentsService } from './news-comments.service';
import { CreateNewsCommentDto } from './dto/create-news-comment.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('news/:newsId/comments')
export class NewsCommentsController {
  constructor(private newsCommentsService: NewsCommentsService) {}

  @Get()
  findAll(@Param('newsId', ParseIntPipe) newsId: number) {
    return this.newsCommentsService.findByNewsId(newsId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('newsId', ParseIntPipe) newsId: number,
    @Body() dto: CreateNewsCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsCommentsService.create(newsId, dto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  remove(
    @Param('newsId', ParseIntPipe) newsId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsCommentsService.remove(newsId, commentId, user);
  }
}