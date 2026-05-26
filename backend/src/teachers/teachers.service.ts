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

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
  ) {}

  async create(
    data: CreateTeacherDto,
  ) {
    const existingTeacher =
      await this.teacherRepo.findOne({
        where: {
          email: data.email,
        },
      });

    if (existingTeacher) {
      throw new BadRequestException(
        'Teacher with this email already exists',
      );
    }

    const teacher =
      this.teacherRepo.create(data);

    return this.teacherRepo.save(
      teacher,
    );
  }

  async findAll(
    query: QueryTeacherDto,
  ) {
    const page = Number(query.page ?? 1);

    const limit = Number(
      query.limit ?? 10,
    );

    const where: FindOptionsWhere<Teacher>[] = [];

    if (query.search) {
      where.push(
        {
          firstName: ILike(
            `%${query.search}%`,
          ),
        },
        {
          lastName: ILike(
            `%${query.search}%`,
          ),
        },
        {
          subject: ILike(
            `%${query.search}%`,
          ),
        },
        {
          department: ILike(
            `%${query.search}%`,
          ),
        },
      );
    }

    const [items, total] =
      await this.teacherRepo.findAndCount({
        where:
          where.length > 0
            ? where
            : {},

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

  async findByUserId(userId: number) {
    try {
      const teacher = await this.teacherRepo.findOne({
        where: {
          user: { id: userId },
        },
        relations: ['user'],
      });

      if (!teacher) {

        const newTeacher = this.teacherRepo.create({
          user: { id: userId } as any,
          firstName: '',
          lastName: '',
          department: '',
          subject: '',
          cabinet: null,
          consultationHours: null,
          bio: null,
          phone: null,
          email: '',
        });

        return this.teacherRepo.save(newTeacher);
      }

      return teacher;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new NotFoundException('Teacher profile not found');
    }
  }

  async updateByUserId(userId: number, data: UpdateTeacherDto) {
    let teacher = await this.findByUserId(userId);


    if (!teacher?.id) {
      throw new NotFoundException('Failed to create teacher profile');
    }

    Object.assign(teacher, data);


    if (data.email) {
      teacher.email = data.email;
    }

    return this.teacherRepo.save(teacher);
  }

  async findOne(id: number) {
    const teacher =
      await this.teacherRepo.findOne({
        where: { id },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    return teacher;
  }

  async update(
    id: number,
    data: UpdateTeacherDto,
  ) {
    const teacher =
      await this.findOne(id);

    if (
      data.email &&
      data.email !== teacher.email
    ) {
      const existingTeacher =
        await this.teacherRepo.findOne({
          where: {
            email: data.email,
          },
        });

      if (existingTeacher) {
        throw new BadRequestException(
          'Teacher with this email already exists',
        );
      }
    }

    Object.assign(teacher, data);

    return this.teacherRepo.save(
      teacher,
    );
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
