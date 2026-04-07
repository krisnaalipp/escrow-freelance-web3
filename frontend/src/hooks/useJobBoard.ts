"use client";

import { useEffect, useMemo, useState } from "react";

import { SEEDED_ACTIVITY, SEEDED_APPLICATIONS, SEEDED_JOBS } from "../data/jobs";
import type {
  Application,
  Job,
  JobActivity,
  NewApplicationInput,
  NewJobInput,
} from "../types/jobs";

type JobBoardState = {
  jobs: Job[];
  applications: Application[];
  activity: JobActivity[];
};

const STORAGE_KEY = "job-board-state-v2";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function mockTxHash() {
  return `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
}

function seedState(): JobBoardState {
  return {
    jobs: SEEDED_JOBS,
    applications: SEEDED_APPLICATIONS,
    activity: SEEDED_ACTIVITY,
  };
}

function loadInitialState(): JobBoardState {
  if (typeof window === "undefined") {
    return seedState();
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return seedState();
  }

  try {
    return JSON.parse(rawState) as JobBoardState;
  } catch {
    return seedState();
  }
}

export function useJobBoard() {
  const [state, setState] = useState<JobBoardState>(loadInitialState);
  const [liveOnline, setLiveOnline] = useState(24);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        setState(JSON.parse(event.newValue) as JobBoardState);
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveOnline((count) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(60, count + delta));
      });
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const applicationsByJob = useMemo(() => {
    const grouped = new Map<string, Application[]>();

    for (const application of state.applications) {
      const existing = grouped.get(application.jobId) ?? [];
      grouped.set(application.jobId, [...existing, application]);
    }

    return grouped;
  }, [state.applications]);

  const postJob = (input: NewJobInput) => {
    const now = new Date().toISOString();

    const newJob: Job = {
      id: createId("job"),
      title: input.title,
      description: input.description,
      skills: input.skills,
      status: "Open",
      paymentType: input.paymentType,
      experience: input.experience,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      currency: "USDC",
      deadline: input.deadline,
      location: input.location,
      clientName: input.clientName,
      createdAt: now,
    };

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "job_posted",
      message: `${input.clientName} posted a new job: ${input.title}`,
      createdAt: now,
      jobId: newJob.id,
    };

    setState((previous) => ({
      jobs: [newJob, ...previous.jobs],
      applications: previous.applications,
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return newJob;
  };

  const applyToJob = (jobId: string, input: NewApplicationInput) => {
    const job = state.jobs.find((item) => item.id === jobId);

    if (!job) {
      return null;
    }

    const now = new Date().toISOString();

    const newApplication: Application = {
      id: createId("app"),
      jobId,
      freelancerName: input.freelancerName,
      amount: job.budgetMax,
      deliveryDays: input.deliveryDays,
      coverLetter: input.coverLetter,
      status: "Pending",
      createdAt: now,
    };

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "job_applied",
      message: `${input.freelancerName} applied to ${job.title}`,
      createdAt: now,
      jobId,
    };

    setState((previous) => ({
      jobs: previous.jobs,
      applications: [newApplication, ...previous.applications],
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return newApplication;
  };

  const acceptApplication = (jobId: string, applicationId: string) => {
    const job = state.jobs.find((item) => item.id === jobId);
    const application = state.applications.find((item) => item.id === applicationId);

    if (!job || !application || job.status !== "Open") {
      return false;
    }

    const now = new Date().toISOString();

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "application_accepted",
      message: `${job.clientName} accepted ${application.freelancerName} for ${job.title}`,
      createdAt: now,
      jobId,
    };

    setState((previous) => ({
      jobs: previous.jobs.map((item) =>
        item.id === jobId
          ? { ...item, status: "Accepted", acceptedApplicationId: applicationId }
          : item,
      ),
      applications: previous.applications.map((item) => {
        if (item.jobId !== jobId) {
          return item;
        }

        if (item.id === applicationId) {
          return { ...item, status: "Accepted" };
        }

        return { ...item, status: "Rejected" };
      }),
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return true;
  };

  const fundEscrow = (jobId: string) => {
    const job = state.jobs.find((item) => item.id === jobId);

    if (!job || job.status !== "Accepted") {
      return false;
    }

    const now = new Date().toISOString();
    const txHash = mockTxHash();

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "escrow_funded",
      message: `Escrow funded for ${job.title} (${txHash})`,
      createdAt: now,
      jobId,
    };

    setState((previous) => ({
      jobs: previous.jobs.map((item) =>
        item.id === jobId ? { ...item, status: "Funded", escrowTxHash: txHash } : item,
      ),
      applications: previous.applications,
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return true;
  };

  const markDelivered = (jobId: string) => {
    const job = state.jobs.find((item) => item.id === jobId);

    if (!job || job.status !== "Funded") {
      return false;
    }

    const now = new Date().toISOString();
    const acceptedApplication = state.applications.find(
      (item) => item.id === job.acceptedApplicationId,
    );

    const actor = acceptedApplication?.freelancerName ?? "Freelancer";

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "work_delivered",
      message: `${actor} marked work delivered`,
      createdAt: now,
      jobId,
    };

    setState((previous) => ({
      jobs: previous.jobs.map((item) =>
        item.id === jobId ? { ...item, status: "Delivered" } : item,
      ),
      applications: previous.applications,
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return true;
  };

  const releasePayment = (jobId: string) => {
    const job = state.jobs.find((item) => item.id === jobId);

    if (!job || job.status !== "Delivered") {
      return false;
    }

    const now = new Date().toISOString();

    const newActivity: JobActivity = {
      id: createId("activity"),
      type: "payment_released",
      message: `${job.clientName} released payment for ${job.title}`,
      createdAt: now,
      jobId,
    };

    setState((previous) => ({
      jobs: previous.jobs.map((item) =>
        item.id === jobId ? { ...item, status: "Released" } : item,
      ),
      applications: previous.applications,
      activity: [newActivity, ...previous.activity].slice(0, 30),
    }));

    return true;
  };

  return {
    jobs: state.jobs,
    applications: state.applications,
    applicationsByJob,
    activity: state.activity,
    liveOnline,
    postJob,
    applyToJob,
    acceptApplication,
    fundEscrow,
    markDelivered,
    releasePayment,
  };
}
