import { Test, TestingModule } from '@nestjs/testing';
import { DependentsController } from './dependents.controller';

describe('DependentsController', () => {
  let controller: DependentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependentsController],
    }).compile();

    controller = module.get<DependentsController>(DependentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
