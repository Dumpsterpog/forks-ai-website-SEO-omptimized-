// FAQ copy for the page numbering tool. Plain module because page.js is a
// Server Component and builds its FAQPage schema from the same array the page
// renders, so the two cannot drift apart.

export const PAGE_NUMBERS_FAQS = [
  {
    q: "How do I add page numbers to a PDF for free?",
    a: "Drop the PDF in, choose where the number sits and what it says, and save. The numbers are drawn into the file itself, so they print and they survive being emailed. There is no account, no upload and no limit on the number of pages.",
  },
  {
    q: "Can I start numbering from a page other than the first?",
    a: "Yes. The page range decides which pages get a number, so 3- numbers everything from the third page on and leaves a cover and a contents page clean. The first number box decides what the first stamped page is called, so you can have the third sheet print as 1 if that is what your submission asks for.",
  },
  {
    q: "What does the N in Page 1 of N mean here?",
    a: "It is the last number the tool prints, not always the sheet count of the file. Number every page of a twelve page PDF starting at 1 and it reads Page 1 of 12. Number pages 3 to 12 starting at 1 and the last one printed is 10, so it reads Page 1 of 10, which is what a reader of that numbered sequence expects.",
  },
  {
    q: "My PDF has sideways scanned pages. Will the numbers come out sideways too?",
    a: "No. A page carries its own rotation, and this tool reads it, places the number in the frame you actually see on screen, then converts that position back into the page's own coordinates and turns the text to match. A landscape scan gets its number along the bottom of the landscape view, the right way up, not running up the side of the sheet.",
  },
  {
    q: "Does adding numbers change anything else in the file?",
    a: "No. The existing page content is untouched and nothing is redrawn or re-compressed, so the text stays selectable, images keep their quality and the page count is exactly what it was. The number is added as new content on top, using one of the standard PDF fonts, which adds very little to the file size.",
  },
  {
    q: "Can I remove the numbers afterwards?",
    a: "Not from the saved file, so keep your original. Once the numbers are drawn they are part of the page content like any other text. That is what makes them print correctly everywhere, and it is why the tool never overwrites your input file, only offers a new one to download.",
  },
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. The file is opened, stamped and saved entirely inside your browser using pdf-lib. Nothing is sent to FORKSAI or to any third party, nothing is stored, and there is no account. Close the tab and it is gone.",
  },
];
