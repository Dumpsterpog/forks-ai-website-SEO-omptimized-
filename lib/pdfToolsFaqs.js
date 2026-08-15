// FAQ copy for the seven PDF tool pages. Kept out of the client components
// because each page.js is a Server Component and builds its FAQPage schema from
// the same text the page renders, which is what Google's structured data
// guidelines ask for.

const ON_DEVICE_ANSWER =
  "No. The page opens your file with JavaScript running in your own browser, does the work there, and hands you the result as a download. Nothing is uploaded, so there is no server copy to delete and no queue to wait in. You can check this yourself: open your browser's network tab, run the tool, and you will see no request carrying your file.";

const FREE_ANSWER =
  "Yes, and there is no account, no email box and no watermark on the output. The tool is here because FORKSAI makes study software and this is a useful thing to give away.";

export const MERGE_PDF_FAQS = [
  {
    q: "How do I combine several PDFs into one?",
    a: "Add the files, drag them into the order you want, then press merge. The pages come out in the order the list shows, top file first, and every page of every file is kept.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: ON_DEVICE_ANSWER,
  },
  {
    q: "How many PDFs can I merge at once?",
    a: "There is no fixed limit in the tool. The practical limit is your browser's memory, because every file has to be held in the tab at the same time. A few hundred megabytes in total is comfortable on a laptop; a phone will struggle sooner. The page warns you when a file is unusually large.",
  },
  {
    q: "Does merging change the quality of my pages?",
    a: "No. Pages are copied across whole, so text stays selectable, images keep their original resolution and nothing is re-encoded. The merged file is roughly the size of the originals added together.",
  },
  {
    q: "What happens to bookmarks, forms and links?",
    a: "Page content, page size and page rotation are preserved. Document level extras such as the bookmark outline, form field data and the table of contents are not carried across, because they belong to the original document rather than to any one page. Links that point outside the document still work; links that point to a page inside it may not.",
  },
  {
    q: "Can I merge a password protected PDF?",
    a: "Not directly. An encrypted PDF cannot be read without its password, so the tool will tell you the file is locked. Open it in a PDF reader, enter the password, save an unlocked copy, then merge that.",
  },
  { q: "Is this PDF merger free?", a: FREE_ANSWER },
];

export const SPLIT_PDF_FAQS = [
  {
    q: "How do I extract certain pages from a PDF?",
    a: "Load the file, then either click the page thumbnails you want or type a range such as 1-3, 7, 11-14. Extract gives you one new PDF holding exactly those pages, in page order.",
  },
  {
    q: "Can I split a PDF into separate single page files?",
    a: "Yes. Switch to the one file per page mode and you get a file per page, delivered as a single zip. Downloading twenty files one at a time is the kind of thing browsers block, so the zip is the default.",
  },
  { q: "Are my files uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "How do I write a page range?",
    a: "Use numbers separated by commas and dashes for ranges: 1-3, 7, 11-14. A dash with nothing after it, like 9-, means from that page to the end. Pages are counted from 1, and repeating a page does not duplicate it.",
  },
  {
    q: "Does splitting reduce the file size?",
    a: "Usually yes, but not always in proportion. A PDF shares fonts and images between pages, so a single page pulled out of a 200 page report carries the resources that page needs, which can be more than one two hundredth of the original.",
  },
  {
    q: "Will the extracted pages keep their rotation and size?",
    a: "Yes. Each page is copied with its own size, rotation and content intact, so a landscape page in a portrait document stays landscape.",
  },
  { q: "Is this PDF splitter free?", a: FREE_ANSWER },
];

export const ROTATE_PDF_FAQS = [
  {
    q: "How do I rotate a page in a PDF and save it that way?",
    a: "Load the file, use the rotate buttons on the page you want, or rotate every page at once, then save. The rotation is written into the file itself, so it opens the right way up everywhere, not just in the viewer you happened to use.",
  },
  {
    q: "Why does my PDF viewer let me rotate but not keep it?",
    a: "Most readers rotate the view for the current session only and never touch the file. This tool changes the page's own rotation value, which is stored in the PDF and travels with it when you email it or print it.",
  },
  { q: "Are my files uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "Can I rotate only some pages?",
    a: "Yes. Each page has its own rotate left and rotate right buttons, and the thumbnail turns as you press them so you can see the result before you save. The rotate all buttons apply the same turn to every page.",
  },
  {
    q: "Does rotating a PDF lose quality?",
    a: "No. Rotation changes a single number on each page rather than redrawing anything, so text stays selectable and images are untouched. The saved file is about the same size as the original.",
  },
  {
    q: "My scan is upside down. Which way do I turn it?",
    a: "Upside down needs 180 degrees, so two presses of either rotate button. A page lying on its side needs one press: rotate right if the top of the text points left, rotate left if it points right.",
  },
  { q: "Is this PDF rotator free?", a: FREE_ANSWER },
];

