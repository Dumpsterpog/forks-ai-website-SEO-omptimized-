// FAQ copy for the nine file and format tools. Lives outside the client
// components because each page.js is a Server Component and needs the same text
// to build its FAQPage schema. Rendered answer and structured answer stay
// identical by construction, which is what Google's structured data guidelines
// ask for.

export const IMAGE_CONVERTER_FAQS = [
  {
    q: "Are my images uploaded to a server?",
    a: "No. The conversion happens in your browser using the canvas API, so the image data never leaves your device. You can watch it work with your network disconnected.",
  },
  {
    q: "Why does my PNG lose its transparent background when I convert it to JPG?",
    a: "JPG has no alpha channel, so transparency cannot survive the format. Every transparent pixel has to become a solid colour, and this converter fills it with white by default. If you need the transparency, convert to PNG or WebP instead.",
  },
  {
    q: "Which format should I pick?",
    a: "PNG for screenshots, logos and anything with transparency or flat colour. JPG for photographs, when you want the smallest file and the widest compatibility. WebP for the web, when you want photo-grade compression and transparency in the same file.",
  },
  {
    q: "Does converting PNG to JPG and back restore the original quality?",
    a: "No. JPG throws away detail to save space, and converting the result back to PNG only preserves the damaged version. Always convert from your original file rather than from an earlier conversion.",
  },
  {
    q: "Is there a file size limit?",
    a: "The limit is your device's memory rather than an upload cap. Very large images, above roughly 50 megapixels, can be slow on a phone because the whole bitmap has to be held in memory.",
  },
  {
    q: "Can I convert HEIC photos from my iPhone?",
    a: "Only if your browser can decode HEIC, which Safari on Apple devices can and most other browsers cannot. If the preview stays empty, the browser could not read the file, and the fastest fix is to export it as JPG on the phone first.",
  },
];

export const COMPRESS_IMAGE_FAQS = [
  {
    q: "How do I compress an image to a specific file size?",
    a: "Set the target size, for example 100 KB, and the tool re-encodes the image at descending quality levels until the result lands under your target. It reports the exact size it reached, so you can see how much margin you have.",
  },
  {
    q: "What if the target size cannot be reached?",
    a: "The tool tells you plainly instead of returning a broken file. If quality alone is not enough, it scales the image down in steps and tries again, and if even that misses, it hands you the smallest version it managed along with the size it reached.",
  },
  {
    q: "Does compressing an image reduce its dimensions?",
    a: "Only if it has to. Quality is reduced first, which keeps the pixel dimensions intact. Downscaling starts only when the smallest usable quality still misses the target.",
  },
  {
    q: "Is the compression lossless?",
    a: "No. Hitting a target size means discarding image data, which is why the preview shows the compressed result next to the original at full size. Zoom in on text and sharp edges, since that is where the loss shows first.",
  },
  {
    q: "Which format compresses the smallest?",
    a: "WebP is usually the smallest for the same visual quality, and JPG is close behind with wider support in older software. PNG is lossless, so it is a poor choice when you are chasing a size target on a photograph.",
  },
  {
    q: "Do my files get uploaded anywhere?",
    a: "No. Compression runs entirely in your browser, so the image never leaves your device and nothing is stored.",
  },
];

export const FAVICON_GENERATOR_FAQS = [
  {
    q: "What favicon sizes do I actually need?",
    a: "16 and 32 pixels for browser tabs and bookmarks, 48 for older Windows shortcuts, 180 for the Apple touch icon, and 192 and 512 for Android and progressive web app manifests. This tool outputs all six from one upload.",
  },
  {
    q: "What image should I upload?",
    a: "A square image at 512 pixels or larger, ideally with a transparent or flat background. Fine detail disappears at 16 pixels, so a simplified mark reads far better than a full logo with text.",
  },
  {
    q: "Do I still need a favicon.ico file?",
    a: "Only for older browsers. Modern browsers read PNG icons from your HTML, but a favicon.ico at the site root is still the fallback some crawlers and legacy versions look for, so this tool includes one built from the 16, 32 and 48 pixel images.",
  },
  {
    q: "How do I add these files to my site?",
    a: "Put them in your site root or public folder, then link them in the head of your HTML. The tool prints the exact link and meta tags to copy, including the manifest entries for the 192 and 512 pixel icons.",
  },
  {
    q: "Why does my favicon still show the old icon?",
    a: "Browsers cache favicons aggressively. Hard reload the page, or open the icon file directly by URL to confirm the new one is being served, before assuming the generation went wrong.",
  },
  {
    q: "Is this favicon generator free and private?",
    a: "Yes to both. There is no account and no upload: the resizing runs in your browser with the canvas API, and the zip is built on your device.",
  },
];

