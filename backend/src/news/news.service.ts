import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { News } from './news.entity';

import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

import { User } from '../users/users.entity';

@Injectable()
  export class NewsService {
    constructor(
      @InjectRepository(News)
      private newsRepo: Repository<News>,
    ) {}

  async create(data: CreateNewsDto, userId: number) {
    const news = this.newsRepo.create({
      ...data,
      author: { id: userId } as any,
    });

    return this.newsRepo.save(news);
  }

  async findAll(query: QueryNewsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<News> = {};

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    if (query.category) {
      where.category = query.category;
    }

    const [items, total] =
      await this.newsRepo.findAndCount({
        where,

        relations: [
          'author',
          'author.profile',
        ],

        order: {
          pinned: 'DESC',
          createdAt: 'DESC',
        },

        skip: (page - 1) * limit,

        take: limit,
      });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const news = await this.newsRepo.findOne({
      where: { id },
      relations: ['author', 'author.profile'],
    });

    if (!news) {
      throw new NotFoundException(
        'News not found',
      );
    }

    return news;
  }

  async update(
    id: number,
    data: UpdateNewsDto,
  ) {
    const news = await this.findOne(id);

    Object.assign(news, data);

    return this.newsRepo.save(news);
  }

  async remove(id: number) {
    const news = await this.findOne(id);

    await this.newsRepo.remove(news);

    return {
      message: 'News deleted',
    };
  }
}