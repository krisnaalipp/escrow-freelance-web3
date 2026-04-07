import type {
  FaqItem,
  Feature,
  PricingPlan,
  Stat,
  WorkflowRole,
} from "../types/landing";

export const HERO_STATS: Stat[] = [
  { value: "$100M+", label: "Escrows secured" },
  { value: "1,260", label: "Jobs completed" },
  { value: "3.5h", label: "Avg. payout time" },
  { value: "0.8%", label: "Dispute rate" },
];

export const FEATURES: Feature[] = [
  {
    title: "On-chain escrow",
    description:
      "Funds are locked in a smart contract until milestones are approved.",
  },
  {
    title: "Dispute flow",
    description:
      "Clear arbitration steps with evidence uploads and transparent outcomes.",
  },
  {
    title: "Reputation scoring",
    description:
      "On-chain history powers trust scores for both clients and freelancers.",
  },
  {
    title: "Milestone payouts",
    description:
      "Release payments per deliverable with flexible schedules.",
  },
  {
    title: "Wallet native",
    description:
      "Sign in with a wallet and start hiring without password friction.",
  },
  {
    title: "Global payments",
    description: "Settle in stablecoins for low fees and instant finality.",
  },
];

export const WORKFLOW_ROLES: WorkflowRole[] = [
  {
    id: "freelancer",
    label: "Freelancer",
    steps: [
      {
        title: "Create a profile",
        description: "Showcase past Web3 work, skills, and wallet history.",
      },
      {
        title: "Apply to jobs",
        description:
          "Send applications that include milestones and delivery dates.",
      },
      {
        title: "Deliver and get paid",
        description:
          "Submit work, get approval, and receive escrow instantly.",
      },
    ],
  },
  {
    id: "client",
    label: "Client",
    steps: [
      {
        title: "Post scoped work",
        description:
          "Define milestone outcomes, budget, and timelines with clear acceptance criteria.",
      },
      {
        title: "Fund escrow",
        description:
          "Deposit stablecoins once and release only when each milestone is approved.",
      },
      {
        title: "Close with confidence",
        description:
          "Use transparent history, ratings, and optional dispute flow when needed.",
      },
    ],
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "For small freelance projects getting started with escrow.",
    price: "$0 / month",
    fee: "1.5% escrow fee",
    cta: "Start free",
    highlights: [
      "Up to 3 active escrows",
      "Milestone release flow",
      "Wallet login",
    ],
  },
  {
    name: "Pro",
    description: "For teams running multiple contributors and milestone tracks.",
    price: "$49 / month",
    fee: "0.9% escrow fee",
    cta: "Upgrade to Pro",
    highlights: [
      "Unlimited active escrows",
      "Priority dispute handling",
      "Advanced payout reporting",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For studios and DAOs with custom compliance or treasury needs.",
    price: "Custom",
    fee: "Custom fee schedule",
    cta: "Contact sales",
    highlights: [
      "Dedicated success partner",
      "Custom approvals and controls",
      "Private deployment support",
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does escrow release work?",
    answer:
      "Funds are deposited upfront and released per milestone after approval. Releases are recorded on-chain for both parties.",
  },
  {
    question: "What happens if there is a dispute?",
    answer:
      "Either side can open a dispute with evidence. The case follows a transparent review process with a clear outcome path.",
  },
  {
    question: "Which wallets and networks are supported?",
    answer:
      "The UI is wallet-native and designed for EVM-compatible networks. You can connect common browser wallets and sign transactions.",
  },
  {
    question: "Can I use this for recurring teams, not one-off jobs?",
    answer:
      "Yes. Teams can manage ongoing projects with repeated milestones, role history, and payout tracking in one workspace.",
  },
];
