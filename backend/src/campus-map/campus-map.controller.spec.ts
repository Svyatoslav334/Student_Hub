import { Test, TestingModule } from '@nestjs/testing';
import { CampusMapController } from './campus-map.controller';

describe('CampusMapController', () => {
  let controller: CampusMapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampusMapController],
    }).compile();

    controller = module.get<CampusMapController>(CampusMapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
