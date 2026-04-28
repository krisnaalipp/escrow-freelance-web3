import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    getState: jest.fn(),
    createJob: jest.fn(),
    applyToJob: jest.fn(),
    acceptApplication: jest.fn(),
    fundEscrow: jest.fn(),
    markDelivered: jest.fn(),
    releasePayment: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  it('returns board state', () => {
    const state = { jobs: [], applications: [], activity: [] };
    appService.getState.mockReturnValue(state);

    expect(appController.getState()).toBe(state);
    expect(appService.getState).toHaveBeenCalledTimes(1);
  });

  it('passes onchain escrow details through to the service', () => {
    appController.fundEscrow('job_123', {
      onchainJobId: 44,
      txHash: '0xabc',
    });

    expect(appService.fundEscrow).toHaveBeenCalledWith('job_123', {
      onchainJobId: 44,
      txHash: '0xabc',
    });
  });
});
