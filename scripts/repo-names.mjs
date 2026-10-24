// Prints {"<repo, lower case>": {name, what, slug}} for every project on
// this site that links its GitHub repo. The daily /building job (private)
// runs this from the checkout it builds: a repo is named on /building only
// if Lubo put it on the site, so the site stays the one approved list.
//   node scripts/repo-names.mjs > repo-names.json
import "./lib/ts-paths.mjs";

const { projects } = await import("../src/lib/projects/index.ts");

const map = {};
for (const p of projects) {
  const repo = p.links.find((l) => l.kind === "github")?.url.match(/github\.com\/lubobali\/([^/#?]+)/)?.[1];
  if (repo) map[repo.toLowerCase()] = { name: p.name, what: p.oneLine, slug: p.slug };
}
process.stdout.write(`${JSON.stringify(map, null, 1)}\n`);
