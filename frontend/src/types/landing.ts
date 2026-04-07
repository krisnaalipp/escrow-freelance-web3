export type Stat = {
  label: string;
  value: string;
};

export type Feature = {
  title: string;
  description: string;
};

export type WorkflowStep = {
  title: string;
  description: string;
};

export type WorkflowRole = {
  id: string;
  label: string;
  steps: WorkflowStep[];
};

export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  fee: string;
  cta: string;
  highlights: string[];
  featured?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};
