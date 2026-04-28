import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/jobs (GET)', () => {
    appService.getState.mockResolvedValue({
      jobs: [{ id: 'job_1', title: 'Example' }],
      applications: [],
      activity: [],
    });

    return request(app.getHttpServer())
      .get('/jobs')
      .expect(200)
      .expect({
        jobs: [{ id: 'job_1', title: 'Example' }],
        applications: [],
        activity: [],
      });
  });

  it('/jobs/:jobId/fund (POST)', async () => {
    appService.fundEscrow.mockResolvedValue({ ok: true });

    await request(app.getHttpServer())
      .post('/jobs/job_7/fund')
      .send({ onchainJobId: 9, txHash: '0xfeed' })
      .expect(201)
      .expect({ ok: true });

    expect(appService.fundEscrow).toHaveBeenCalledWith('job_7', {
      onchainJobId: 9,
      txHash: '0xfeed',
    });
  });
});
