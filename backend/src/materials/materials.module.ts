import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Material } from './material.entity';

import { MaterialCategory } from './categories/material-category.entity';

import { MaterialsController } from './materials.controller';

import { MaterialsService } from './materials.service';

import { MaterialCategoryModule } from './categories/material-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Material,
      MaterialCategory,
    ]),

    MaterialCategoryModule,
  ],

  controllers: [MaterialsController],

  providers: [MaterialsService],
})
export class MaterialsModule {}