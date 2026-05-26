import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { TeachersService } from './teachers.service';

import { CreateTeacherDto } from './dto/create-teacher.dto';

import { UpdateTeacherDto } from './dto/update-teacher.dto';

import { QueryTeacherDto } from './dto/query-teacher.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('teachers')
export class TeachersController {
  constructor(
    private teachersService: TeachersService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryTeacherDto,
  ) {
    return this.teachersService.findAll(
      query,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  me(@Req() req) {
    return this.teachersService.findByUserId(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  updateMe(
    @CurrentUser() user: JwtPayload, 
    @Body() body: UpdateTeacherDto
  ) {
    return this.teachersService.updateByUserId(user.sub, body);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.teachersService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination:
          './uploads/teachers',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  create(
    @Body()
    body: CreateTeacherDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.photo =
        `/uploads/teachers/${file.filename}`;
    }

    return this.teachersService.create(
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination:
          './uploads/teachers',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: UpdateTeacherDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.photo =
        `/uploads/teachers/${file.filename}`;
    }

    return this.teachersService.update(
      id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.teachersService.remove(
      id,
    );
  }
}