import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { NewsModule } from './news/news.module';
import { MaterialsModule } from './materials/materials.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClubsModule } from './clubs/clubs.module';
import { FaqModule } from './faq/faq.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        ssl: {
          rejectUnauthorized: false,
        },

        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    ProfileModule,
    NewsModule,
    MaterialsModule,
    TeachersModule,
    ClubsModule,
    FaqModule,
    DocumentsModule,
  ],
})
export class AppModule {}