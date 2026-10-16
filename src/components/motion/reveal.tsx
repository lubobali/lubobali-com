"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { MotionProvider } from "./motion-provider";

/**
 * Fades + slides content in once, when it scrolls into view.
 *
 * Rules:
 * - Never wrap the hero / first screen (the LCP element): it would start
 *   invisible and delay Largest Contentful Paint.
 * - The text is still in the HTML (search + AI bots read it). Without
 *   JavaScript, the <noscript> rule in layout.tsx makes it visible.
 * - With OS "reduce motion" on, MotionProvider removes the slide.
 * - Brings its own MotionProvider, so only pages that use Reveal load Motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionProvider>
      <m.div
        data-reveal
        className={className}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </MotionProvider>
  );
}