export const TEXT_TO_PDF_FAQS = [
  {
    q: "How do I turn plain text into a PDF?",
    a: "Paste or type your text, choose the page size, font, font size and margins, then download. The PDF is written in your browser, so nothing is uploaded and the download starts immediately.",
  },
  {
    q: "Which fonts are available?",
    a: "Helvetica, Times and Courier, the standard PDF fonts that every reader can display without embedding a font file. That keeps the file small and guarantees it renders the same everywhere.",
  },
  {
    q: "Can I use A4 and Letter page sizes?",
    a: "Yes, along with Legal and A5. Page size, orientation and margins are all set before you download, and the preview shows how many pages you will get.",
  },
  {
    q: "Does it support other languages and accents?",
    a: "Western European accents are supported through the standard PDF encoding. Scripts outside that range, such as Devanagari, Chinese, Japanese, Arabic or Cyrillic, need an embedded font and will not render correctly here, so the tool warns you when it finds characters it cannot write.",
  },
  {
    q: "Are my documents private?",
    a: "Yes. The text stays in the browser tab and the PDF is generated on your device. Nothing is sent to a server and nothing is stored.",
  },
  {
    q: "Can I convert markdown instead of plain text?",
    a: "Use the markdown to PDF tool for that. It renders headings, lists, bold, italic, code and links, while this tool keeps your text exactly as typed.",
  },
];

export const MARKDOWN_TO_PDF_FAQS = [
  {
    q: "Which markdown features are supported?",
    a: "Headings from one to six hashes, ordered and unordered lists including nesting, bold, italic, inline code, fenced and indented code blocks, block quotes, horizontal rules, links, and paragraphs. Tables, images, footnotes, HTML blocks and task lists are not rendered, so this is a common subset rather than full CommonMark.",
  },
  {
    q: "What happens to links in the PDF?",
    a: "The link text is printed and the destination is shown after it in brackets, so a printed copy still carries the address. The PDF is text, not a web page, so the link is readable rather than clickable.",
  },
  {
    q: "What happens to images and tables?",
    a: "They are not supported. An image line is skipped and a table is printed as its raw markdown text, so nothing silently disappears without you seeing it in the preview.",
  },
  {
    q: "Does the preview match the PDF exactly?",
    a: "It matches structurally, not pixel for pixel. The preview uses your browser's fonts, and the PDF uses the standard PDF fonts, so line breaks can land in different places while headings, lists and code blocks stay the same.",
  },
  {
    q: "Is my markdown uploaded anywhere?",
    a: "No. The parsing and the PDF writing both happen in your browser, so the document never leaves your device.",
  },
  {
    q: "Can I paste markdown exported from another app?",
    a: "Yes. Anything from a notes app, a README or an AI chat export works, as long as you accept that unsupported syntax such as tables passes through as plain text.",
  },
];

export const CSV_TO_JSON_FAQS = [
  {
    q: "Does this handle commas inside quoted fields?",
    a: "Yes. The parser follows RFC 4180, so a field wrapped in double quotes can contain commas, line breaks and doubled quotes without breaking the row. The preview table shows exactly how each row was split.",
  },
  {
    q: "Can it convert JSON back to CSV?",
    a: "Yes, in both directions. Give it an array of objects and it builds the header from the union of all keys, so a record missing a field still lines up under the right column instead of shifting the row.",
  },
  {
    q: "What happens to nested objects and arrays in my JSON?",
    a: "A nested value is written into the cell as JSON text rather than being dropped or flattened into extra columns. CSV has no nesting, so this keeps the data readable and reversible.",
  },
  {
    q: "Why are my numbers coming out as strings?",
    a: "By default every CSV value stays a string, because typing them would strip the leading zeros from ZIP codes, student IDs and phone numbers. Turn on number and boolean detection if you want typed values instead.",
  },
  {
    q: "Does it support semicolon or tab separated files?",
    a: "Yes. The delimiter is detected from your file, counting only separators outside quoted fields, and you can override it if the guess is wrong.",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Parsing runs in your browser, so spreadsheets with customer or student data never leave your device.",
  },
];

