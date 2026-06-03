import { Test, TestingModule } from '@nestjs/testing';
import { StudentGroupsService } from './student-groups.service';

describe('StudentGroupsService', () => {
  let service: StudentGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentGroupsService],
    }).compile();

    service = module.get<StudentGroupsService>(StudentGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
