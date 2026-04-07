import { Suspense } from "react";

import JobBoardClient from "../../src/components/jobs/JobBoardClient";

export default function JobsPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-app-gradient py-10" />}
    >
      <JobBoardClient />
    </Suspense>
  );
}
