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
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ClubsService } from './clubs.service';

import { CreateClubDto } from './dto/create-club.dto';

import { UpdateClubDto } from './dto/update-club.dto';

import { QueryClubDto } from './dto/query-club.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('clubs')
export class ClubsController {
  constructor(
    private clubsService: ClubsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryClubDto,
  ) {
    return this.clubsService.findAll(
      query,
    );
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('participated')
  getParticipatedClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.getParticipatedClubs(user.sub);
  }


  @UseGuards(JwtAuthGuard)
  @Get('my-created')
  myCreatedClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.myCreatedClubs(user.sub);
  }


  @UseGuards(JwtAuthGuard)
  @Get('my')
  myClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.myClubs(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/clubs',

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
    body: CreateClubDto,

    @CurrentUser()
    user: JwtPayload,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/clubs/${file.filename}`;
    }

    return this.clubsService.create(
      body,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/clubs',

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
    body: UpdateClubDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/clubs/${file.filename}`;
    }

    return this.clubsService.update(
      id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinClub(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.clubsService.joinClub(
      id,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  leaveClub(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.clubsService.leaveClub(
      id,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  clubMembers(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.clubMembers(
      id,
    );
  }

@UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getClubMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubsService.getMessages(id, user.sub);
  }
}