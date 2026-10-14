"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";

// The animation code is a separate chunk, fetched after the page is shown,
// so pages don't pay for it in their first load.
const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Site-wide motion settings.
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
