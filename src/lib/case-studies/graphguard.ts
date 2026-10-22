import type { CaseStudy } from "./types";

// GraphGuard-AI (Phase 4 C4), text OK'd by Lubo 2026-10-21. Every number
// is in the public repo (README + docs/findings.md, main 9caa67a), checked
// 2026-10-21: 8 findings (README still says 7), 185 test functions (README
// says 159 at Phase 4). The data is simulated and the page says so first.
export const graphguard: CaseStudy = {
  slug: "graphguard-ai",
  kind: "story",
  published: true, // Lubo 2026-10-21 (C6b); staging stays noindex + Disallow
  name: "GraphGuard-AI",
  eyebrow: "Case study · open source, built solo",
  title: "Catching money laundering by its shape",
  problem: "Laundered money hides in ordinary transfers. Looked at one at a time, nothing seems wrong.",
  promise:
    "GraphGuard ranks which accounts a bank's team should check first, with a reason for each one. A person decides; the model only sets the order.",
  description:
    "How Lubo Bali built GraphGuard-AI: catching money laundering by its shape. On 5M simulated transfers, 332 of the top 1,000 alerts are real.",
  tags: ["fraud", "money laundering", "AML", "banking", "finance", "graph", "GNN", "XGBoost", "machine learning", "ML", "PyTorch", "Polars", "Optuna", "MLflow", "data leakage", "open source"],
  ring: {
    caption: "A real ring from the data (simulated by IBM AMLworld). Every hop looks normal; the shape is the crime.",
    hops: [
      { from: "806D31C80", amount: "$14,435" },
      { from: "80D0D5F80", amount: "€12,319" },
      { from: "80EB13650", amount: "$15,471" },
      { from: "80E0555C0", amount: "$16,587" },
    ],
  },
  numbers: [
    { value: "332", label: "real cases in the top 1,000 alerts (random: about 1)" },
    { value: "76%", label: "of complete laundering rings found" },
    { value: "5M", label: "simulated bank transfers" },
  ],
  flow: {
    app: "GraphGuard-AI",
    before: {
      title: "Sort by amount",
      label: "Sorting alerts by amount",
      badge: "0 of 168 rings",
      steps: [
        { label: "Look at each transfer alone", meta: "One row at a time", pain: true },
        { label: "Flag the biggest amounts", meta: "Rings use ordinary amounts", pain: true },
        { label: "Work a noisy queue", meta: "About 1 real case in 1,000", pain: true },
      ],
    },
    after: {
      title: "Rank by shape",
      label: "Ranking by the shape money moves in",
      badge: "127 of 168 rings",
      steps: [
        { label: "Read how money moves between accounts" },
        { label: "Rank accounts by risk, with a reason" },
        { label: "332 real cases in the top 1,000" },
        { label: "A person decides" },
      ],
    },
  },
  // Bruce (Lubo's pick) is an example person; the counts are measured
  // (README: 1,000 alerts = one team's realistic daily capacity).
  queue: {
    person: "Bruce",
    title: "A day with Bruce",
    intro:
      "Bruce investigates money laundering at a bank. Bruce's team can check about 1,000 alerts a day, so the order of those alerts decides everything. (An example person; the counts are measured on the simulated data.)",
    capacity: 1000,
    random: 1,
    model: 332,
    moments: [
      {
        when: "Morning",
        title: "The queue is ranked",
        text: "Instead of the biggest amounts first, Bruce gets the accounts whose money moves in the most suspicious shapes, each with a reason.",
      },
      {
        when: "Late morning",
        title: "A ring shows up",
        text: "Four accounts, four ordinary transfers, and the money ends where it started. One transfer at a time, Bruce would never look twice. As a shape, it stands out.",
      },
      {
        when: "End of the day",
        title: "332 real cases, not 1",
        text: "Of the 1,000 alerts, 332 were real laundering. A random queue finds about 1. Bruce still decides every case; GraphGuard only chose the order.",
      },
    ],
  },
  // 8 ring types, 370 rings in the data; counts from the public
  // docs/findings.md (pattern table).
  shapes: {
    intro: "The data holds 370 laundering rings in 8 shapes. Three of them:",
    items: [
      { kind: "cycle", name: "Cycle", text: "Money leaves an account, passes through others and comes back.", count: "54 rings" },
      { kind: "fan-out", name: "Fan-out", text: "One account splits money into many ordinary transfers.", count: "48 rings" },
      {
        kind: "scatter-gather",
        name: "Scatter-gather",
        text: "Money spreads across middlemen, then gathers again in one account.",
        count: "44 rings",
      },
    ],
  },
  // README results table (validation window, the test window never opened).
  contest: {
    title: "The contest",
    intro: "Five ways to order the queue, the same data and the same test for each. How many of the 168 laundering rings each one caught:",
    total: 168,
    unit: "rings caught",
    rows: [
      { name: "Random order", value: 0 },
      { name: "Biggest amounts first", value: 0 },
      { name: "Neural network, no graph", value: 34 },
      { name: "Graph neural network", value: 60 },
      { name: "XGBoost, with graph features", value: 127, winner: true },
    ],
    note: "Every model got the same features, the same frozen data split and the same 20 tuning trials. The simpler model won, and that is the result I report.",
  },
  // README "What is next" (phases 0-8). Phase 5 has commits but is not done.
  roadmap: [
    { name: "Data, rules and models", text: "Phases 0–4: the data, the honest test bench, the baseline and the graph model.", status: "done" },
    { name: "Serving it live", text: "A live scoring service on Kubernetes, with a goal of answering in under 50 ms.", status: "now" },
    { name: "A stream of transfers", text: "Replay the simulated transfers as a live stream.", status: "later" },
    { name: "Bruce's screen", text: "The alert queue, each ring drawn, and a slider for the team's daily capacity.", status: "later" },
    { name: "Watching itself", text: "Monitoring, automatic retraining and a model card.", status: "later" },
  ],
  problems: [
    {
      problem: "The data disagreed with its own documentation",
      decision:
        "The dataset says it covers 10 days, but it runs 18, and the last 8 days are mostly laundering. Left in, any score would look great. I cut them and wrote down what that cost.",
      result: "Scores you can trust, not scores that look good.",
    },
    {
      problem: "Three features were learning the simulator, not the crime",
      decision:
        "One of them alone did 45% of the model's work, only because IBM's simulator never sends laundering by wire. I removed all three.",
      result: "I quote the lower score: 0.28, not 0.36.",
    },
    {
      problem: "The fancy graph model lost",
      decision:
        "A graph neural network against XGBoost: same features, same data split, same 20 tuning trials. XGBoost won by far. The graph itself still adds 3.3× over the same model without it.",
      result: "Reported as a finding, not tuned away.",
    },
  ],
  stats: [
    { value: "5,078,345", label: "simulated bank transfers" },
    { value: "515,080", label: "accounts" },
    { value: "370", label: "labelled laundering rings" },
    { value: "180+", label: "automated tests" },
    { value: "3", label: "leakage guards in CI" },
    { value: "8", label: "findings written down" },
    { value: "20", label: "tuning trials per model" },
    { value: "1", label: "engineer: me" },
  ],
  engineers: {
    intro: "A research-grade ML pipeline with the honesty rules turned into build failures. The decisions that matter:",
    layers: [
      { name: "Data", parts: ["IBM AMLworld · 5M transfers", "Polars", "Pandera data contracts"] },
      { name: "Rules", parts: ["Time-based split, frozen + checksummed", "3 leakage guards in pre-commit + CI"] },
      { name: "Models", parts: ["XGBoost (winner)", "GraphSAGE · PyTorch Geometric", "Optuna · 20 trials each"] },
      { name: "Tracking", parts: ["MLflow on its own Postgres", "Forgejo CI on an isolated runner"] },
    ],
    decisions: [
      "precision@k, not AUC: at a 0.1% base rate a model can score 0.99 AUC and still hand investigators a useless queue. k = how many alerts a team can work in a day.",
      "Temporal split, frozen once and checksummed. The test window has one approved load site and has never been opened.",
      "Point-in-time features: every history feature takes a time cutoff and excludes the current row. Pinned by test.",
      "The baseline was built to win: hand-built graph features and the same tuning budget as the graph model.",
      "One number, two model classes: pos_weight 1,326 is right for XGBoost and wrecked the graph model. Optuna found 6.34, an 8× gain.",
      "Pinned toolchain inside the repo and fixed seeds: reruns are byte-identical.",
    ],
  },
  role: "Solo, open source",
  when: "Built solo, 2026",
  stack: ["Python", "Polars", "XGBoost", "PyTorch Geometric", "Optuna", "MLflow"],
  shelf: { industries: ["Finance"], tech: ["Python", "Polars", "XGBoost", "PyTorch Geometric", "Optuna", "MLflow"] },
  links: [{ label: "See the code on GitHub", url: "https://github.com/lubobali/GraphGuard-AI" }],
};
