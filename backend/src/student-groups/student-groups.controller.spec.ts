import { Test, TestingModule } from '@nestjs/testing';
import { StudentGroupsController } from './student-groups.controller';

describe('StudentGroupsController', () => {
  let controller: StudentGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentGroupsController],
    }).compile();

    controller = module.get<StudentGroupsController>(StudentGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
