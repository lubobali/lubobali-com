import { createSearch } from "@/lib/search/engine";
import { synonyms } from "@/lib/search/synonyms";
import { airflowDq } from "./airflow-dq";
import { airflowSoda } from "./airflow-soda";
import { arizonaJobs } from "./arizona-job-market";
import { awsJobStreamer } from "./aws-job-streamer";
import { bitcoinStreaming } from "./bitcoin-streaming";
import { briefMe } from "./briefme-ai";
import { citibike } from "./citibike-agent";
import { costaRica } from "./costa-rica-loan";
import { cvsContractors } from "./cvs-contractor-performance";
import { dbtWap } from "./dbt-airflow-wap";
import { deltaLakeStocks } from "./delta-lake-stocks";
import { devTrack } from "./devtrack-ai";
import { diabetesReadmissions } from "./diabetes-readmissions";
import { employeeSentiment } from "./employee-sentiment";
import { flinkSessions } from "./flink-sessions";
import { foodDelivery } from "./food-delivery-customers";
import { ibmHr } from "./ibm-hr-attrition";
import { jobRadar } from "./jobradar-ai";
import { langchainAgents } from "./langchain-agents";
import { publisher } from "./lubo-ai-publisher";
import { lubobaliCom } from "./lubobali-com";
import { marketMind } from "./marketmind-ai";
import { massSchools } from "./massachusetts-schools";
import { mergeAI } from "./mergeai";
import { mining } from "./mining-process-quality";
import { CHAPTERS, type Chapter, checkProject, kindClashes, type Project } from "./model";
import { nba } from "./nba-shooting";
import { portfolioScope } from "./portfolioscope";
import { sentinelAI } from "./sentinel-ai";
import { skyCast } from "./skycast-ai";
import { skyIndex } from "./skyindex-ai";
import { sparkTuning } from "./spark-pipeline-tuning";
import { sqlServerToPostgres } from "./sql-server-to-postgres";
import { supplyChain } from "./supply-chain-delays";
import { ticketDesk } from "./ticketdesk-ai";

// Every project; inside each chapter, in the order CEOs like most (plans
// docs/phase-5-project-list.md). The shelf shows the first 6 per chapter
// first. New project = one file + a line here.
export const projects: readonly Project[] = [
  // AI agents
  mergeAI,
  lubobaliCom,
  sentinelAI,
  langchainAgents,
  publisher,
  briefMe,
  jobRadar,
  citibike,
  marketMind,
  skyCast,
  skyIndex,
  devTrack,
  // Data pipelines
  sqlServerToPostgres,
  awsJobStreamer,
  ticketDesk,
  sparkTuning,
  dbtWap,
  bitcoinStreaming,
  airflowDq,
  deltaLakeStocks,
  airflowSoda,
  flinkSessions,
  portfolioScope,
  // Analytics & dashboards
  diabetesReadmissions,
  supplyChain,
  cvsContractors,
  employeeSentiment,
  ibmHr,
  foodDelivery,
  costaRica,
  arizonaJobs,
  mining,
  massSchools,
  nba,
];

// What search reads for a project (also used by Explore in P5.5).
export const projectSearchDoc = (p: Project) => ({
  id: p.slug,
  title: p.name,
  keywords: [...p.industries, ...p.tech, CHAPTERS[p.chapter]],
  // The big number's label too ("hospital visits analyzed"): it is the
  // first thing on every card.
  text: [p.oneLine, p.number.label, p.problem, p.built, p.why, p.result, ...Object.values(p.anatomy ?? {}), p.safe ?? ""].join(" "),
});

// Runs once, when the site builds: any broken project, duplicate slug or a
// CEO phrase that doesn't find its own project fails the build (and CI).
function verify(list: readonly Project[]) {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const p of list) {
    if (slugs.has(p.slug)) problems.push(`${p.slug}: slug used twice`);
    slugs.add(p.slug);
    problems.push(...checkProject(p).map((m) => `${p.slug}: ${m}`));
  }
  problems.push(...kindClashes(list));
  const search = createSearch(list.map(projectSearchDoc), synonyms);
  for (const p of list) {
    for (const q of p.searches) {
      const { hits, close } = search(q);
      if (close || !hits.some((h) => h.id === p.slug)) problems.push(`${p.slug}: search "${q}" does not find it`);
    }
  }
  if (problems.length) throw new Error(`Project data problems:\n- ${problems.join("\n- ")}`);
}
verify(projects);

export const findProject = (slug: string) => projects.find((p) => p.slug === slug);
export const projectsIn = (chapter: Chapter) => projects.filter((p) => p.chapter === chapter);

// "Similar projects": most shared industries + tech first, then the same
// chapter; never itself. Pure, so the page stays static.
export function similarProjects(p: Project, count = 3): Project[] {
  const shared = (q: Project) =>
    q.industries.filter((i) => p.industries.includes(i)).length * 2 +
    q.tech.filter((t) => p.tech.includes(t)).length +
    (q.chapter === p.chapter ? 1 : 0);
  return projects
    .filter((q) => q.slug !== p.slug)
    .map((q) => ({ q, score: shared(q) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ q }) => q);
}
