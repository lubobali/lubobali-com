"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createSearch, type SearchDoc, type SearchResult } from "@/lib/search/engine";
import { synonyms } from "@/lib/search/synonyms";

// The site search in the browser: /search-index.json is fetched once, the
// first time the visitor touches a search box (pages stay small at 100+
// projects), then every keystroke searches locally in under a millisecond.
// No server, nothing sent anywhere. A failed fetch can be retried.
export function useSiteSearch() {
  const [docs, setDocs] = useState<readonly SearchDoc[] | null>(null);
  const loading = useRef<Promise<void> | null>(null);

  const load = useCallback(() => {
    loading.current ??= fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { docs: SearchDoc[] }) => setDocs(j.docs))
      .catch(() => {
        loading.current = null;
      });
  }, []);

  const search = useMemo(() => (docs ? createSearch(docs, synonyms) : null), [docs]);
  // null = not loaded yet (the caller shows everything meanwhile).
  const run = useCallback((q: string): SearchResult | null => (search ? search(q) : null), [search]);
  return { load, run, ready: search !== null };
}
