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

import { diskStorage, memoryStorage } from 'multer';

import { extname } from 'path';

import { MaterialsService } from './materials.service';

import { CreateMaterialDto } from './dto/create-material.dto';

import { UpdateMaterialDto } from './dto/update-material.dto';

import { QueryMaterialDto } from './dto/query-material.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('materials')
export class MaterialsController {
  constructor(
    private materialsService: MaterialsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryMaterialDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.materialsService.findAll(
      query,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.materialsService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  create(@Body() body: CreateMaterialDto, @CurrentUser() user: JwtPayload, @UploadedFile() file?) {
    return this.materialsService.create(body, user.sub, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMaterialDto, @CurrentUser() user: JwtPayload, @UploadedFile() file?) {
    return this.materialsService.update(id, body, user, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.materialsService.remove(
      id,
      user,
    );
  }
}