export const DELETE_PDF_PAGES_FAQS = [
  {
    q: "How do I delete pages from a PDF?",
    a: "Load the file and click the thumbnails of the pages you want gone, or type their numbers. The tool then saves a new PDF with everything except those pages, in the original order.",
  },
  { q: "Are my files uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "Does this change my original file?",
    a: "No. Your file on disk is never touched. The tool builds a new PDF in memory and downloads it, so if you get the selection wrong you still have the original.",
  },
  {
    q: "Can I delete every page?",
    a: "No, and the tool stops you. A PDF with no pages is not a valid PDF and most readers refuse to open it, so at least one page has to stay.",
  },
  {
    q: "Is deleted content really gone from the file?",
    a: "The pages are not copied into the new file, so their content does not travel with it. This is page removal, not redaction: if you need to hide something inside a page you are keeping, deleting pages will not do it.",
  },
  {
    q: "The thumbnails are slow on my long document. Why?",
    a: "Every thumbnail is a real render of that page, done by your own machine. Long documents therefore take longer, and a page heavy with images takes longer than a page of text. Past a few hundred pages the tool switches to numbered buttons instead, because rendering that many previews costs more than it helps.",
  },
  { q: "Is this page remover free?", a: FREE_ANSWER },
];

export const PDF_TO_IMAGES_FAQS = [
  {
    q: "How do I turn PDF pages into images?",
    a: "Load the file, pick PNG or JPG and a size, then convert. Each page is drawn to an image at the size you asked for. Save them one at a time, or take the lot as a zip.",
  },
  { q: "Are my files uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "Should I choose PNG or JPG?",
    a: "PNG for pages that are mostly text, diagrams or line art: it is lossless, so edges stay sharp. JPG for pages that are mostly photographs, where the file comes out far smaller and the loss is hard to see. PNG files of a text page are often several times bigger than the JPG.",
  },
  {
    q: "What does the scale setting do?",
    a: "A PDF page has no fixed pixel size, only a physical one. Scale 1 renders at 72 pixels per inch, which makes an A4 page about 595 by 842 pixels. Scale 2 doubles that to roughly 150 pixels per inch, and scale 4 gets you near 300 pixels per inch, which is what print work usually wants. Higher scales take longer and use more memory.",
  },
  {
    q: "Why did my long document slow the page down?",
    a: "Rendering is real work done by your own processor, one page at a time, and a high scale multiplies it. The progress bar shows where it has got to, and you can stop it partway and keep the pages already done.",
  },
  {
    q: "Can I convert just one page?",
    a: "Yes. Set the page range before converting, for example 4 on its own, or 4-8.",
  },
  { q: "Is this PDF to image converter free?", a: FREE_ANSWER },
];

export const IMAGES_TO_PDF_FAQS = [
  {
    q: "How do I combine images into one PDF?",
    a: "Add your JPGs or PNGs, drag them into the order you want, choose a page size, then save. You get a single PDF with one image per page.",
  },
  { q: "Are my images uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "Which image formats work?",
    a: "JPG and PNG go into the PDF directly, with their data untouched. WebP is converted to PNG by your browser first, which is lossless but makes the file bigger. HEIC from an iPhone is not supported by most browsers, so convert those to JPG first.",
  },
  {
    q: "What is the difference between A4, Letter and fit to image?",
    a: "A4 and Letter give every page the same fixed size and place the image inside it, scaled to fit and centred, which is what you want for something you will print. Fit to image makes each page exactly the size of the image on it, so there is no border and pages can differ in shape.",
  },
  {
    q: "Will my photos lose quality?",
    a: "JPGs are embedded exactly as they are, with no re-encoding, so there is no extra loss. PNGs keep their pixels too. The image is placed at whatever size the page allows, but the data behind it is the full resolution one, so zooming in shows the detail that was there.",
  },
  {
    q: "Why is my PDF so large?",
    a: "Because the images are stored at full resolution. Ten photos from a modern phone camera add up to a large PDF. Shrink the images before adding them if size matters more than detail.",
  },
  { q: "Is this image to PDF converter free?", a: FREE_ANSWER },
];

export const PDF_TEXT_EXTRACTOR_FAQS = [
  {
    q: "How do I get the text out of a PDF?",
    a: "Load the file and the text appears in the box below, page by page. Copy it to the clipboard or save it as a .txt file. Nothing is retyped and nothing is guessed: this is the text the PDF already carries.",
  },
  {
    q: "Why did my PDF return no text at all?",
    a: "Because it is a scan. A photographed or scanned page is a picture of text, not text, and a picture holds no characters to extract. This tool reads only real, selectable text, so a scan comes back empty. The quick check is to try selecting a word in your usual PDF reader: if the cursor will not highlight it, this tool will find nothing. Getting text out of a scan needs optical character recognition, which this page does not do.",
  },
  { q: "Are my files uploaded to a server?", a: ON_DEVICE_ANSWER },
  {
    q: "Why is the spacing and line breaking odd?",
    a: "A PDF stores where each fragment of text sits on the page, not sentences and paragraphs. Rebuilding lines from those positions is guesswork, and it goes wrong most often on multi column layouts, tables and headers, where reading order on screen is not the order the fragments are stored in. Expect to tidy the result.",
  },
  {
    q: "Can I extract text from only some pages?",
    a: "Yes. Set a page range, such as 12-18, before extracting.",
  },
  {
    q: "Does this work on a protected PDF?",
    a: "A PDF that is encrypted with a password cannot be read at all until it is unlocked. A PDF that merely sets a no copying flag is a different matter: the flag is an instruction to reader software, not encryption, and this tool reads the text regardless. Respect whatever licence the document carries.",
  },
  { q: "Is this PDF text extractor free?", a: FREE_ANSWER },
];
