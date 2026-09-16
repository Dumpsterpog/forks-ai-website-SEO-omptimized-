import fs from "node:fs";
import path from "node:path";
const app=path.resolve(".next/server/app");
if(!fs.existsSync(app))throw new Error("Run npm run build before the SEO audit.");
const manifest=JSON.parse(fs.readFileSync(".next/routes-manifest.json","utf8"));
const redirects=new Map(manifest.redirects.map(r=>[r.source,r.destination]));
const pages=new Map();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.name.endsWith(".html")&&!entry.name.startsWith("_")){const relative=path.relative(app,p).split(path.sep).join("/").slice(0,-5);pages.set(relative==="index"?"/":"/"+relative,fs.readFileSync(p,"utf8"));}}}
walk(app);
const incoming=new Map([...pages.keys()].map(p=>[p,new Set()]));
const broken=new Map();
for(const [source,html]of pages){for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){const href=match[1];if(!href.startsWith("/")&&!href.startsWith("https://forksai.app/"))continue;if(href.startsWith("//"))continue;let dest=new URL(href,"https://forksai.app").pathname.replace(/\/$/,"")||"/";const visited=new Set();while(redirects.has(dest)){if(visited.has(dest))throw new Error("Redirect cycle at "+dest);visited.add(dest);dest=redirects.get(dest);}if(pages.has(dest)){if(dest!==source)incoming.get(dest).add(source);}else if(!dest.startsWith("/dashboard")&&!dest.startsWith("/api/")&&!fs.existsSync(path.join("public",dest.slice(1)))){if(!broken.has(dest))broken.set(dest,new Set());broken.get(dest).add(source);}}}
const orphans=[...incoming].filter(([p,s])=>p!=="/"&&s.size===0).map(([p])=>p);
console.log(JSON.stringify({pages:pages.size,broken:[...broken].map(([url,s])=>({url,sources:[...s]})),orphans,studentKitIncoming:incoming.get("/resources/student-study-kit")?.size,clipStudioIncoming:incoming.get("/clipstudio")?.size},null,2));
if(broken.size||orphans.length)process.exitCode=1;
