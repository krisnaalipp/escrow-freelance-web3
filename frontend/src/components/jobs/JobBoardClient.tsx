"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useActiveRole } from "../../hooks/useActiveRole";
import { useJobBoard } from "../../hooks/useJobBoard";
import type {
  ExperienceLevel,
  Job,
  JobStatus,
  NewApplicationInput,
  NewJobInput,
  PaymentType,
} from "../../types/jobs";

type JobBoardClientProps = {
  initialJobId?: string;
};

type JobFormState = {
  title: string;
  description: string;
  skills: string;
  paymentType: PaymentType;
  experience: ExperienceLevel;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  location: string;
  clientName: string;
};

type ApplicationFormState = {
  freelancerName: string;
  deliveryDays: string;
  coverLetter: string;
};

const JOB_FORM_DEFAULTS: JobFormState = {
  title: "",
  description: "",
  skills: "",
  paymentType: "Fixed",
  experience: "Mid",
  budgetMin: "",
  budgetMax: "",
  deadline: "",
  location: "Remote",
  clientName: "",
};

const APPLICATION_FORM_DEFAULTS: ApplicationFormState = {
  freelancerName: "",
  deliveryDays: "",
  coverLetter: "",
};

const STATUS_FILTERS: Array<JobStatus | "All"> = [
  "All",
  "Open",
  "Accepted",
  "Funded",
  "Delivered",
  "Released",
];

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

