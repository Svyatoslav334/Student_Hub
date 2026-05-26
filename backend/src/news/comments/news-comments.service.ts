import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsComment } from './news-comment.entity';
import { News } from '../news.entity';
import { User } from '../../users/users.entity';
import { CreateNewsCommentDto } from './dto/create-news-comment.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { Role } from '../../users/users.entity';

@Injectable()
export class NewsCommentsService {
  constructor(
    @InjectRepository(NewsComment)
    private commentRepo: Repository<NewsComment>,
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  async create(newsId: number, dto: CreateNewsCommentDto, userId: number) {
    const news = await this.newsRepo.findOne({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    const comment = this.commentRepo.create({
      content: dto.content,
      news: { id: newsId } as any,
      author: { id: userId } as any,
    });

    return this.commentRepo.save(comment);
  }

  async findByNewsId(newsId: number) {
    return this.commentRepo.find({
      where: { news: { id: newsId }, isPublished: true },
      relations: ['author', 'author.profile'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(newsId: number, commentId: number, user: JwtPayload) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'news'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.news.id !== newsId) throw new NotFoundException('Comment not found');


    if (user.role !== Role.ADMIN && comment.author.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }
}