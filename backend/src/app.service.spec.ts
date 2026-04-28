import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

function createPrismaMock() {
  return {
    job: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    jobActivity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService & {
    job: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    application: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    jobActivity: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
}

describe('AppService', () => {
  let service: AppService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AppService(prisma);
  });

  it('returns mapped board state', async () => {
    prisma.job.findMany.mockResolvedValue([
      {
        id: 'job_1',
        title: 'Escrow integration',
        description: 'desc',
        skills: ['NestJS', 'Prisma'],
        status: 'Open',
        paymentType: 'Fixed',
        experience: 'Mid',
        budgetMin: 100,
        budgetMax: 200,
        currency: 'USDC',
        deadline: '2026-04-30',
        location: 'Remote',
        clientName: 'Atlas',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        clientAddress: null,
        acceptedApplicationId: null,
        escrowTxHash: null,
        onchainJobId: null,
        workerAddress: null,
      },
    ]);
    prisma.application.findMany.mockResolvedValue([]);
    prisma.jobActivity.findMany.mockResolvedValue([]);

    await expect(service.getState()).resolves.toEqual({
      jobs: [
        expect.objectContaining({
          id: 'job_1',
          skills: ['NestJS', 'Prisma'],
          createdAt: '2026-04-01T00:00:00.000Z',
        }),
      ],
      applications: [],
      activity: [],
    });
  });

  it('rejects applications for jobs that are no longer open', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'job_2',
      title: 'Closed job',
      status: 'Funded',
      budgetMax: 500,
    });

    await expect(
      service.applyToJob('job_2', {
        freelancerName: 'Rafi',
        deliveryDays: 5,
        coverLetter: 'Ready to help',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects accepting an application from a different job', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'job_1',
      status: 'Open',
      clientName: 'Atlas',
      title: 'Escrow integration',
      workerAddress: null,
    });
    prisma.application.findUnique.mockResolvedValue({
      id: 'app_9',
      jobId: 'job_9',
      freelancerName: 'Rafi',
    });

    await expect(service.acceptApplication('job_1', 'app_9')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('stores the onchain job id when funding escrow', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'job_1',
      title: 'Escrow integration',
      status: 'Accepted',
      onchainJobId: null,
    });
    prisma.job.update.mockReturnValue('jobUpdate');
    prisma.jobActivity.create.mockReturnValue('activityCreate');
    prisma.$transaction.mockResolvedValue([]);

    await expect(
      service.fundEscrow('job_1', {
        onchainJobId: 17,
        txHash: '0xabc',
      }),
    ).resolves.toEqual({ ok: true });

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job_1' },
      data: {
        status: 'Funded',
        escrowTxHash: '0xabc',
        onchainJobId: 17,
      },
    });
  });
});
