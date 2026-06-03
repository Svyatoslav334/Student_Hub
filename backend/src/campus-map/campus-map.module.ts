import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CampusMap } from './campus-map.entity';
import { CampusMapController } from './campus-map.controller';
import { CampusMapService } from './campus-map.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CampusMap]),
    ConfigModule,
  ],
  controllers: [CampusMapController],
  providers: [CampusMapService],
  exports: [CampusMapService],
})
export class CampusMapModule {}