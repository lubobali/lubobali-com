/** Where the header's "Free AI blueprint" button goes: the tool itself.
 * Home and /blueprint have it on the page; every other page goes to the
 * home card (Lubo 2026-10-23: "it should take people to the Get your free
 * AI blueprint card"). No imports: scripts/tests/blueprint-link.test.mjs. */
export function blueprintHref(pathname: string): string {
  return pathname === "/" || pathname === "/blueprint" ? "#blueprint" : "/#blueprint";
}
