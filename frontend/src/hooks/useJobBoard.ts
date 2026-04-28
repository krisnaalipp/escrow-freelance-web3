"use client";

import { useEffect, useMemo, useState } from "react";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const EMPTY_STATE: JobBoardState = {
  jobs: [],
  applications: [],
  activity: [],
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function useJobBoard() {
  const [state, setState] = useState<JobBoardState>(EMPTY_STATE);
  const [liveOnline, setLiveOnline] = useState(24);

  const refreshState = async () => {
    const nextState = await request<JobBoardState>("/jobs");
    setState(nextState);
    return nextState;
  };

  useEffect(() => {
    void refreshState();
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

  const postJob = async (input: NewJobInput) => {
    const createdJob = await request<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(input),
    });

    await refreshState();
    return createdJob;
  };

  const applyToJob = async (jobId: string, input: NewApplicationInput) => {
    const createdApplication = await request<Application>(
      `/jobs/${jobId}/applications`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

    await refreshState();
    return createdApplication;
  };

  const acceptApplication = async (
    jobId: string,
    applicationId: string,
    details?: { workerAddress?: string },
  ) => {
    await request(`/jobs/${jobId}/accept/${applicationId}`, {
      method: "POST",
      body: JSON.stringify(details ?? {}),
    });

    await refreshState();
    return true;
  };

  const fundEscrow = async (
    jobId: string,
    details?: { onchainJobId?: number; txHash?: string },
  ) => {
    await request(`/jobs/${jobId}/fund`, {
      method: "POST",
      body: JSON.stringify({ txHash: details?.txHash }),
    });

    await refreshState();
    return true;
  };

  const markDelivered = async (jobId: string) => {
    await request(`/jobs/${jobId}/deliver`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    await refreshState();
    return true;
  };

  const releasePayment = async (jobId: string) => {
    await request(`/jobs/${jobId}/release`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    await refreshState();
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
    refreshState,
    releasePayment,
  };
}
