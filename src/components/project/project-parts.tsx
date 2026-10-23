import "./brand-card.css";
import "./brand-kit-2.css";
import "./brand-kit-3.css";
import "./brand-kit-4.css";
import "./brand-kit.css";
import "./project.css";
import Link from "next/link";
import { projects } from "@/lib/projects";
import { CHAPTERS, type Project, type ProjectLink } from "@/lib/projects/model";
import { ProjectArt } from "./project-art";
import { ProofLine } from "./project-trust";

// A project page (Phase 5 P5.3), one screen on desktop: what it is + the
// number + the picture, then the 4 Blueprint questions, then similar
// projects. data-chapter sets the tone (project.css). Styles: .pj-*.

const LINK_LABEL: Record<ProjectLink["kind"], string> = {
  live: "Try the live demo",
  dashboard: "Open the live dashboard",
  video: "Watch the demo",
  github: "See the code on GitHub",
  article: "Read the article",
};
// The first link that lets a CEO touch the real thing becomes the button.
const PRIMARY: ProjectLink["kind"][] = ["live", "dashboard", "video", "github", "article"];

export function ProjectHero({ p }: { p: Project }) {
  const primary = PRIMARY.map((k) => p.links.find((l) => l.kind === k)).find(Boolean);
  const rest = p.links.filter((l) => l !== primary);
  return (
    <header className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <div className="flex flex-col gap-5">
        {/* No prefetch: it would download the whole shelf on every project
            page (+6 requests, over the 20 budget). */}
        <Link href="/projects" prefetch={false} className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="pj-chip rounded-full px-3 py-1 font-semibold tracking-wide uppercase">{CHAPTERS[p.chapter]}</span>
          <span className="text-muted-foreground">{p.industries.join(" · ")}</span>
        </p>
        <h1 className="text-4xl font-semibold text-balance sm:text-5xl">{p.name}</h1>
        <p className="max-w-2xl text-xl text-balance text-muted-foreground">{p.oneLine}</p>
        <p className="flex flex-col gap-1">
          <span className="pj-number text-5xl font-semibold tabular-nums sm:text-6xl">{p.number.value}</span>
          <span className="text-muted-foreground">{p.number.label}</span>
        </p>
        {p.honesty && <p className="text-sm text-muted-foreground">{p.honesty}</p>}
        {(primary || rest.length > 0) && (
          <p className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {primary && (
              <a href={primary.url} rel="noopener" target="_blank" className="pj-cta rounded-full px-5 py-2.5 font-semibold">
                {primary.label ?? LINK_LABEL[primary.kind]} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {rest.map((l) => (
              <a
                key={l.url}
                href={l.url}
                rel="noopener"
                target="_blank"
                className="font-medium text-link underline decoration-link/50 underline-offset-4 hover:decoration-link"
              >
                {l.label ?? LINK_LABEL[l.kind]} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </p>
        )}
        <ProofLine p={p} />
      </div>
      <ProjectArt picture={p.picture} priority chapter={p.chapter} folio={projects.indexOf(p) + 1} />
    </header>
  );
}

export function ProjectAnswers({ p }: { p: Project }) {
  const blocks = [
    { id: "problem", title: "The problem", text: p.problem },
    { id: "built", title: "What I built", text: p.built },
    { id: "why", title: "Tech & why", text: p.why, chips: p.tech },
    { id: "result", title: "The result", text: p.result },
  ];
  return (
    <section aria-label="The project in four answers" className="grid gap-4 md:grid-cols-2">
      {blocks.map((b, i) => (
        <article key={b.id} className="pj-answer edge-card flex flex-col gap-3 rounded-3xl p-6 sm:p-8" data-result={b.id === "result" || undefined}>
          <h2 className="flex items-baseline gap-3 text-xl font-semibold">
            <span className="pj-index text-sm tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {b.title}
          </h2>
          <p className="text-lg text-muted-foreground">{b.text}</p>
          {b.chips && (
            <ul className="mt-1 flex flex-wrap gap-2" aria-label="Tech used">
              {b.chips.map((t) => (
                <li key={t} className="pj-tech rounded-full px-3 py-1 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}

export function ProjectSource({ p }: { p: Project }) {
  if (!p.source) return null;
  return (
    <p className="text-sm text-muted-foreground">
      Data:{" "}
      <a href={p.source.url} rel="noopener" target="_blank" className="text-link underline underline-offset-4">
        {p.source.label}
      </a>{" "}
      (public dataset).
    </p>
  );
}

export function SimilarProjects({ list }: { list: readonly Project[] }) {
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="similar" className="flex flex-col gap-6">
      <h2 id="similar" className="text-2xl font-semibold sm:text-3xl">
        Similar projects
      </h2>
      <ul className="grid gap-4 md:grid-cols-3">
        {list.map((q) => (
          <li key={q.slug} data-chapter={q.chapter}>
            <Link href={`/projects/${q.slug}`} className="pj-similar edge-card flex h-full flex-col gap-2 rounded-3xl p-6">
              <span className="pj-chip self-start rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase">
                {CHAPTERS[q.chapter]}
              </span>
              <span className="text-lg font-semibold">{q.name}</span>
              <span className="text-sm text-muted-foreground">{q.oneLine}</span>
              <span className="mt-auto pt-2 font-semibold tabular-nums">
                {q.number.value} <span className="text-sm font-normal text-muted-foreground">{q.number.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
