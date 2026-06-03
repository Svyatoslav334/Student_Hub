import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Role, User } from './users.entity';
import { Profile } from '../profile/profile.entity';
import { Teacher } from '../teachers/teachers.entity';
import { StudentGroup } from '../student-groups/student-group.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,

    @InjectRepository(StudentGroup)
    private groupRepo: Repository<StudentGroup>,

    private dataSource: DataSource,
  ) {}

  async create(data: RegisterDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(User, { where: { email: data.email } });
      if (existing) throw new BadRequestException('Користувач з таким email вже існує');

      const hashedPassword = await bcrypt.hash(data.password, 10);

      
      const user = manager.create(User, {
        email: data.email,
        password: hashedPassword,
        role: data.role ?? Role.STUDENT,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      const savedUser = await manager.save(user);

      
      const profile = manager.create(Profile, {
        user: savedUser,
        bio: '',
        socialLinks: {},
      });
      await manager.save(profile);

      
      if (savedUser.role === Role.TEACHER) {
        await manager.save(
          manager.create(Teacher, {
            user: savedUser,
            department: '',
            subject: '',
            cabinet: null,
            consultationHours: null,
            bio: null,
            photo: null,
          }),
        );
      }

      return {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        createdAt: savedUser.createdAt,
      };
    });
  }
  
  async delete(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BadRequestException('Користувача не знайдено');
    await this.userRepo.remove(user);
    return { message: 'Користувача видалено' };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'createdAt', 'firstName', 'lastName'],
    });
  }

  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['profile', 'studentGroup'],
    });
  }

  async update(
    id: number,
    data: { firstName?: string; lastName?: string; email?: string; groupId?: number | null },
  ) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['studentGroup'],
    });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    if (data.email) user.email = data.email;
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;

    if (data.groupId !== undefined) {
      if (data.groupId === null) {
        user.studentGroup = null;
      } else {
        const group = await this.groupRepo.findOne({ where: { id: data.groupId } });
        if (!group) throw new BadRequestException('Групу не знайдено');
        user.studentGroup = group;
      }
    }

    await this.userRepo.save(user);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      studentGroup: user.studentGroup
        ? { id: user.studentGroup.id, name: user.studentGroup.name }
        : null,
    };
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['studentGroup'],
      order: { createdAt: 'DESC' },
    });

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        studentGroup: user.studentGroup
          ? { id: user.studentGroup.id, name: user.studentGroup.name, specialty: user.studentGroup.specialty }
          : null,
      })),
    };
  }

  async changeRole(id: number, role: Role) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    const oldRole = user.role;
    user.role = role;
    await this.userRepo.save(user);

    if (oldRole === Role.TEACHER && role === Role.STUDENT) {
      const teacher = await this.teacherRepo.findOne({ where: { user: { id: user.id } } });
      if (teacher) await this.teacherRepo.remove(teacher);
    }

    if (role === Role.TEACHER) {
      let teacher = await this.teacherRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (!teacher) {
        teacher = this.teacherRepo.create({
          user: user,
          department: '',
          subject: '',
        });
        await this.teacherRepo.save(teacher);
      }
    }

    return { message: 'Роль успішно оновлено', role: user.role };
  }
}