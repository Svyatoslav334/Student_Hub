import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CampusMapService } from './campus-map.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('map')
export class CampusMapController {
  constructor(private readonly service: CampusMapService) {}

  

  @Get()
  getCurrent(@Query('floor') floor?: string) {
    return this.service.getCurrentMap(floor ? parseInt(floor) : 1);
  }

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  saveMap(
    @Body()
    body: {
      floor?: number;
      name?: string;
      svgData: string;
      rooms: any[];
    },
  ) {
    if (!body.svgData) throw new BadRequestException('svgData обовʼязковий');

    const floor = body.floor ?? 1;
    const name = body.name || `Поверх ${floor}`;

    return this.service.saveMap(floor, name, body.svgData, body.rooms ?? []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}