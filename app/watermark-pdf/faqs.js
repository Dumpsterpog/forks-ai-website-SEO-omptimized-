// FAQ copy for the PDF watermarking tool. Plain module because page.js is a
// Server Component and builds its FAQPage schema from the same array the page
// renders, so the two cannot drift apart.

export const WATERMARK_PDF_FAQS = [
  {
    q: "How do I add a watermark to a PDF for free?",
    a: "Drop the PDF in, type the words you want stamped across it, set the angle, the size and how faint it should be, then save. There is no account, no upload and no page limit. The watermark is drawn into the file itself, so it prints and it survives being emailed on.",
  },
  {
    q: "Is my file uploaded anywhere?",
    a: "No. The PDF is opened by this page in your browser and the stamped copy is written there too, so the file never leaves your device. That is also why it keeps working when you go offline, and why a contract or a medical report is safe to run through it.",
  },
  {
    q: "My PDF has sideways scanned pages. Will the watermark come out crooked?",
    a: "No. A page carries its own rotation of 0, 90, 180 or 270 degrees, and this tool reads it, places the watermark in the frame you actually see on screen, then converts that position back into the page's own coordinates and turns the text to match. A 45 degree diagonal crosses every page at 45 degrees, whichever way the page was scanned.",
  },
  {
    q: "Can I watermark only some of the pages?",
    a: "Yes. Choose only these pages and type a selection such as 1-3, 7 or 4- to stamp from the fourth page to the end. Every other page is written out untouched, and the page count of the saved file is the same as the original.",
  },
  {
    q: "Can the watermark be removed?",
    a: "By someone determined, yes. A text watermark is ordinary page content, so a PDF editor can select and delete it. Treat it as a clear label saying draft, sample or confidential, not as a lock. Nothing that renders on a page can stop a screenshot.",
  },
  {
    q: "Why is my watermark smaller than the size I asked for?",
    a: "The size is a share of the page width, and the margin is a hard limit. A long phrase set to 90 percent and turned 45 degrees would run off the corners, so it is scaled down until the whole thing fits inside the margin. Shorten the text or drop the angle back towards zero and it will take the full size.",
  },
  {
    q: "Can I use symbols or a non Latin script?",
    a: "Not with these typefaces. The fonts built into every PDF reader cover Latin letters, digits and punctuation, which is what keeps the saved file the same size as the original. The tool says so before you save rather than failing at the end, so nothing is lost.",
  },
  {
    q: "Does watermarking make the file bigger or blurry?",
    a: "Neither. The text is added as new content on top of each page, so nothing existing is touched, images are not re-compressed and the text underneath stays selectable. The file grows by a fraction of a kilobyte per page.",
  },
];
