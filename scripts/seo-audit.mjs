import fs from "node:fs";
import path from "node:path";

const app = path.resolve(".next/server/app");
if (!fs.existsSync(app)) throw new Error("Run npm run build before the SEO audit.");

const manifest = JSON.parse(fs.readFileSync(".next/routes-manifest.json", "utf8"));
const redirects = new Map(manifest.redirects.map((r) => [r.source, r.destination]));
const pages = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html") && !entry.name.startsWith("_")) {
      const relative = path.relative(app, file).split(path.sep).join("/").slice(0, -5);
      pages.set(relative === "index" ? "/" : `/${relative}`, fs.readFileSync(file, "utf8"));
    }
  }
}
walk(app);

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || "";
}
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => m[0]);
}
function metaContent(html, name) {
  return tags(html, "meta").find((tag) => attr(tag, "name").toLowerCase() === name)?.match(/\bcontent="([^"]*)"/i)?.[1] || "";
}
function canonical(html) {
  return attr(tags(html, "link").find((tag) => attr(tag, "rel").toLowerCase() === "canonical") || "", "href");
}
function title(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
}

const incoming = new Map([...pages.keys()].map((page) => [page, new Set()]));
const broken = new Map();
for (const [source, html] of pages) {
  for (const anchor of tags(html, "a")) {
    const href = attr(anchor, "href");
    if ((!href.startsWith("/") && !href.startsWith("https://forksai.app/")) || href.startsWith("//")) continue;
    let destination = new URL(href, "https://forksai.app").pathname.replace(/\/$/, "") || "/";
    const visited = new Set();
    while (redirects.has(destination)) {
      if (visited.has(destination)) throw new Error(`Redirect cycle at ${destination}`);
      visited.add(destination);
      destination = redirects.get(destination);
    }
    if (pages.has(destination)) {
      if (destination !== source) incoming.get(destination).add(source);
    } else if (!destination.startsWith("/dashboard") && !destination.startsWith("/api/") && !fs.existsSync(path.join("public", destination.slice(1)))) {
      if (!broken.has(destination)) broken.set(destination, new Set());
      broken.get(destination).add(source);
    }
  }
}

const metadataIssues = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
let structuredPages = 0;

function remember(map, value, page) {
  if (!value) return;
  if (!map.has(value)) map.set(value, []);
  map.get(value).push(page);
}

for (const [page, html] of pages) {
  const pageTitle = title(html);
  const description = metaContent(html, "description");
  const pageCanonical = canonical(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const issue = [];
  if (!pageTitle) issue.push("missing title");
  if (!description) issue.push("missing meta description");
  if (!pageCanonical) issue.push("missing canonical");
  else if (pageCanonical !== `https://forksai.app${page === "/" ? "" : page}`) issue.push(`canonical points to ${pageCanonical}`);
  if (h1Count !== 1) issue.push(`${h1Count} H1 elements`);
  for (const schema of schemas) {
    try { JSON.parse(schema[1]); } catch { issue.push("invalid JSON-LD"); }
  }
  if (schemas.length) structuredPages += 1;
  if (issue.length) metadataIssues.push({ page, issues: issue });
  remember(titles, pageTitle, page);
  remember(descriptions, description, page);
  remember(canonicals, pageCanonical, page);
}

const duplicates = (map) => [...map].filter(([, found]) => found.length > 1).map(([value, found]) => ({ value, pages: found }));
const duplicateTitles = duplicates(titles);
const duplicateDescriptions = duplicates(descriptions);
const duplicateCanonicals = duplicates(canonicals);
const orphans = [...incoming].filter(([page, sources]) => page !== "/" && sources.size === 0).map(([page]) => page);
const lowIncoming = [...incoming].filter(([page, sources]) => page !== "/" && sources.size < 3).map(([page, sources]) => ({ page, links: sources.size }));

const report = {
  pages: pages.size,
  structuredPages,
  broken: [...broken].map(([url, sources]) => ({ url, sources: [...sources] })),
  orphans,
  metadataIssues,
  duplicateTitles,
  duplicateDescriptions,
  duplicateCanonicals,
  lowIncoming,
  keyPageIncoming: Object.fromEntries(["/tools", "/resources/student-study-kit", "/gpa-calculator", "/pomodoro-timer", "/study-planner"].map((page) => [page, incoming.get(page)?.size || 0])),
};
console.log(JSON.stringify(report, null, 2));

if (broken.size || orphans.length || metadataIssues.length || duplicateTitles.length || duplicateDescriptions.length || duplicateCanonicals.length) process.exitCode = 1;
