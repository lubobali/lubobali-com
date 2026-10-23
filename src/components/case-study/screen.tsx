import "./case-study.css";
import "./story.css";
import { Picture } from "@/components/picture";
import type { Shot } from "@/lib/case-studies/types";

// A real product screen in a "luxury" frame (Phase 4, Lubo: "as luxury as
// possible"): dark glass, a thin light line on top, a soft blue glow, and
// an honest caption (real screen, demo data). Styles: case-study.css.
export function Screen({ shot, sizes, priority = false }: { shot: Shot; sizes: string; priority?: boolean }) {
  return (
    <figure className="cs-screen flex flex-col gap-3">
      <div className="cs-screen-frame overflow-hidden rounded-2xl">
        <Picture name={shot.name} alt={shot.alt} sizes={sizes} priority={priority} className="block h-auto w-full" />
      </div>
      <figcaption className="cs-screen-caption text-xs tracking-wide">{shot.caption}</figcaption>
    </figure>
  );
}
