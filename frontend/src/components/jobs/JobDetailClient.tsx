"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useActiveRole } from "../../hooks/useActiveRole";
import { useJobBoard } from "../../hooks/useJobBoard";
import type { Job, JobStatus, NewApplicationInput } from "../../types/jobs";

type JobDetailClientProps = {
  jobId: string;
};

type ApplicationFormState = {
  freelancerName: string;
  deliveryDays: string;
  coverLetter: string;
};

const APPLICATION_FORM_DEFAULTS: ApplicationFormState = {
  freelancerName: "",
  deliveryDays: "",
  coverLetter: "",
};

const STATUS_STEPS: JobStatus[] = ["Open", "Accepted", "Funded", "Delivered", "Released"];

function formatRelativeTime(isoDate: string) {
  const now = Date.now();
  const posted = new Date(isoDate).getTime();
  const diffMinutes = Math.max(1, Math.floor((now - posted) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function budgetLabel(job: Job) {
  if (job.paymentType === "Hourly") {
    return `${job.budgetMin}-${job.budgetMax} ${job.currency}/hr`;
  }

  return `${job.budgetMin}-${job.budgetMax} ${job.currency}`;
}

export default function JobDetailClient({ jobId }: JobDetailClientProps) {
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>(
    APPLICATION_FORM_DEFAULTS,
  );

  const {
    jobs,
    applicationsByJob,
    activity,
    applyToJob,
    acceptApplication,
    fundEscrow,
    markDelivered,
    releasePayment,
  } = useJobBoard();

  const { activeRole, isClient, isFreelancer } = useActiveRole();

  const job = jobs.find((item) => item.id === jobId) ?? null;

  const applications = useMemo(() => {
    if (!job) {
      return [];
    }

    return (applicationsByJob.get(job.id) ?? []).sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [applicationsByJob, job]);

  const timeline = useMemo(() => {
    if (!job) {
      return [];
    }

    return activity
      .filter((item) => item.jobId === job.id)
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      );
  }, [activity, job]);

  const acceptedApplication = applications.find((item) => item.id === job?.acceptedApplicationId);

  const nextActionLabel =
    job?.status === "Accepted" && isClient
      ? "Fund escrow"
      : job?.status === "Funded" && isFreelancer
        ? "Mark delivered"
        : job?.status === "Delivered" && isClient
          ? "Release payment"
          : null;

  const currentStepIndex = job ? STATUS_STEPS.indexOf(job.status) : -1;

  const onSubmitApplication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!job || !isFreelancer || job.status !== "Open") {
      return;
    }

    const payload: NewApplicationInput = {
      freelancerName: applicationForm.freelancerName.trim(),
      deliveryDays: Number(applicationForm.deliveryDays),
      coverLetter: applicationForm.coverLetter.trim(),
    };

    if (
      !payload.freelancerName ||
      !payload.coverLetter ||
      Number.isNaN(payload.deliveryDays) ||
      payload.deliveryDays <= 0
    ) {
      return;
    }

    const created = applyToJob(job.id, payload);

    if (created) {
      setApplicationForm(APPLICATION_FORM_DEFAULTS);
    }
  };

  const onRunNextStep = () => {
    if (!job) {
      return;
    }

    if (job.status === "Accepted" && isClient) {
      fundEscrow(job.id);
      return;
    }

    if (job.status === "Funded" && isFreelancer) {
      markDelivered(job.id);
      return;
    }

    if (job.status === "Delivered" && isClient) {
      releasePayment(job.id);
    }
  };

  if (!job) {
    return (
      <main className="min-h-screen bg-app-gradient py-10">
        <div className="app-container">
          <div className="surface-card-strong rounded-2xl p-6">
            <p className="text-primary text-lg font-semibold">Job not found</p>
            <p className="text-secondary mt-2 text-sm">
              This job may have been removed from local demo state.
            </p>
            <Link href="/jobs" className="btn btn-secondary mt-4">
              Back to jobs board
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-gradient py-10">
      <div className="app-container space-y-6">
        <header className="surface-card-strong rounded-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Job Detail
              </p>
              <h1 className="text-primary mt-3 text-3xl font-bold">{job.title}</h1>
              <p className="text-secondary mt-3 max-w-3xl">{job.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="pill">{job.status}</span>
              <span className="pill-muted">Role: {activeRole}</span>
              <Link href="/jobs" className="btn btn-secondary">
                Back to board
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-4">
            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-lg font-semibold">Overview</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p className="text-secondary">
                  Budget: <span className="text-primary font-semibold">{budgetLabel(job)}</span>
                </p>
                <p className="text-secondary">
                  Deadline: <span className="text-primary font-semibold">{job.deadline}</span>
                </p>
                <p className="text-secondary">
                  Experience: <span className="text-primary font-semibold">{job.experience}</span>
                </p>
                <p className="text-secondary">
                  Location: <span className="text-primary font-semibold">{job.location}</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="pill-muted">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-lg font-semibold">Applications</h2>

              {job.status === "Open" && isFreelancer ? (
                <form onSubmit={onSubmitApplication} className="mt-4 grid gap-3">
                  <input
                    className="field"
                    placeholder="Your name"
                    value={applicationForm.freelancerName}
                    onChange={(event) =>
                      setApplicationForm((previous) => ({
                        ...previous,
                        freelancerName: event.target.value,
                      }))
                    }
                    required
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="field" value={budgetLabel(job)} readOnly />
                    <input
                      className="field"
                      type="number"
                      min={1}
                      placeholder="Delivery days"
                      value={applicationForm.deliveryDays}
                      onChange={(event) =>
                        setApplicationForm((previous) => ({
                          ...previous,
                          deliveryDays: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <textarea
                    className="textarea"
                    placeholder="Pitch your approach"
                    value={applicationForm.coverLetter}
                    onChange={(event) =>
                      setApplicationForm((previous) => ({
                        ...previous,
                        coverLetter: event.target.value,
                      }))
                    }
                    required
                  />

                  <button type="submit" className="btn btn-primary justify-center">
                    Apply now
                  </button>
                </form>
              ) : job.status === "Open" ? (
                <p className="text-secondary mt-4 text-sm">
                  Switch to <span className="text-primary font-semibold">Freelancer</span> role to apply.
                </p>
              ) : null}

              <div className="mt-4 space-y-2">
                {applications.slice(0, 6).map((application) => (
                  <div key={application.id} className="surface-card rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-primary text-sm font-semibold">{application.freelancerName}</p>
                      <span className="pill-muted">{application.status}</span>
                    </div>
                    <p className="text-secondary text-xs">
                      {budgetLabel(job)} • {application.deliveryDays} days • {formatRelativeTime(application.createdAt)}
                    </p>
                    <p className="text-secondary mt-1 text-xs">{application.coverLetter}</p>

                    {job.status === "Open" && isClient ? (
                      <button
                        type="button"
                        onClick={() => acceptApplication(job.id, application.id)}
                        className="btn btn-secondary mt-2 text-xs"
                      >
                        Accept application
                      </button>
                    ) : null}
                  </div>
                ))}

                {applications.length === 0 ? (
                  <p className="text-secondary text-sm">No applications yet.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-lg font-semibold">Workflow</h2>
              <div className="mt-3 grid gap-2">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = currentStepIndex >= index;

                  return (
                    <div key={step} className="surface-card flex items-center gap-2 rounded-xl px-3 py-2">
                      <span className={isDone ? "live-dot" : "h-2 w-2 rounded-full bg-slate-500"} />
                      <p className={isDone ? "text-primary text-sm font-semibold" : "text-secondary text-sm"}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>

              {acceptedApplication ? (
                <div className="surface-card mt-4 rounded-xl p-3">
                  <p className="text-primary text-sm font-semibold">Selected freelancer</p>
                  <p className="text-secondary mt-1 text-sm">{acceptedApplication.freelancerName}</p>
                  {job.escrowTxHash ? (
                    <p className="text-secondary mt-1 text-xs">Escrow tx: {job.escrowTxHash}</p>
                  ) : null}
                </div>
              ) : null}

              {nextActionLabel ? (
                <button
                  type="button"
                  onClick={onRunNextStep}
                  className="btn btn-primary mt-4 justify-center"
                >
                  {nextActionLabel}
                </button>
              ) : job.status === "Accepted" || job.status === "Delivered" ? (
                <p className="text-secondary mt-4 text-sm">
                  Switch to <span className="text-primary font-semibold">Client</span> role for this step.
                </p>
              ) : job.status === "Funded" ? (
                <p className="text-secondary mt-4 text-sm">
                  Switch to <span className="text-primary font-semibold">Freelancer</span> role for this step.
                </p>
              ) : null}
            </div>

            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-lg font-semibold">Timeline</h2>
              <div className="mt-3 space-y-2">
                {timeline.length > 0 ? (
                  timeline.map((item) => (
                    <div key={item.id} className="surface-card rounded-xl p-3">
                      <p className="text-primary text-sm">{item.message}</p>
                      <p className="text-secondary mt-1 text-xs">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm">No timeline events yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
