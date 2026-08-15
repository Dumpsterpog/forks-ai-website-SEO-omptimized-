// FAQ copy for the image watermarker. Plain module because page.js is a Server
// Component and builds its FAQPage schema from the same array the page renders,
// so the two cannot drift apart.

export const WATERMARK_IMAGE_FAQS = [
  {
    q: "How do I add a watermark to a photo for free?",
    a: "Load the photo, type the text you want or upload your logo, then set where it sits, how big it is, how see-through it is and what angle it sits at. The preview is the finished image, so what you look at is what downloads. There is no account, no watermark of ours added on top, and no limit on how many pictures you do.",
  },
  {
    q: "Should the watermark be text or a logo?",
    a: "Text is faster and stays sharp at any size, which suits a name, a handle or a line like Draft or Confidential. A logo carries the brand, and if it is a PNG with a transparent background it sits over the picture cleanly. Both are sized as a share of the picture width here, so the same setting looks right on a phone photo and on a large scan.",
  },
  {
    q: "What opacity should I use?",
    a: "Somewhere between 25 and 50 per cent is the usual compromise: readable enough to make the point, faint enough that it does not ruin the picture. Push it higher when the aim is to stop reuse, and lower when it is only a signature. Watch the preview against the busiest part of the image rather than the plainest.",
  },
  {
    q: "My white text disappears over a bright photo. What can I do?",
    a: "Turn on the outline. It strokes the letters in a contrasting colour before filling them, so white text stays legible over a bright sky and dark text stays legible over a dark background. Moving the watermark to a calmer corner of the picture is the other fix, and the nine position buttons make that a single click.",
  },
  {
    q: "Does the watermark stay inside the picture when I rotate it?",
    a: "Yes. The tool measures the box the rotated watermark actually occupies, not the unrotated one, and insets it from the edge by the margin you set. A watermark at 45 degrees in the bottom right corner will not lose its corner off the edge of the file.",
  },
  {
    q: "Can someone remove the watermark?",
    a: "A determined person with an editor can attack any visible watermark, and a diagonal mark across the middle of a picture is much more work to remove than a small one in a corner. Treat a watermark as a deterrent and as a way of saying who made the picture, not as protection. What it does reliably is travel with the file when someone re-shares it.",
  },
  {
    q: "Is my picture uploaded to a server?",
    a: "No. The photo, the logo and the finished file all stay inside your browser. The drawing is done with the Canvas API on your own device, nothing is sent to FORKSAI or to anyone else, and nothing is stored. You can disconnect after the page loads and it still works.",
  },
];
