// The six text and developer tools, in one place, so every page in the set
// agrees on what exists and can cross-link to the rest. Same shape as
// FORMAT_TOOLS in lib/formatToolsMeta.js, which owns the nine file and format
// tools, and lib/studentTools.js, which owns the study calculators.
//
// Plain module, no browser APIs: the server page.js files can import it and the
// client components use it for the cross-link strip.

export const TEXT_TOOLS = [
  {
    href: "/diff-checker",
    name: "Diff checker",
    blurb: "Compare two texts line by line and see what was added, removed or changed.",
  },
  {
    href: "/password-generator",
    name: "Password generator",
    blurb: "Strong random passwords from your browser's crypto engine, with the entropy in bits.",
  },
  {
    href: "/json-formatter",
    name: "JSON formatter",
    blurb: "Beautify, minify and validate JSON, with the line and column of any error.",
  },
  {
    href: "/base64-encode-decode",
    name: "Base64 encoder and decoder",
    blurb: "Encode and decode text or files, with UTF-8 handled properly for emoji and accents.",
  },
  {
    href: "/url-encode-decode",
    name: "URL encoder and decoder",
    blurb: "Percent-encode and decode, with encodeURI and encodeURIComponent side by side.",
  },
  {
    href: "/lorem-ipsum-generator",
    name: "Lorem ipsum generator",
    blurb: "Placeholder paragraphs, sentences or words, as plain text or as HTML.",
  },
];
