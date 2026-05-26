import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepo: Repository<Faq>,
  ) {}

  async findAll(query: QueryFaqDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<Faq> = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.question = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.faqRepo.findAndCount({
      where,
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
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(data: CreateFaqDto) {
    const faq = this.faqRepo.create({ ...data, isPublished: true });
    return this.faqRepo.save(faq);
  }

  async update(id: number, data: UpdateFaqDto) {
    const faq = await this.findOne(id);
    Object.assign(faq, data);
    return this.faqRepo.save(faq);
  }

  async remove(id: number) {
    const faq = await this.findOne(id);
    await this.faqRepo.remove(faq);
    return { message: 'FAQ deleted' };
  }

  async askQuestion(question: string, category: any, userId: number) {
    const faq = this.faqRepo.create({
      question,
      answer: '', 
      category: category || 'OTHER',
      isPublished: false,
      author: { id: userId } as any,
    });

    return this.faqRepo.save(faq);
  }
}