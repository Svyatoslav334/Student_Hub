import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { Material, MaterialType } from './material.entity';

import { MaterialCategory } from './categories/material-category.entity';

import { CreateMaterialDto } from './dto/create-material.dto';

import { UpdateMaterialDto } from './dto/update-material.dto';

import { QueryMaterialDto } from './dto/query-material.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/users.entity';
import { SupabaseStorageService } from '../common/supabase-storage.service';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,

    @InjectRepository(MaterialCategory)
    private categoryRepo: Repository<MaterialCategory>,

    private storage: SupabaseStorageService,
  ) {}

  async create(data: CreateMaterialDto, userId: number, file?: Express.Multer.File) {
    const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    let fileUrl: string | null = null;
    if (file) {
      fileUrl = await this.storage.upload(file, 'materials');
    }

    const material = this.materialRepo.create({
      title: data.title,
      description: data.description,
      category,
      type: data.type || MaterialType.OTHER,
      author: { id: userId } as any,
      file: fileUrl,
      originalFileName: file?.originalname ?? null,
      mimeType: file?.mimetype ?? null,
      size: file?.size ?? null,
    });

    return this.materialRepo.save(material);
  }

  async findAll(
    query: QueryMaterialDto,
    currentUser?: JwtPayload,
  ) {
    const page = Number(query.page ?? 1);

    const limit = Number(
      query.limit ?? 10,
    );

    const where: FindOptionsWhere<Material> =
      {};

      if (query.my === 'true' && currentUser?.sub) {
        where.author = { id: currentUser.sub };
      }

      if (query.type) {
        where.type = query.type;
      }
    
      if (query.search) {
        where.title = ILike(
          `%${query.search}%`,
        );
      }

    if (query.categoryId) {
      where.category = {
        id: Number(query.categoryId),
      };
    }

    const [items, total] =
      await this.materialRepo.findAndCount({
        where,

        relations: [
          'author',
          'author.profile',
        ],

        order: {
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

      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  async findOne(id: number) {
    const material =
      await this.materialRepo.findOne({
        where: { id },

        relations: [
          'author',
          'author.profile',
        ],
      });

    if (!material) {
      throw new NotFoundException(
        'Material not found',
      );
    }

    return material;
  }

  async update(id: number, data: UpdateMaterialDto, user: JwtPayload, file?: Express.Multer.File) {
    const material = await this.findOne(id);

    if (user.role === Role.TEACHER && material.author?.id !== user.sub) {
      throw new ForbiddenException('You can edit only your materials');
    }

    if (data.title) material.title = data.title;
    if (data.description) material.description = data.description;
    if (data.type) material.type = data.type;
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (category) material.category = category;
    }

    if (file) {
      if (material.file) await this.storage.delete(material.file);
      material.file = await this.storage.upload(file, 'materials');
      material.originalFileName = file.originalname;
      material.mimeType = file.mimetype;
      material.size = file.size;
    }

    return this.materialRepo.save(material);
  }

  async remove(
    id: number,
    user: JwtPayload,
  ) {
    const material =
      await this.findOne(id);

      if (
        user.role === Role.TEACHER &&
        material.author?.id !== user.sub
      ) {
        throw new ForbiddenException(
          'You can delete only your materials',
        );
      }

      await this.materialRepo.remove(
        material,
      );

      return {
        message: 'Material deleted',
      };
  }
}
