"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createSearch, type SearchResult } from "./engine";
import type { SiteEntry, SiteGroup } from "./site-index";
import { synonyms } from "./synonyms";

// The site search in the browser (Explore + /projects): /search-index.json
// is fetched once, when the visitor first opens Explore or touches a
// search box (pages stay small at 100+ projects); then every keystroke
// searches locally in under a millisecond. No server, nothing sent
// anywhere. A failed fetch can be retried. `groups` = search only these
// (pass a constant: a new array each render rebuilds the search).
export function useSiteSearch(groups?: readonly SiteGroup[]) {
  const [docs, setDocs] = useState<readonly SiteEntry[] | null>(null);
  const loading = useRef<Promise<void> | null>(null);

  const load = useCallback(() => {
    loading.current ??= fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { docs: SiteEntry[] }) => setDocs(j.docs))
      .catch(() => {
        loading.current = null;
      });
  }, []);

  const index = useMemo(() => {
    if (!docs) return null;
    const list = groups ? docs.filter((d) => groups.includes(d.group)) : docs;
    return { byId: new Map(list.map((d) => [d.id, d])), search: createSearch(list, synonyms) };
  }, [docs, groups]);
  // null = not loaded yet (the caller shows its own view meanwhile).
  const run = useCallback((q: string): SearchResult | null => (index ? index.search(q) : null), [index]);
  const entry = useCallback((id: string) => index?.byId.get(id), [index]);
  return { load, run, entry, ready: index !== null };
}
