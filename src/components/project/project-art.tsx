import { Screen } from "@/components/case-study/screen";
import type { Chapter, ProjectPicture } from "@/lib/projects/model";
import { BrandCard } from "./brand-card";
import { GatesArt, RaceArt, RingsArt } from "./brand-charts";
import { FlowArt, FunnelArt, LoopArt, ReconcileArt, StreamArt } from "./brand-charts-flow";
import { DotsArt, KpisArt, LadderArt } from "./brand-charts-numbers";
import { ForkArt, SectorsArt, ToolboxArt, WeekArt } from "./brand-charts-agents";
import { DropsArt, MedallionArt, TallyArt } from "./brand-charts-compare";
import { ChatArt, GridArt, MatchesArt, RulesArt, SessionsArt, TimelineArt } from "./brand-charts-proof";

// The one picture of a project page. A real screen shows as itself; every
// picture drawn in code shows inside Lubo's brand card (P5.6: his Publisher
// look, the chapter's colour world, his logo and name), each project with
// its own kind of picture (Lubo: "unique for every project, easy to
// remember"). Drawn from the project's real numbers: sharp on every
// screen, readable by screen readers and bots as plain text.
export function ProjectArt({
  picture,
  priority,
  chapter,
  folio,
}: {
  picture: ProjectPicture;
  priority: boolean;
  chapter: Chapter;
  folio: number;
}) {
  if (picture.kind === "screen") {
    return (
      <Screen
        shot={{ name: picture.image, alt: picture.alt, caption: picture.caption }}
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    );
  }
  const title = "title" in picture ? picture.title : picture.caption;
  return (
    <BrandCard chapter={chapter} folio={folio} title={title} caption={picture.caption}>
      <Art picture={picture} />
    </BrandCard>
  );
}

function Art({ picture }: { picture: Exclude<ProjectPicture, { kind: "screen" }> }) {
  switch (picture.kind) {
    case "gates":
      return <GatesArt picture={picture} />;
    case "race":
      return <RaceArt picture={picture} />;
    case "rings":
      return <RingsArt picture={picture} />;
    case "loop":
      return <LoopArt picture={picture} />;
    case "funnel":
      return <FunnelArt picture={picture} />;
    case "stream":
      return <StreamArt picture={picture} />;
    case "reconcile":
      return <ReconcileArt picture={picture} />;
    case "kpis":
      return <KpisArt picture={picture} />;
    case "dots":
      return <DotsArt picture={picture} />;
    case "drops":
      return <DropsArt picture={picture} />;
    case "tally":
      return <TallyArt picture={picture} />;
    case "medallion":
      return <MedallionArt picture={picture} />;
    case "week":
      return <WeekArt picture={picture} />;
    case "toolbox":
      return <ToolboxArt picture={picture} />;
    case "fork":
      return <ForkArt picture={picture} />;
    case "sectors":
      return <SectorsArt picture={picture} />;
    case "matches":
      return <MatchesArt picture={picture} />;
    case "chat":
      return <ChatArt picture={picture} />;
    case "timeline":
      return <TimelineArt picture={picture} />;
    case "grid":
      return <GridArt picture={picture} />;
    case "rules":
      return <RulesArt picture={picture} />;
    case "sessions":
      return <SessionsArt picture={picture} />;
    case "chart":
      return <LadderArt picture={picture} />;
    case "flow":
      return <FlowArt picture={picture} />;
  }
}

// "See the real app": the real screen, large, when the top picture is drawn
// in code. Lazy: it is below the first screen.
export function RealScreen({ shot }: { shot?: { image: string; alt: string; caption: string; title?: string } }) {
  if (!shot) return null;
  return (
    <section aria-labelledby="real-app" className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h2 id="real-app" className="text-2xl font-semibold sm:text-3xl">
        {shot.title ?? "See the real app"}
      </h2>
      <Screen shot={{ name: shot.image, alt: shot.alt, caption: shot.caption }} sizes="(min-width: 1024px) 56rem, 100vw" />
    </section>
  );
}
