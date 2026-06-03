import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StudentGroup } from './student-group.entity';
import { GroupMessage } from './group-message.entity';
import { User } from '../users/users.entity';
import { Teacher } from '../teachers/teachers.entity';

import { StudentGroupsController } from './student-groups.controller';
import { StudentGroupsService } from './student-groups.service';
import { GroupChatGateway } from './group-chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentGroup, GroupMessage, User, Teacher]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [StudentGroupsController],
  providers: [StudentGroupsService, GroupChatGateway],
  exports: [StudentGroupsService],
})
export class StudentGroupsModule {}