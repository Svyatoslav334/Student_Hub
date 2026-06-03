import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Profile } from '../profile/profile.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Teacher } from '../teachers/teachers.entity';
import { StudentGroup } from '../student-groups/student-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, StudentGroup, Teacher])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
