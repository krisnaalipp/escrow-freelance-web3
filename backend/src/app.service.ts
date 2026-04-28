import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import type {
  ActivityType,
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  CreateJobInput,
  ExperienceLevel,
  Job,
  JobActivity,
  JobBoardState,
  JobStatus,
  PaymentType,
} from './jobs.types';
import { SEEDED_ACTIVITY, SEEDED_APPLICATIONS, SEEDED_JOBS } from './jobs.seed';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  private async getJobOrThrow(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private async getApplicationOrThrow(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private mapJob(job: {
    id: string;
    title: string;
    description: string;
    skills: unknown;
    status: string;
    paymentType: string;
    experience: string;
    budgetMin: number;
    budgetMax: number;
    currency: string;
    deadline: string;
    location: string;
    clientName: string;
    createdAt: Date;
    clientAddress: string | null;
    acceptedApplicationId: string | null;
    escrowTxHash: string | null;
    onchainJobId: number | null;
    workerAddress: string | null;
  }): Job {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      skills: Array.isArray(job.skills) ? (job.skills as string[]) : [],
      status: job.status as JobStatus,
      paymentType: job.paymentType as PaymentType,
      experience: job.experience as ExperienceLevel,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      currency: job.currency,
      deadline: job.deadline,
      location: job.location,
      clientName: job.clientName,
      createdAt: job.createdAt.toISOString(),
      clientAddress: job.clientAddress ?? undefined,
      acceptedApplicationId: job.acceptedApplicationId ?? undefined,
      escrowTxHash: job.escrowTxHash ?? undefined,
      onchainJobId: job.onchainJobId ?? undefined,
      workerAddress: job.workerAddress ?? undefined,
    };
  }

  private mapApplication(application: {
    id: string;
    jobId: string;
    freelancerName: string;
    freelancerAddress: string | null;
    amount: number;
    deliveryDays: number;
    coverLetter: string;
    status: string;
    createdAt: Date;
  }): Application {
    return {
      id: application.id,
      jobId: application.jobId,
      freelancerName: application.freelancerName,
      freelancerAddress: application.freelancerAddress ?? undefined,
      amount: application.amount,
      deliveryDays: application.deliveryDays,
      coverLetter: application.coverLetter,
      status: application.status as ApplicationStatus,
      createdAt: application.createdAt.toISOString(),
    };
  }

  private mapActivity(activity: {
    id: string;
    type: string;
    message: string;
    createdAt: Date;
    jobId: string;
  }): JobActivity {
    return {
      id: activity.id,
      type: activity.type as ActivityType,
      message: activity.message,
      createdAt: activity.createdAt.toISOString(),
      jobId: activity.jobId,
    };
  }

  private async seedDatabase() {
    const jobCount = await this.prisma.job.count();

    if (jobCount > 0) {
      return;
    }

    for (const job of SEEDED_JOBS) {
      await this.prisma.job.create({
        data: {
          id: job.id,
          title: job.title,
          description: job.description,
          skills: job.skills,
          status: job.status,
          paymentType: job.paymentType,
          experience: job.experience,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          currency: job.currency,
          deadline: job.deadline,
          location: job.location,
          clientName: job.clientName,
          createdAt: new Date(job.createdAt),
          clientAddress: job.clientAddress,
          acceptedApplicationId: job.acceptedApplicationId,
          escrowTxHash: job.escrowTxHash,
          onchainJobId: job.onchainJobId,
          workerAddress: job.workerAddress,
        },
      });
    }

    for (const application of SEEDED_APPLICATIONS) {
      await this.prisma.application.create({
        data: {
          id: application.id,
          jobId: application.jobId,
          freelancerName: application.freelancerName,
          freelancerAddress: application.freelancerAddress,
          amount: application.amount,
          deliveryDays: application.deliveryDays,
          coverLetter: application.coverLetter,
          status: application.status,
          createdAt: new Date(application.createdAt),
        },
      });
    }

    for (const activity of SEEDED_ACTIVITY) {
      await this.prisma.jobActivity.create({
        data: {
          id: activity.id,
          type: activity.type,
          message: activity.message,
          createdAt: new Date(activity.createdAt),
          jobId: activity.jobId,
        },
      });
    }
  }

  async getState(): Promise<JobBoardState> {
    const [jobs, applications, activity] = await Promise.all([
      this.prisma.job.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.application.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.jobActivity.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);

    return {
      jobs: jobs.map((item) => this.mapJob(item)),
      applications: applications.map((item) => this.mapApplication(item)),
      activity: activity.map((item) => this.mapActivity(item)),
    };
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    const created = await this.prisma.job.create({
      data: {
        id: this.createId('job'),
        title: input.title,
        description: input.description,
        skills: input.skills,
        status: 'Open',
        paymentType: input.paymentType,
        experience: input.experience,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        currency: 'USDC',
        deadline: input.deadline,
        location: input.location,
        clientName: input.clientName,
        createdAt: new Date(),
        clientAddress: input.clientAddress ?? null,
        onchainJobId: input.onchainJobId ?? null,
      },
    });

    await this.prisma.jobActivity.create({
      data: {
        id: this.createId('activity'),
        type: 'job_posted',
        message: `${input.clientName} posted a new job: ${input.title}`,
        createdAt: new Date(),
        jobId: created.id,
      },
    });

    return this.mapJob(created);
  }

  async applyToJob(jobId: string, input: CreateApplicationInput) {
    const job = await this.getJobOrThrow(jobId);

    if (job.status !== 'Open') {
      throw new BadRequestException('Applications are only allowed for open jobs');
    }

    const created = await this.prisma.application.create({
      data: {
        id: this.createId('app'),
        jobId,
        freelancerName: input.freelancerName,
        freelancerAddress: input.freelancerAddress ?? null,
        amount: job.budgetMax,
        deliveryDays: input.deliveryDays,
        coverLetter: input.coverLetter,
        status: 'Pending',
        createdAt: new Date(),
      },
    });

    await this.prisma.jobActivity.create({
      data: {
        id: this.createId('activity'),
        type: 'job_applied',
        message: `${input.freelancerName} applied to ${job.title}`,
        createdAt: new Date(),
        jobId,
      },
    });

    return this.mapApplication(created);
  }

  async acceptApplication(jobId: string, applicationId: string, workerAddress?: string) {
    const [job, application] = await Promise.all([
      this.getJobOrThrow(jobId),
      this.getApplicationOrThrow(applicationId),
    ]);

    if (application.jobId !== jobId) {
      throw new NotFoundException('Application not found for this job');
    }

    if (job.status !== 'Open') {
      throw new BadRequestException('Only open jobs can accept applications');
    }

    await this.prisma.$transaction([
      this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'Accepted',
          acceptedApplicationId: applicationId,
          workerAddress: workerAddress ?? job.workerAddress,
        },
      }),
      this.prisma.application.updateMany({
        where: { jobId, id: applicationId },
        data: { status: 'Accepted' },
      }),
      this.prisma.application.updateMany({
        where: { jobId, NOT: { id: applicationId } },
        data: { status: 'Rejected' },
      }),
      this.prisma.jobActivity.create({
        data: {
          id: this.createId('activity'),
          type: 'application_accepted',
          message: `${job.clientName} accepted ${application.freelancerName} for ${job.title}`,
          createdAt: new Date(),
          jobId,
        },
      }),
    ]);

    return { ok: true };
  }

  async fundEscrow(jobId: string, details?: { onchainJobId?: number; txHash?: string }) {
    const job = await this.getJobOrThrow(jobId);

    if (job.status !== 'Accepted') {
      throw new BadRequestException('Only accepted jobs can be funded');
    }

    await this.prisma.$transaction([
      this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'Funded',
          escrowTxHash: details?.txHash ?? null,
          onchainJobId: details?.onchainJobId ?? job.onchainJobId ?? null,
        },
      }),
      this.prisma.jobActivity.create({
        data: {
          id: this.createId('activity'),
          type: 'escrow_funded',
          message: `Escrow funded for ${job.title}${
            details?.txHash ? ` (${details.txHash})` : ''
          }`,
          createdAt: new Date(),
          jobId,
        },
      }),
    ]);

    return { ok: true };
  }

  async markDelivered(jobId: string) {
    const job = await this.getJobOrThrow(jobId);

    if (job.status !== 'Funded') {
      throw new BadRequestException('Only funded jobs can be marked delivered');
    }

    const application = job.acceptedApplicationId
      ? await this.prisma.application.findUnique({
          where: { id: job.acceptedApplicationId },
        })
      : null;

    await this.prisma.$transaction([
      this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'Delivered' },
      }),
      this.prisma.jobActivity.create({
        data: {
          id: this.createId('activity'),
          type: 'work_delivered',
          message: `${application?.freelancerName ?? 'Freelancer'} marked work delivered`,
          createdAt: new Date(),
          jobId,
        },
      }),
    ]);

    return { ok: true };
  }

  async releasePayment(jobId: string) {
    const job = await this.getJobOrThrow(jobId);

    if (job.status !== 'Delivered') {
      throw new BadRequestException('Only delivered jobs can release payment');
    }

    await this.prisma.$transaction([
      this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'Released' },
      }),
      this.prisma.jobActivity.create({
        data: {
          id: this.createId('activity'),
          type: 'payment_released',
          message: `${job.clientName} released payment for ${job.title}`,
          createdAt: new Date(),
          jobId,
        },
      }),
    ]);

    return { ok: true };
  }
}
