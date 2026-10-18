import type { LogoKey } from "@/components/home/tech-logos";
import { work } from "@/lib/work";

// "Built with" wheel (Phase 3 H8, Lubo): 13 tools, each linked to the
// project card it was used in (#id on Selected work). Only real usage:
// Kubernetes is NOT here (GraphGuard's k3s serving is still "next" in its
// README); Polars is (GraphGuard stack). Order = around the wheel, mixed
// so colours and projects alternate. Names also go to JSON-LD knowsAbout.

type Project = (typeof work)[number]["id"];

export const tech: readonly { name: string; logo: LogoKey; project: Project }[] = [
  { name: "Claude", logo: "claude", project: "lubot" },
  { name: "Python", logo: "python", project: "graphguard-ai" },
  { name: "AWS", logo: "aws", project: "lubot" },
  { name: "PostgreSQL", logo: "postgresql", project: "hellopayments" },
  { name: "NVIDIA", logo: "nvidia", project: "lubot" },
  { name: "PyTorch", logo: "pytorch", project: "graphguard-ai" },
  { name: "Neon", logo: "neon", project: "lubot" },
  { name: "FastAPI", logo: "fastapi", project: "hellopayments" },
  { name: "Model Context Protocol", logo: "mcp", project: "lubot" },
  { name: "Polars", logo: "polars", project: "graphguard-ai" },
  { name: "React", logo: "react", project: "lubot" },
  { name: "Next.js", logo: "nextjs", project: "hellopayments" },
  { name: "Docker", logo: "docker", project: "lubot" },
];

export const projectName = (id: Project) => work.find((w) => w.id === id)!.name;
