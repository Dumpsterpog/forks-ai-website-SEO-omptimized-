import Link from "next/link";
import { TOOL_GROUPS } from "@/app/tools/toolGroups";

// Every free tool, listed in the footer. Grouped the way /tools groups them so
// a reader scans four short lists instead of one run of two dozen links, and
// read straight out of TOOL_GROUPS so a new tool reaches every footer without
// its name being typed again.
//
// Two skins, because the site has two footer designs: "ink" for the black
// footers (landing page, blog, tool pages) and "slate" for the dark feature
// page footers, which run smaller and quieter.
const SKINS = {
  ink: {
    wrap: "pt-10 pb-10 border-b border-white/10",
    label: "text-xs font-bold text-white/50 uppercase tracking-widest",
    hub: "text-xs text-white/40 hover:text-white transition-colors no-underline shrink-0",
    grid: "columns-2 lg:columns-4 gap-x-6 mt-6",
    group: "text-[11px] font-bold text-white/35 uppercase tracking-widest mb-3",
    link: "block text-[13px] sm:text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline",
  },
  slate: {
    wrap: "max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5",
    label: "text-zinc-600 uppercase tracking-widest text-[10px]",
    hub: "text-[11px] text-zinc-500 hover:text-white transition-colors shrink-0",
    grid: "columns-2 md:columns-4 gap-x-6 mt-4 text-[12px]",
    group: "text-zinc-600 uppercase tracking-widest text-[10px] mb-3",
    link: "block text-zinc-500 hover:text-white transition-colors mb-2",
  },
};

// prefetch={false} on every link: a footer that fetched two dozen routes the
// moment it scrolled into view would cost more than the links are worth.
export default function FooterFreeTools({
  skin = "ink",
  label = "Free tools",
  groups = TOOL_GROUPS,
}) {
  const s = SKINS[skin];

  return (
    <div className={s.wrap}>
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <div className={s.label}>{label}</div>
        <Link href="/tools" prefetch={false} className={s.hub}>
          See all free tools
        </Link>
      </div>
      <div className={s.grid}>
        {groups.map((group) => (
          <div key={group.id} className="break-inside-avoid mb-7">
            <div className={s.group}>{group.title}</div>
            {group.tools.map((tool) => (
              <Link key={tool.href} href={tool.href} prefetch={false} className={s.link}>
                {tool.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
