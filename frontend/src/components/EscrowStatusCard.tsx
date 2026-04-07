type EscrowStatusCardProps = {
  milestone?: string;
  status?: "Approved" | "Pending";
  amount?: string;
  wallet?: string;
  nextMilestone?: string;
  progress?: number;
};

const STATUS_CLASS: Record<"Approved" | "Pending", string> = {
  Approved: "border-green-500/50 bg-green-500/20 text-green-300",
  Pending: "border-amber-500/50 bg-amber-500/20 text-amber-200",
};

export default function EscrowStatusCard({
  milestone = "Milestone #2",
  status = "Approved",
  amount = "1,250 USDC",
  wallet = "0x78...4b0f",
  nextMilestone = "UI integration and audit ready",
  progress = 65,
}: EscrowStatusCardProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <aside className="w-full max-w-xl">
      <div className="surface-card-strong rounded-3xl p-7 shadow-2xl">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-secondary mb-2 text-xs font-semibold tracking-[0.2em]">
              ESCROW STATUS
            </p>
            <h2 className="text-primary text-xl font-bold">{milestone}</h2>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
          >
            {status}
          </span>
        </div>

        <div className="surface-card mb-5 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-primary text-base font-semibold">Payment released</p>
              <p className="text-secondary mt-1 text-xs">{wallet}</p>
            </div>
            <p className="text-lg font-bold text-cyan-300">{amount}</p>
          </div>
        </div>

        <div className="surface-card mb-5 rounded-2xl p-5">
          <p className="text-primary text-base font-semibold">Next milestone</p>
          <p className="text-secondary mt-1 text-xs">{nextMilestone}</p>

          <div className="mt-4 h-2 w-full rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-cyan-300"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        <button type="button" className="btn btn-primary w-full justify-center">
          Release milestone
        </button>
      </div>
    </aside>
  );
}
