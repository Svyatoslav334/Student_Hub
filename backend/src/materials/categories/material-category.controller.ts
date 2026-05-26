import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';

import { MaterialCategoryService } from './material-category.service';

import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/guards/roles.decorator';

import { Role } from '../../users/users.entity';

@Controller('material-categories')
export class MaterialCategoryController {
  constructor(
    private categoryService: MaterialCategoryService,
  ) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.categoryService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body()
    body: CreateMaterialCategoryDto,
  ) {
    return this.categoryService.create(
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
    return this.categoryService.remove(
      id,
    );
  }
}