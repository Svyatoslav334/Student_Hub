import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Teacher } from './teachers.entity';

import { TeachersController } from './teachers.controller';
import { User } from '../users/users.entity';

import { TeachersService } from './teachers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      User,
    ]),
  ],

  controllers: [
    TeachersController,
  ],

  providers: [TeachersService],
})
export class TeachersModule {}