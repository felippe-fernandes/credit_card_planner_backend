import { Test, TestingModule } from '@nestjs/testing';
import { DependentsService } from './dependents.service';
import { PrismaService } from 'prisma/prisma.service';

describe('DependentsService', () => {
  let service: DependentsService;

  const mockPrismaService = {
    dependent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DependentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DependentsService>(DependentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
