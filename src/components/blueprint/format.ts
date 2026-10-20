import type { Power } from "./types";

// Small, pure helpers for the blueprint card. Plain words, no jargon.

/** 360 -> "6 h", 90 -> "1.5 h", 35 -> "35 min". */
export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 2) / 2; // nearest half hour
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} h`;
}

/** What each player's power means, in a few words. */
export const POWER: Record<Power, string> = {
  decides: "decides",
  approves: "approves",
  does: "does the work",
  uses: "uses it",
  informed: "kept in the loop",
};

/** "Office manager" -> "OM", "Owner" -> "O". */
export function initials(role: string): string {
  const words = role.replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Readiness reasons that start with "✓" are things already in good shape. */
export function splitReason(reason: string): { good: boolean; text: string } {
  return reason.startsWith("✓") ? { good: true, text: reason.slice(1).trim() } : { good: false, text: reason };
}

/** A kind word under the readiness number. Mirror of readiness_label in
 *  blueprint-api/blueprint/rules.py (same lines: below 50 the timeline
 *  starts with a cleanup week). */
export function readinessLabel(score: number): string {
  if (score < 50) return "Early, and that's normal: week 1 cleans up your data";
  if (score < 75) return "Good start: a few small fixes along the way";
  return "Ready: your data is in good shape";
}
