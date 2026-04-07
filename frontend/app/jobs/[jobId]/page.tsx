import JobDetailClient from "../../../src/components/jobs/JobDetailClient";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = await params;
  return <JobDetailClient jobId={resolvedParams.jobId} />;
}
