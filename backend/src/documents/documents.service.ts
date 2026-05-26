import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Document } from './document.entity';
import { DocumentCategory } from './document-category.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/users.entity';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(DocumentCategory)
    private categoryRepo: Repository<DocumentCategory>,
  ) {}

  async create(data: CreateDocumentDto, userId: number, file?: Express.Multer.File) {
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const document = this.documentRepo.create({
      title: data.title,
      description: data.description,
      type: data.type,
      isPublished: data.isPublished ?? true,
      
      category,

      author: { id: userId } as any,

      file: file ? `/uploads/documents/${file.filename}` : null,
      originalFileName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
    });

    return this.documentRepo.save(document);
  }

  async findAll(query: QueryDocumentDto, user?: JwtPayload) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<Document> = {};

    if (!query.showUnpublished || user?.role !== Role.ADMIN) {
      where.isPublished = true;
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.category = { id: Number(query.categoryId) };
    }

    const [items, total] = await this.documentRepo.findAndCount({
      where,
      relations: ['author', 'author.profile', 'category'],
      order: { createdAt: 'DESC' },
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
    const doc = await this.documentRepo.findOne({
      where: { id },
      relations: ['author', 'author.profile', 'category'],
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: number, data: UpdateDocumentDto, user: JwtPayload) {
    const doc = await this.findOne(id);

    if (user.role === Role.TEACHER && doc.author?.id !== user.sub) {
      throw new ForbiddenException('You can only edit your own documents');
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      doc.category = category;
    }

    Object.assign(doc, data);
    return this.documentRepo.save(doc);
  }

  async remove(id: number, user: JwtPayload) {
    const doc = await this.findOne(id);

    if (user.role === Role.TEACHER && doc.author?.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own documents');
    }

    await this.documentRepo.remove(doc);
    return { message: 'Document deleted' };
  }

  async findAllCategories() {
    return this.categoryRepo.find({
      order: { name: 'ASC' },
    });
  }

  async createCategory(data: CreateDocumentCategoryDto) {
    const existing = await this.categoryRepo.findOne({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async removeCategory(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.documents && category.documents.length > 0) {
      throw new BadRequestException('Cannot delete category that has documents');
    }

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }
}