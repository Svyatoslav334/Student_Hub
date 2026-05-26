import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MaterialCategory } from './material-category.entity';

import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';

@Injectable()
export class MaterialCategoryService {
  constructor(
    @InjectRepository(MaterialCategory)
    private categoryRepo: Repository<MaterialCategory>,
  ) {}

  async create(
    data: CreateMaterialCategoryDto,
  ) {
    const existing =
      await this.categoryRepo.findOne({
        where: {
          name: data.name,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Category already exists',
      );
    }

    const category =
      this.categoryRepo.create(data);

    return this.categoryRepo.save(
      category,
    );
  }

  findAll() {
    return this.categoryRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const category =
      await this.categoryRepo.findOne({
        where: { id },

        relations: ['materials'],
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    return category;
  }

  async remove(id: number) {
    const category =
      await this.findOne(id);

    await this.categoryRepo.remove(
      category,
    );

    return {
      message: 'Category deleted',
    };
  }
}