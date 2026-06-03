import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampusMap } from './campus-map.entity';

@Injectable()
export class CampusMapService {
  constructor(
    @InjectRepository(CampusMap)
    private mapRepo: Repository<CampusMap>,
  ) {}

  
  async getCurrentMap(floor = 1) {
    return this.mapRepo.findOne({
      where: { floor },
      order: { id: 'DESC' },
    });
  }

  async findAll() {
    return this.mapRepo.find({ order: { floor: 'ASC', id: 'DESC' } });
  }

  async findOne(id: number) {
    const map = await this.mapRepo.findOne({ where: { id } });
    if (!map) throw new NotFoundException('Карту не знайдено');
    return map;
  }

  async create(data: Partial<CampusMap>) {
    const map = this.mapRepo.create(data);
    return this.mapRepo.save(map);
  }

  async update(id: number, data: Partial<CampusMap>) {
    const map = await this.findOne(id);
    Object.assign(map, data);
    return this.mapRepo.save(map);
  }

  async remove(id: number) {
    const map = await this.findOne(id);
    await this.mapRepo.remove(map);
    return { message: 'Карту видалено' };
  }

  
  async saveMap(
    floor: number,
    name: string,
    svgData: string,
    rooms: CampusMap['rooms'],
  ) {
    const existing = await this.mapRepo.findOne({
      where: { floor },
      order: { id: 'DESC' },
    });

    if (existing) {
      existing.svgData = svgData;
      existing.rooms = rooms;
      existing.name = name;
      return this.mapRepo.save(existing);
    }

    const newMap = this.mapRepo.create({ name, floor, svgData, rooms, imageUrl: '' });
    return this.mapRepo.save(newMap);
  }
}