import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { News } from './news.entity';
import { NewsComment } from './comments/news-comment.entity';

import { NewsService } from './news.service';
import { NewsController } from './news.controller';

import { NewsCommentsController } from './comments/news-comments.controller';
import { NewsCommentsService } from './comments/news-comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News,
      NewsComment,
    ]),
  ],

  controllers: [
    NewsController,
    NewsCommentsController,
  ],

  providers: [
    NewsService,
    NewsCommentsService,
  ],
})
export class NewsModule {}