export default function JobBoardClient({ initialJobId }: JobBoardClientProps) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId ?? null);

  const [jobForm, setJobForm] = useState<JobFormState>(JOB_FORM_DEFAULTS);
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>(
    APPLICATION_FORM_DEFAULTS,
  );

  const {
    jobs,
    applicationsByJob,
    activity,
    liveOnline,
    postJob,
    applyToJob,
    acceptApplication,
    fundEscrow,
    markDelivered,
    releasePayment,
  } = useJobBoard();
  const { activeRole, isClient, isFreelancer } = useActiveRole();

  const isComposeModeFromUrl = searchParams.get("compose") === "1";

  const filteredJobs = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "All" || job.status === statusFilter;
      const matchesSearch =
        loweredSearch.length === 0 ||
        job.title.toLowerCase().includes(loweredSearch) ||
        job.description.toLowerCase().includes(loweredSearch) ||
        job.skills.some((skill) => skill.toLowerCase().includes(loweredSearch));

      return matchesStatus && matchesSearch;
    });
  }, [jobs, search, statusFilter]);

  const selectedJob =
    jobs.find((job) => job.id === selectedJobId) ?? filteredJobs[0] ?? jobs[0] ?? null;

  const selectedApplications = selectedJob
    ? (applicationsByJob.get(selectedJob.id) ?? []).sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      )
    : [];

  const selectedActivity = selectedJob
    ? activity
        .filter((item) => item.jobId === selectedJob.id)
        .sort(
          (first, second) =>
            new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
        )
    : [];

  const acceptedApplication = selectedApplications.find(
    (item) => item.id === selectedJob?.acceptedApplicationId,
  );

  const onSubmitJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isClient) {
      return;
    }

    const skills = jobForm.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload: NewJobInput = {
      title: jobForm.title.trim(),
      description: jobForm.description.trim(),
      skills,
      paymentType: jobForm.paymentType,
      experience: jobForm.experience,
      budgetMin: Number(jobForm.budgetMin),
      budgetMax: Number(jobForm.budgetMax),
      deadline: jobForm.deadline,
      location: jobForm.location.trim(),
      clientName: jobForm.clientName.trim(),
    };

    if (
      !payload.title ||
      !payload.description ||
      payload.skills.length === 0 ||
      !payload.clientName ||
      Number.isNaN(payload.budgetMin) ||
      Number.isNaN(payload.budgetMax) ||
      payload.budgetMin <= 0 ||
      payload.budgetMax < payload.budgetMin
    ) {
      return;
    }

    const createdJob = postJob(payload);
    setSelectedJobId(createdJob.id);
    setJobForm(JOB_FORM_DEFAULTS);
    setShowComposer(false);
  };

  const onSubmitApplication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFreelancer || !selectedJob || selectedJob.status !== "Open") {
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

    const created = applyToJob(selectedJob.id, payload);

    if (created) {
      setApplicationForm(APPLICATION_FORM_DEFAULTS);
    }
  };

  const onRunNextStep = () => {
    if (!selectedJob) {
      return;
    }

    if (selectedJob.status === "Accepted") {
      if (!isClient) {
        return;
      }
      fundEscrow(selectedJob.id);
      return;
    }

    if (selectedJob.status === "Funded") {
      if (!isFreelancer) {
        return;
      }
      markDelivered(selectedJob.id);
      return;
    }

    if (selectedJob.status === "Delivered") {
      if (!isClient) {
        return;
      }
      releasePayment(selectedJob.id);
    }
  };

  const nextActionLabel =
    selectedJob?.status === "Accepted" && isClient
      ? "Fund escrow"
      : selectedJob?.status === "Funded" && isFreelancer
        ? "Mark delivered"
        : selectedJob?.status === "Delivered" && isClient
          ? "Release payment"
          : null;

  const currentStepIndex = selectedJob ? STATUS_STEPS.indexOf(selectedJob.status) : -1;

  return (
    <main className="min-h-screen bg-app-gradient py-10">
      <div className="app-container space-y-8">
        <header className="surface-card-strong rounded-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Portfolio Mode
              </p>
              <h1 className="text-primary mt-3 text-3xl font-bold md:text-4xl">
                Web3 Jobs Board
              </h1>
              <p className="text-secondary mt-3 max-w-2xl">
                Demo full hiring flow: post a job, apply, accept candidate, fund escrow,
                deliver work, and release payment.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1">
                <span className="text-secondary text-xs uppercase tracking-widest">Active role</span>
                <span className="text-primary text-sm font-semibold">{activeRole}</span>
              </div>
            </div>

            <div className="surface-card rounded-xl px-4 py-3">
              <p className="text-secondary text-xs uppercase tracking-widest">Live now</p>
              <p className="text-primary mt-1 flex items-center gap-2 text-sm font-semibold">
                <span className="live-dot" />
                {liveOnline} freelancers browsing
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="surface-card rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap gap-3">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, stack, or keyword"
                  className="field min-w-[240px] flex-1"
                />

                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? "chip chip-active" : "chip"}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const applicationCount = applicationsByJob.get(job.id)?.length ?? 0;
                const isActive = selectedJob?.id === job.id;

                return (
                  <article
                    key={job.id}
                    className={`surface-card rounded-2xl p-5 ${
                      isActive ? "ring-1 ring-cyan-400/70" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-secondary text-xs uppercase tracking-widest">
                          {job.clientName}
                        </p>
                        <h2 className="text-primary mt-1 text-xl font-semibold">{job.title}</h2>
                      </div>

                      <span className="pill">{job.status}</span>
                    </div>

                    <p className="text-secondary mt-3 text-sm">{job.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="pill-muted">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-primary font-semibold">{budgetLabel(job)}</p>
                      <p className="text-secondary">{applicationCount} applications</p>
                      <p className="text-secondary">posted {formatRelativeTime(job.createdAt)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className="btn btn-secondary"
                      >
                        View details
                      </button>
                      <Link href={`/jobs/${job.id}`} className="btn btn-secondary">
                        Open route
                      </Link>
                    </div>
                  </article>
                );
              })}

              {filteredJobs.length === 0 ? (
                <div className="surface-card rounded-2xl p-5">
                  <p className="text-primary font-semibold">No jobs match your filter yet.</p>
                  <p className="text-secondary mt-2 text-sm">
                    Try a broader search or post a new role.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card-strong rounded-2xl p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-primary text-xl font-semibold">Post a job</h2>
                <button
                  type="button"
                  onClick={() => setShowComposer((open) => !open)}
                  className="btn btn-secondary text-sm"
                  disabled={!isClient}
                >
                  {showComposer || isComposeModeFromUrl ? "Hide" : "Open form"}
                </button>
              </div>

              {!isClient ? (
                <p className="text-secondary text-sm">
                  Switch to <span className="text-primary font-semibold">Client</span> role to post jobs.
                </p>
              ) : showComposer || isComposeModeFromUrl ? (
                <form onSubmit={onSubmitJob} className="grid gap-3">
                  <input
                    className="field"
                    placeholder="Job title"
                    value={jobForm.title}
                    onChange={(event) =>
                      setJobForm((previous) => ({ ...previous, title: event.target.value }))
                    }
                    required
                  />

                  <textarea
                    className="textarea"
                    placeholder="Scope, deliverables, and success criteria"
                    value={jobForm.description}
                    onChange={(event) =>
                      setJobForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    required
                  />

                  <input
                    className="field"
                    placeholder="Skills (comma separated)"
                    value={jobForm.skills}
                    onChange={(event) =>
                      setJobForm((previous) => ({ ...previous, skills: event.target.value }))
                    }
                    required
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      className="field"
                      value={jobForm.paymentType}
                      onChange={(event) =>
                        setJobForm((previous) => ({
                          ...previous,
                          paymentType: event.target.value as PaymentType,
                        }))
                      }
                    >
                      <option>Fixed</option>
                      <option>Hourly</option>
                    </select>

                    <select
                      className="field"
                      value={jobForm.experience}
                      onChange={(event) =>
                        setJobForm((previous) => ({
                          ...previous,
                          experience: event.target.value as ExperienceLevel,
                        }))
                      }
                    >
                      <option>Junior</option>
                      <option>Mid</option>
                      <option>Senior</option>
                    </select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="field"
                      type="number"
                      min={1}
                      placeholder="Budget min"
                      value={jobForm.budgetMin}
                      onChange={(event) =>
                        setJobForm((previous) => ({ ...previous, budgetMin: event.target.value }))
                      }
                      required
                    />
                    <input
                      className="field"
                      type="number"
                      min={1}
                      placeholder="Budget max"
                      value={jobForm.budgetMax}
                      onChange={(event) =>
                        setJobForm((previous) => ({ ...previous, budgetMax: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="field"
                      type="date"
                      value={jobForm.deadline}
                      onChange={(event) =>
                        setJobForm((previous) => ({ ...previous, deadline: event.target.value }))
                      }
                      required
                    />
                    <input
                      className="field"
                      placeholder="Location"
                      value={jobForm.location}
                      onChange={(event) =>
                        setJobForm((previous) => ({ ...previous, location: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <input
                    className="field"
                    placeholder="Client / Team name"
                    value={jobForm.clientName}
                    onChange={(event) =>
                      setJobForm((previous) => ({ ...previous, clientName: event.target.value }))
                    }
                    required
                  />

                  <button type="submit" className="btn btn-primary justify-center">
                    Post job live
                  </button>
                </form>
              ) : (
                <p className="text-secondary text-sm">
                  Open the form to publish a new role. Fresh jobs appear instantly on the board.
                </p>
              )}
            </div>

            <div className="surface-card rounded-2xl p-5 lg:sticky lg:top-24">
              <h2 className="text-primary text-xl font-semibold">Selected job</h2>
              {selectedJob ? (
                <>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-primary text-lg font-semibold">{selectedJob.title}</p>
                      <p className="text-secondary mt-1 text-sm">{selectedJob.description}</p>
                    </div>
                    <span className="pill">{selectedJob.status}</span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                    <p className="text-secondary">
                      Budget: <span className="text-primary font-semibold">{budgetLabel(selectedJob)}</span>
                    </p>
                    <p className="text-secondary">
                      Deadline: <span className="text-primary font-semibold">{selectedJob.deadline}</span>
                    </p>
                    <p className="text-secondary">
                      Experience: <span className="text-primary font-semibold">{selectedJob.experience}</span>
                    </p>
                    <p className="text-secondary">
                      Location: <span className="text-primary font-semibold">{selectedJob.location}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <span key={skill} className="pill-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-secondary mt-3 text-sm">Select a job to see details and apply.</p>
              )}
            </div>

            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-xl font-semibold">Workflow actions</h2>
              {selectedJob ? (
                <>
                  <div className="mt-3 space-y-2">
                    <p className="text-primary text-sm font-semibold">Status tracker</p>
                    <div className="grid gap-2">
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
                  </div>

                  {acceptedApplication ? (
                    <div className="surface-card mt-4 rounded-xl p-3">
                      <p className="text-primary text-sm font-semibold">Selected freelancer</p>
                      <p className="text-secondary mt-1 text-sm">{acceptedApplication.freelancerName}</p>
                      {selectedJob.escrowTxHash ? (
                        <p className="text-secondary mt-1 text-xs">
                          Escrow tx: {selectedJob.escrowTxHash}
                        </p>
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
                  ) : selectedJob.status === "Accepted" || selectedJob.status === "Delivered" ? (
                    <p className="text-secondary mt-4 text-sm">
                      Switch to <span className="text-primary font-semibold">Client</span> role for this step.
                    </p>
                  ) : selectedJob.status === "Funded" ? (
                    <p className="text-secondary mt-4 text-sm">
                      Switch to <span className="text-primary font-semibold">Freelancer</span> role for this step.
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-xl font-semibold">Applications</h2>
              {selectedJob ? (
                <>
                  {selectedJob.status === "Open" && isFreelancer ? (
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
                        <input className="field" value={budgetLabel(selectedJob)} readOnly />
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
                  ) : selectedJob.status === "Open" ? (
                    <p className="text-secondary mt-4 text-sm">
                      Switch to <span className="text-primary font-semibold">Freelancer</span> role to apply.
                    </p>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    {selectedApplications.slice(0, 4).map((application) => (
                      <div key={application.id} className="surface-card rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-primary text-sm font-semibold">
                            {application.freelancerName}
                          </p>
                          <span className="pill-muted">{application.status}</span>
                        </div>
                        <p className="text-secondary text-xs">
                          {budgetLabel(selectedJob)} • {application.deliveryDays} days •{" "}
                          {formatRelativeTime(application.createdAt)}
                        </p>
                        <p className="text-secondary mt-1 text-xs">{application.coverLetter}</p>

                        {selectedJob.status === "Open" && isClient ? (
                          <button
                            type="button"
                            onClick={() => acceptApplication(selectedJob.id, application.id)}
                            className="btn btn-secondary mt-2 text-xs"
                          >
                            Accept application
                          </button>
                        ) : null}
                      </div>
                    ))}

                    {selectedApplications.length === 0 ? (
                      <p className="text-secondary text-sm">No applications yet.</p>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-secondary mt-3 text-sm">Select a job to see applications.</p>
              )}
            </div>

            <div className="surface-card rounded-2xl p-5">
              <h2 className="text-primary text-lg font-semibold">Job timeline</h2>
              <div className="mt-3 space-y-2">
                {selectedActivity.length > 0 ? (
                  selectedActivity.map((item) => (
                    <div key={item.id} className="surface-card rounded-xl p-3">
                      <p className="text-primary text-sm">{item.message}</p>
                      <p className="text-secondary mt-1 text-xs">
                        {formatRelativeTime(item.createdAt)}
                      </p>
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
