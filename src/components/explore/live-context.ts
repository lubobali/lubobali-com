"use client";

import { createContext } from "react";

// Phase 7: the /building card's live dot + daily line ("Shipped today ·
// 18,957 tests"). The header (server) reads live.json at build and passes
// it to ExploreButton, which provides it here for the result tiles.
export type LiveLine = { active: boolean; line: string };
export const LiveContext = createContext<LiveLine | null>(null);
