import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { CreateApplicationInput, CreateJobInput } from './jobs.types';

@Controller('jobs')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getState() {
    return this.appService.getState();
  }

  @Post()
  createJob(@Body() body: CreateJobInput) {
    return this.appService.createJob(body);
  }

  @Post(':jobId/applications')
  applyToJob(
    @Param('jobId') jobId: string,
    @Body() body: CreateApplicationInput,
  ) {
    return this.appService.applyToJob(jobId, body);
  }

  @Post(':jobId/accept/:applicationId')
  acceptApplication(
    @Param('jobId') jobId: string,
    @Param('applicationId') applicationId: string,
    @Body() body: { workerAddress?: string },
  ) {
    return this.appService.acceptApplication(jobId, applicationId, body.workerAddress);
  }

  @Post(':jobId/fund')
  fundEscrow(
    @Param('jobId') jobId: string,
    @Body() body: { onchainJobId?: number; txHash?: string },
  ) {
    return this.appService.fundEscrow(jobId, body);
  }

  @Post(':jobId/deliver')
  markDelivered(@Param('jobId') jobId: string) {
    return this.appService.markDelivered(jobId);
  }

  @Post(':jobId/release')
  releasePayment(@Param('jobId') jobId: string) {
    return this.appService.releasePayment(jobId);
  }
}
