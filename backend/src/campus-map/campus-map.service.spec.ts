import { Test, TestingModule } from '@nestjs/testing';
import { CampusMapService } from './campus-map.service';

describe('CampusMapService', () => {
  let service: CampusMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampusMapService],
    }).compile();

    service = module.get<CampusMapService>(CampusMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
