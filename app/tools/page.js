import StudentToolsHubContent from "@/components/StudentToolsHubContent";
import { TOOLS, SITE_URL, jsonLdHtml } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Free Tools for Students | FORKSAI" },
  description:
    "Four free student tools that run in your browser: an attendance calculator, a final grade calculator, a CGPA to percentage converter, and a text to flashcards converter.",
  alternates: {
    canonical: "https://forksai.app/tools",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Free Tools for Students | FORKSAI",
    description:
      "Attendance, final grade, CGPA conversion and text to flashcards. No account, no limits, nothing sent anywhere.",
    url: "https://forksai.app/tools",
  },
};

// A CollectionPage listing the four tools, so the hub is legible to crawlers
// as the parent of the set rather than a fifth unrelated page.
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free tools for students",
  description:
    "Free browser-based calculators and converters for students: attendance, final grade, CGPA to percentage, and text to flashcards.",
  url: `${SITE_URL}/tools`,
  isPartOf: { "@type": "WebSite", name: "FORKSAI", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      description: tool.blurb,
      url: `${SITE_URL}${tool.href}`,
    })),
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Free tools", item: `${SITE_URL}/tools` },
  ],
};

export default function Page() {
  return (
    <>
      {[collectionSchema, breadcrumbSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
        />
      ))}
      <StudentToolsHubContent />
    </>
  );
}
