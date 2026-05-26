import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { NewsService } from './news.service';

import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('news')
export class NewsController {
  constructor(
    private newsService: NewsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryNewsDto,
  ) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.newsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/news',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);

          callback(
            null,
            uniqueName +
              extname(file.originalname),
          );
        },
      }),
    }),
  )
  create(
    @Body() body: CreateNewsDto,

    @CurrentUser() user: JwtPayload,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/news/${file.filename}`;
    }

    return this.newsService.create(
    body,
    user.sub,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { /* ... */ }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    const processedBody = {
      ...body,
      pinned: body.pinned === 'true' || body.pinned === true,
    };

    const updateData = plainToInstance(UpdateNewsDto, processedBody, {
      enableImplicitConversion: true,
    });

    if (file) {
      updateData.image = `/uploads/news/${file.filename}`;
    }

    return this.newsService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.newsService.remove(id);
  }
}