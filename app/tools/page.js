import StudentToolsHubContent from "@/components/StudentToolsHubContent";
import { SITE_URL, jsonLdHtml } from "@/lib/studentTools";
import { ALL_TOOLS } from "./toolGroups";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Free Tools for Students | FORKSAI" },
  description:
    "Free browser tools for students: study calculators, image resizing and cropping, PDF merging and splitting, and file and text converters. No signup, and nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/tools",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Free Tools for Students | FORKSAI",
    description:
      "Study calculators, image tools, PDF tools and file converters. No account, no limits, nothing sent anywhere.",
    url: "https://forksai.app/tools",
  },
};

// A CollectionPage listing every tool, so the hub is legible to crawlers as the
// parent of the set rather than one more unrelated page. The list is derived
// from the same groups the page renders, so a new tool joins the schema at the
// moment it joins the page.
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free tools for students",
  description:
    "Free browser-based tools for students: study calculators, image resizers and croppers, PDF editors and converters, and file and text converters.",
  url: `${SITE_URL}/tools`,
  isPartOf: { "@type": "WebSite", name: "FORKSAI", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: ALL_TOOLS.length,
    itemListElement: ALL_TOOLS.map((tool, index) => ({
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
