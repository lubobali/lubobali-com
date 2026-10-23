// The resume PDF (Phase 6, P6.5): the HTML that goes into the PDF, and a hash
// of everything the PDF is made from. Used by scripts/brand/resume-pdf.mjs
// (renders public/lubo-bali-resume.pdf) and scripts/tests/resume.test.mjs
// (fails when the PDF is missing or stale). resume.ts has no imports, so
// Node loads it directly.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Only in the PDF, never in the web pages (Lubo 2026-10-22). */
export const PHONE = "312-358-0008";

export const PDF_PATH = "public/lubo-bali-resume.pdf";
export const MANIFEST_PATH = "scripts/brand/resume.manifest.json";
const TEMPLATE = "scripts/brand/resume.html";

export async function loadResume(repo) {
  return import(pathToFileURL(join(repo, "src/lib/resume.ts")).href);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const link = (l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`;
const list = (items) => `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

/** The resume body: one column, plain headings, real text (ATS-safe). */
export function resumeHtml(r, phone = PHONE) {
  const contact = [link({ label: phone, url: `tel:+1${phone.replace(/\D/g, "")}` }), link({ label: r.email, url: `mailto:${r.email}` }), esc(r.location), esc(r.citizenship), ...r.links.map(link)];
  const job = (j) =>
    `<section class="item"><div class="row"><h3>${esc(j.company)}</h3></div>` +
    `<div class="row"><p class="role">${esc(j.title)}</p><p class="dates">${esc(j.dates)}</p></div>` +
    list(j.bullets) +
    `<p class="stack">Tech stack: ${esc(j.stack)}</p></section>`;
  const project = (p) =>
    `<section class="item"><div class="row"><h3>${esc(p.name)} <span class="kind">- ${esc(p.kind)}</span></h3></div>` +
    list([p.bullet]) +
    `<p class="stack">Tech stack: ${esc(p.stack)} | ${p.links.map(link).join(" | ")}</p></section>`;
  return [
    `<header><img class="logo" src="../../public/brand/lb-logo-lg.webp" alt=""><h1>${esc(r.name)}</h1><p class="title">${esc(r.title)}</p><p class="contact">${contact.join(" | ")}</p></header>`,
    `<h2>Summary</h2>${list(r.summary)}`,
    `<h2>Work Experience</h2>${r.jobs.map(job).join("")}`,
    `<h2>Technical Skills</h2><ul class="skills">${r.skills.map((s) => `<li><b>${esc(s.label)}:</b> ${esc(s.items)}</li>`).join("")}</ul>`,
    `<h2>Education</h2>${r.education
      .map((e) => `<div class="row edu"><p><b>${esc(e.degree)}</b><br>${esc(e.school)}${e.verify ? ` | Verified: ${e.verify.map(link).join(" | ")}` : ""}</p><p class="dates">${esc(e.dates)}</p></div>`)
      .join("")}`,
    `<h2>Projects</h2>${r.projects.map(project).join("")}`,
    `<p class="more">More projects: ${r.more.map(link).join(" | ")}</p>`,
  ].join("");
}

/** Changes whenever anything in the PDF changes (data, look, phone, script). */
export async function resumeHash(repo) {
  const { resume } = await loadResume(repo);
  const files = await Promise.all([TEMPLATE, "scripts/lib/resume.mjs", "scripts/brand/resume-pdf.mjs"].map((f) => readFile(join(repo, f), "utf8")));
  return createHash("sha256").update(JSON.stringify(resume)).update(PHONE).update(files.join("\n")).digest("hex").slice(0, 16);
}
