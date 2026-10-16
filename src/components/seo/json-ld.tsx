import type { Graph } from "schema-dts";

// Inline JSON-LD. "<" is escaped so no value can close the <script> early
// (e.g. "</script>"). It is data, not code: CSP script-src does not apply.
export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
