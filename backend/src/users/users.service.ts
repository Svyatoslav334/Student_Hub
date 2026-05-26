import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from './users.entity';
import { Profile } from '../profile/profile.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { Teacher } from '../teachers/teachers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    private dataSource: DataSource,
  ) {}

  async create(data: RegisterDto) {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = manager.create(User, {
        email: data.email,
        password: hashedPassword,
        role: data.role ?? Role.STUDENT,
      });

      const savedUser = await manager.save(user);

      const profile = manager.create(Profile, {
        user: savedUser,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      await manager.save(profile);

      if (savedUser.role === Role.TEACHER) {
        await manager.save(
          manager.create(Teacher, {
            user: savedUser,
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            department: '',
            subject: '',
            cabinet: null,
            consultationHours: null,
            bio: null,
            phone: data.phone ?? null,
            email: savedUser.email,
          }),
        );
      }

      return {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };

    });
  }

  async update(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    const user =
      await this.userRepo.findOne({
        where: { id },
        relations: ['profile'],
      });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    if (data.email) {
      user.email = data.email;
    }

    if (user.profile) {
      if (data.firstName !== undefined) {
        user.profile.firstName =
          data.firstName;
      }

      if (data.lastName !== undefined) {
        user.profile.lastName =
          data.lastName;
      }

      await this.profileRepo.save(
        user.profile,
      );
    }

    await this.userRepo.save(user);

    return {
      id: user.id,
      email: user.email,
      firstName:
        user.profile?.firstName,
      lastName:
        user.profile?.lastName,
      role: user.role,
    };
  }
  
  async delete(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    await this.userRepo.remove(user);

    return {
      message: 'User deleted',
    };
  }

  async changeRole(
    id: number,
    role: Role,
  ) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    user.role = role;

    await this.userRepo.save(user);

    return {
      message: 'Role updated',
      role: user.role,
    };
  }

  async findAll() {
    const users =
      await this.userRepo.find({
        relations: ['profile'],
      });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`,
    }));
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'createdAt',
      ],
    });
  }

  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
  }
}
