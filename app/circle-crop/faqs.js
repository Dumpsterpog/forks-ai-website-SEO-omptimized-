// FAQ copy for the circle crop tool. Kept in a plain module because page.js is
// a Server Component and needs the same text for its FAQPage schema, so the
// rendered answer and the structured answer cannot drift apart.

export const CIRCLE_CROP_FAQS = [
  {
    q: "How do I crop a picture into a circle with a transparent background?",
    a: "Load the picture, drag the square frame over the part you want, and pick PNG with transparent corners. The tool masks everything outside the circle to an alpha of zero, so the four corners of the saved file are genuinely empty rather than white. Drop it into a slide, a document or a profile field and the background behind it shows through.",
  },
  {
    q: "Which file format keeps the transparency?",
    a: "PNG and WebP both store an alpha channel, so both keep the corners empty. JPEG has no alpha channel at all, which is why it is only offered once you choose a solid colour for the corners. If a site rejects your PNG, pick the solid colour option and match it to the background of the page it will sit on.",
  },
  {
    q: "What size should a profile picture be?",
    a: "Most platforms display an avatar somewhere between 40 and 200 pixels across but store something larger, so 400 or 512 pixels is a safe choice that stays sharp on a high resolution screen without being a heavy file. Going far above 1000 pixels for an avatar mostly adds bytes. The size list here covers the common ones, and you can type your own.",
  },
  {
    q: "Why is my circle cut off at the edges?",
    a: "It is not. The frame is locked to a square that cannot leave the picture, so the circle drawn inside it is always complete. If part of your face is missing, the frame is sitting somewhere else on the picture. Drag it, or use the zoom and position sliders underneath, and the preview updates as you go.",
  },
  {
    q: "Does the circle edge look jagged when I zoom in?",
    a: "No. The mask is composited rather than clipped, which means the browser antialiases the boundary and the pixels right on the edge get a partial alpha. The result is a smooth curve at any output size instead of a staircase.",
  },
  {
    q: "Is my picture uploaded anywhere?",
    a: "No. The file is decoded, cropped, masked and encoded entirely inside your browser with the Canvas API. Nothing is sent to FORKSAI or to any third party, nothing is stored, and there is no account. Turn your connection off once the page has loaded and the tool still works.",
  },
  {
    q: "Can I add a ring around the circle?",
    a: "Yes. Turn on the ring, set its thickness in pixels and pick a colour. It is drawn just inside the edge of the circle, so it never gets clipped, and the corners stay transparent around it. A thin ring in the colour of your slide deck is a quick way to make a cut out photo look deliberate.",
  },
];
