"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";

// The animation code is a separate chunk, fetched after the page is shown,
// so pages don't pay for it in their first load.
const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Motion settings, used INSIDE each animated component (e.g. Reveal), not
 * in the root layout: pages without animation then load no Motion code
 * at all. Phase 2 P9 measured it: Motion site-wide made the home page's
 * phone speed score swing 0.82-0.93; without it 0.91 every run.
 * Nesting is fine — the feature chunk is fetched once and shared.
 * - reducedMotion="user": if the visitor's OS asks for reduced motion,
 *   Motion turns off movement (transform/layout animations).
 * - LazyMotion (strict): components must use `m.*`, not `motion.*`;
 *   features load lazily (see loadFeatures).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
