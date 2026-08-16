import PasswordGeneratorContent from "./PasswordGeneratorContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { PASSWORD_GENERATOR_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Password Generator: Strong Random Passwords | FORKSAI" },
  description:
    "Free strong password generator. Choose length, letters, digits and symbols, exclude ambiguous characters, and see the real entropy in bits. Generated on your device with crypto.getRandomValues, never sent anywhere.",
  alternates: {
    canonical: "https://forksai.app/password-generator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Password Generator: Strong Random Passwords | FORKSAI",
    description:
      "Generate strong random passwords in your browser and see the entropy in bits rather than a made up strength score. Free, no signup, nothing leaves your device.",
    url: "https://forksai.app/password-generator",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/password-generator",
  name: "FORKSAI Password Generator",
  description:
    "A free browser-based password generator that draws every character from crypto.getRandomValues with rejection sampling, offers length, uppercase, lowercase, digit, symbol and ambiguous character options, and reports the calculated entropy of the result in bits.",
  faqs: PASSWORD_GENERATOR_FAQS,
});

export default function Page() {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
        />
      ))}
      <PasswordGeneratorContent />
    </>
  );
}
