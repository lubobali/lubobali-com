import { graphguard } from "./graphguard";
import { hellopayments } from "./hellopayments";
import { lubot } from "./lubot";
import type { CaseStudy } from "./types";

// Every case study, in the order of "Selected work" (Phase 4).
export const caseStudies: readonly CaseStudy[] = [lubot, hellopayments, graphguard];

export const findCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
export const publishedCaseStudies = () => caseStudies.filter((c) => c.published);
