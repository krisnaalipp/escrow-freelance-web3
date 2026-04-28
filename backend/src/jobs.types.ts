export type JobStatus = 'Open' | 'Accepted' | 'Funded' | 'Delivered' | 'Released';
export type PaymentType = 'Fixed' | 'Hourly';
export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior';
export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';
export type ActivityType =
  | 'job_posted'
  | 'job_applied'
  | 'application_accepted'
  | 'escrow_funded'
  | 'work_delivered'
  | 'payment_released';

export type Job = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: JobStatus;
  paymentType: PaymentType;
  experience: ExperienceLevel;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;
  location: string;
  clientName: string;
  createdAt: string;
  clientAddress?: string;
  acceptedApplicationId?: string;
  escrowTxHash?: string;
  onchainJobId?: number;
  workerAddress?: string;
};

export type Application = {
  id: string;
  jobId: string;
  freelancerName: string;
  freelancerAddress?: string;
  amount: number;
  deliveryDays: number;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type JobActivity = {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  jobId: string;
};

export type JobBoardState = {
  jobs: Job[];
  applications: Application[];
  activity: JobActivity[];
};

export type CreateJobInput = {
  title: string;
  description: string;
  skills: string[];
  paymentType: PaymentType;
  experience: ExperienceLevel;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  location: string;
  clientName: string;
  clientAddress?: string;
  onchainJobId?: number;
};

export type CreateApplicationInput = {
  freelancerName: string;
  freelancerAddress?: string;
  deliveryDays: number;
  coverLetter: string;
};
