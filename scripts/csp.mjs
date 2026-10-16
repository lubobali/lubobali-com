// Strict CSP for the static export (Phase 2 P10). See scripts/lib/csp.mjs.
//   node scripts/csp.mjs inject out   -> writes a per-page <meta> policy (end of `pnpm build`)
//   node scripts/csp.mjs check out    -> CI: every page has a policy that
//                                        allows exactly its inline scripts/styles
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkPage, injectPolicy } from "./lib/csp.mjs";

const [command, out = "out"] = process.argv.slice(2);
if (command !== "inject" && command !== "check") {
  console.error("usage: csp.mjs inject|check <out_dir>");
  process.exit(2);
}
const pages = (await readdir(out, { recursive: true })).filter((f) => f.endsWith(".html")).sort();
let problems = 0;
for (const file of pages) {
  const path = join(out, file);
  const html = await readFile(path, "utf8");
  if (command === "inject") await writeFile(path, injectPolicy(html));
  else {
    for (const p of checkPage(html)) {
      console.log(`FAIL  ${file}: ${p}`);
      problems++;
    }
  }
}
if (problems) {
  console.log(`csp: ${problems} problem(s)`);
  process.exit(1);
}
console.log(`csp: ${command === "inject" ? "policy written to" : "ok,"} ${pages.length} pages`);
