import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { Teacher } from './teachers.entity';

import { CreateTeacherDto } from './dto/create-teacher.dto';

import { UpdateTeacherDto } from './dto/update-teacher.dto';

import { QueryTeacherDto } from './dto/query-teacher.dto';
import { User } from '../users/users.entity';

import { SupabaseStorageService } from '../common/supabase-storage.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private storage: SupabaseStorageService,
  ) {}

  async create(data: CreateTeacherDto, file?: Express.Multer.File) {
    const existingUser = await this.userRepo.findOne({ where: { email: data.email } });
    if (!existingUser) throw new NotFoundException('User with this email not found');

    let photoUrl = data.photo;
    if (file) {
      photoUrl = await this.storage.upload(file, 'teachers');
    }

    const teacher = this.teacherRepo.create({
      user: existingUser,
      department: data.department,
      subject: data.subject,
      cabinet: data.cabinet,
      photo: photoUrl ?? null,
    });

    return this.teacherRepo.save(teacher);
  }

  async findAll(query: QueryTeacherDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<Teacher>[] = [];

    if (query.search) {
      where.push(
        { user: { firstName: ILike(`%${query.search}%`) } },
        { user: { lastName: ILike(`%${query.search}%`) } },
        { subject: ILike(`%${query.search}%`) },
      );
    }

    const [items, total] = await this.teacherRepo.findAndCount({
      where: where.length > 0 ? where : {},
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filteredItems = items.filter(teacher =>
      teacher.user?.firstName?.trim() &&
      teacher.user?.lastName?.trim() &&
      teacher.subject?.trim()
    );

    return {
      items: filteredItems,
      total: filteredItems.length,
      page,
      limit,
      totalPages: Math.ceil(filteredItems.length / limit),
    };
  }

  async findByUserId(userId: number) {
    let teacher = await this.teacherRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!teacher) {
      teacher = this.teacherRepo.create({
        user: { id: userId } as any,
        department: '',
        subject: '',
      });
      teacher = await this.teacherRepo.save(teacher);
      teacher = await this.teacherRepo.findOne({
        where: { id: teacher.id },
        relations: ['user'],
      }) ?? teacher;
    }

    return teacher;
  }

  async updateByUserId(userId: number, data: UpdateTeacherDto) {
    const teacher = await this.findByUserId(userId);
    if (!teacher?.id) throw new NotFoundException('Failed to find teacher profile');

    
    const { firstName, lastName, email, ...teacherData } = data;
    Object.assign(teacher, teacherData);

    
    if (firstName !== undefined || lastName !== undefined || email !== undefined) {
      await this.userRepo.update(userId, {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
      });
    }

    return this.teacherRepo.save(teacher);
  }

  async update(id: number, data: UpdateTeacherDto, file?: Express.Multer.File) {
    const teacher = await this.findOne(id);

    const { firstName, lastName, email, ...teacherData } = data;
    Object.assign(teacher, teacherData);

    if (file) {
      if (teacher.photo) await this.storage.delete(teacher.photo);
      teacher.photo = await this.storage.upload(file, 'teachers');
    }

    if (firstName !== undefined || lastName !== undefined || email !== undefined) {
      await this.userRepo.update(teacher.user.id, {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
      });
    }

    return this.teacherRepo.save(teacher);
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async remove(id: number) {
    const teacher =
      await this.findOne(id);

    await this.teacherRepo.remove(
      teacher,
    );

    return {
      message: 'Teacher deleted',
    };
  }
}