export const WORD_COUNTER_FAQS = [
  {
    q: "How is a word counted?",
    a: "A word is any run of characters separated by whitespace, which is how word processors count. A hyphenated word such as long-term counts as one, and a number counts as a word.",
  },
  {
    q: "How is reading time estimated?",
    a: "The word count is divided by 200 words per minute, a common silent reading rate for adults, and speaking time uses 130 words per minute. These are assumptions rather than measurements of you, so treat them as a rough guide.",
  },
  {
    q: "What counts as a sentence?",
    a: "A run of text ending in a full stop, question mark, exclamation mark or ellipsis followed by a space or the end of the text. Abbreviations such as Dr. and e.g. are counted as sentence endings, which can push the count up slightly.",
  },
  {
    q: "What counts as a paragraph?",
    a: "A block of text with a blank line on either side. A single line break inside a block is treated as a soft wrap, not a new paragraph, which matches how markdown and most editors behave.",
  },
  {
    q: "Does it count characters with and without spaces?",
    a: "Both, side by side, which is what character limits on essays, application forms and social posts usually need. Emoji and accented characters count as one character each.",
  },
  {
    q: "Is my text saved or sent anywhere?",
    a: "No. Counting happens as you type, in your browser, and closing the tab discards the text.",
  },
];

export const CASE_CONVERTER_FAQS = [
  {
    q: "Which cases can I convert to?",
    a: "UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE. Every result is shown at once, so you can copy the one you need without switching modes.",
  },
  {
    q: "How does Title Case decide what to capitalise?",
    a: "It capitalises the first letter of every word and lowercases the rest. Style guides that keep short words such as of, the and in lowercase disagree with that rule, so check the result if you are following a specific style guide.",
  },
  {
    q: "What is the difference between Title Case and Sentence case?",
    a: "Title Case capitalises every word. Sentence case capitalises only the first word of each sentence, and leaves the rest lowercase, which is what most body copy and headlines in modern style guides use.",
  },
  {
    q: "How does camelCase handle acronyms?",
    a: "Words are split on spaces, punctuation and camel humps, and a run of capitals followed by a capitalised word is split before the last capital. XMLHttpRequest becomes xmlHttpRequest rather than xMLHttpRequest.",
  },
  {
    q: "Will it fix text I typed with caps lock on?",
    a: "Yes. Sentence case is the one you want for a paragraph typed in all capitals, since it lowercases everything and then capitalises each sentence opener.",
  },
  {
    q: "Does the text leave my browser?",
    a: "No. The conversion is a string operation running on your device, and nothing is uploaded or stored.",
  },
];

export const QR_CODE_FAQS = [
  {
    q: "Do the QR codes expire or stop working?",
    a: "No. The code encodes your text or link directly, with no redirect service in the middle, so there is nothing to expire, no tracking, and no account that could stop working later.",
  },
  {
    q: "What is error correction and which level should I pick?",
    a: "Error correction lets a scanner read the code even when part of it is damaged or covered. Level L recovers about 7% of the code, M about 15%, Q about 25% and H about 30%. M is a good default, and H is worth it for printed codes or when you place a logo over the centre.",
  },
  {
    q: "Why does my QR code look denser after I edit the text?",
    a: "Longer content needs a larger QR version, which means more modules in the same square. Denser codes need a better camera or a closer scan, so keep links short if the code will be printed small.",
  },
  {
    q: "Should I download PNG or SVG?",
    a: "PNG for screens, chat and documents. SVG for print and large signage, because it is a vector and stays sharp at any size.",
  },
  {
    q: "How large should a printed QR code be?",
    a: "A common rule of thumb is a code width of about one tenth of the scanning distance, so a code read from one metre away wants to be roughly ten centimetres across. Test with a phone before printing a run.",
  },
  {
    q: "Is anything sent to a server?",
    a: "No. The code is generated in your browser, so the link or text you encode is never transmitted or logged.",
  },
];
