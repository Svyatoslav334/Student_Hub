import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { Club } from './clubs.entity';
import { ClubMessage } from './club-message.entity';

import { User } from '../users/users.entity';

import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

import { ClubChatGateway } from './club-chat.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      User,
      ClubMessage,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],

  controllers: [
    ClubsController,
  ],

  providers: [
    ClubsService,
    ClubChatGateway,
  ],
})
export class ClubsModule {}