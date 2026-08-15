// FAQ copy for the four image tools. Lives outside the client components
// because each page.js is a Server Component and needs the same text to build
// its FAQPage schema. The rendered answer and the structured answer stay
// identical by construction, which is what Google asks for.

export const EXAM_PHOTO_FAQS = [
  {
    q: "How do I make a photo exactly 200 x 230 pixels and between 20 and 50 KB?",
    a: "Upload the photo, pick the 200 x 230 px preset or type your own numbers, position the frame over your face, and the tool encodes it for you. It sets the pixel size exactly, then searches for the JPEG quality that puts the finished file inside the KB range you asked for. The exact byte count is shown before you download, so you can check it against the form.",
  },
  {
    q: "What happens when my photo compresses to less than the minimum size?",
    a: "A small picture with a plain background can land under 20 KB even at full quality, and there is no honest way to add detail that is not there. The tool instead pads the file with JPEG comment segments, which are part of the JPEG standard and are skipped by every decoder. The pixels, the dimensions and the visible quality do not change, only the byte count. You can switch the padding off if you would rather submit the smaller file.",
  },
  {
    q: "Does KB mean 1000 bytes or 1024 bytes here?",
    a: "1024 bytes. Application forms and the file managers students check their sizes in almost always mean 1024, so a 50 KB limit is treated as 51,200 bytes. The tool also prints the raw byte count next to the KB figure, so if your form means 1000 you can still see exactly where you stand.",
  },
  {
    q: "Are these presets the official specification for a particular exam?",
    a: "No, and the tool deliberately does not put an exam name next to a number. 200 x 230 px at 20 to 50 KB for a photo and 140 x 60 px at 10 to 20 KB for a signature are the combinations that turn up on most Indian application forms, so they ship as common requirements. Read your own form and type its numbers into the custom fields if they differ. Every value here is editable.",
  },
  {
    q: "Is my photo uploaded to a server?",
    a: "No. The file is read, cropped and encoded entirely inside your browser using the Canvas API. Nothing is sent anywhere, nothing is saved, and there is no account. You can turn off your connection after the page loads and the tool still works.",
  },
  {
    q: "My signature photo has grey paper behind it. Can this fix that?",
    a: "In signature mode there is an option to whiten the paper. Any pixel brighter than the threshold is set to pure white, which lifts a grey photographed page to a clean background and leaves the ink alone. It also compresses far smaller, which is usually helpful because signature limits are the tightest.",
  },
];

export const PASSPORT_PHOTO_FAQS = [
  {
    q: "What size is a passport photo in pixels?",
    a: "It depends on the print resolution, because the requirement is a physical size. The most widely used size is 35 x 45 mm, which at 300 DPI is 413 x 531 pixels and at 600 DPI is 827 x 1063 pixels. The 2 x 2 inch size used by the United States is 600 x 600 pixels at 300 DPI. This tool shows the exact pixel count for whichever size and DPI you pick.",
  },
  {
    q: "How is the pixel count worked out?",
    a: "Pixels are millimetres divided by 25.4 to get inches, multiplied by the DPI, rounded to the nearest whole pixel. For 35 mm at 300 DPI that is 35 / 25.4 x 300 = 413.4, which rounds to 413. The arithmetic is printed on the page so you can check it.",
  },
  {
    q: "Does the file carry the right DPI for printing?",
    a: "Yes. A browser canvas writes 72 DPI into the JPEG header by default, which makes a correctly sized photo open at the wrong physical size in print software. This tool rewrites the JFIF density field to the DPI you chose, so the file both has the right pixel count and reports the right print size.",
  },
  {
    q: "Will this make my photo compliant with passport rules?",
    a: "It handles size, cropping and resolution only. It does not check background colour, lighting, head height, expression, glasses or headwear, and it cannot tell you whether a photo will be accepted. Read the rules published by the authority issuing your document and treat this as the sizing step.",
  },
  {
    q: "Can I set a maximum file size as well?",
    a: "Yes. Leave the size limits blank for a print quality file, or fill them in when an online application caps the upload. The encoder then searches for the highest JPEG quality that still fits under your maximum, and pads up to a minimum if the form demands one.",
  },
  {
    q: "Is the photo uploaded anywhere?",
    a: "No. Cropping and encoding run in your browser through the Canvas API, so the image stays on your device from start to finish. There is no server, no storage and no account.",
  },
];

export const IMAGE_RESIZER_FAQS = [
  {
    q: "How do I resize an image to an exact width and height?",
    a: "Upload it, type the width you want, and the height follows automatically while the aspect ratio lock is on. Unlock it to force both numbers, which stretches the picture. The preview and the file size update as you type, so there is nothing to press before you see the result.",
  },
  {
    q: "Can I resize by percentage instead of pixels?",
    a: "Yes. Switch to percentage and drag the slider or type a figure. 50% halves each side, which is a quarter of the pixels. Above 100% the picture is enlarged, and enlarging cannot recover detail the original never had, so it will look softer.",
  },
  {
    q: "Which format should I pick?",
    a: "JPEG for photographs, because it produces much smaller files. PNG for screenshots, logos and anything with sharp edges or transparency, because it is lossless. WebP is smaller than both at the same quality and is supported by every current browser, though some older upload forms still reject it.",
  },
  {
    q: "Why does a large reduction still look sharp here?",
    a: "Shrinking an image by more than half in a single step throws pixels away instead of averaging them, which is what makes downscaled scans and screenshots look ragged. This tool halves the image repeatedly until it is within a factor of two of the target, then does the last step, so detail is averaged down rather than dropped.",
  },
  {
    q: "Does resizing strip the metadata from my photo?",
    a: "Yes. Redrawing the picture onto a canvas produces a fresh file with only the pixel data, so EXIF fields such as GPS coordinates, the camera model and the timestamp are not carried over. The camera rotation flag is read first and applied, so a portrait phone photo does not come out sideways.",
  },
  {
    q: "Is there a file size or a daily limit?",
    a: "No. The work happens on your own device, so there is nothing for us to meter. The practical ceiling is your phone or laptop memory, and very large images simply take a moment longer to redraw.",
  },
];

export const IMAGE_CROPPER_FAQS = [
  {
    q: "How do I crop an image to a square?",
    a: "Pick the 1:1 ratio, then drag the frame over the part you want to keep and pinch or use the zoom slider to tighten it. The frame is locked to the ratio you chose, so the export is exactly square without any manual measuring.",
  },
  {
    q: "Can I crop to a ratio that is not in the list?",
    a: "Yes. Choose Custom and type the two numbers, for example 5 and 7 for a 5:7 print, or 21 and 9 for an ultrawide banner. The frame reshapes immediately and stays inside the picture whatever you type.",
  },
  {
    q: "Does cropping reduce the quality of the picture?",
    a: "Cropping itself only discards the area outside the frame, so the pixels you keep are the originals. Quality is lost only in the re-encode, so PNG output is lossless and JPEG output depends on the quality slider. Leave it high if the file will be edited again later.",
  },
  {
    q: "What resolution does the cropped file come out at?",
    a: "By default it is the exact pixel size of the region you selected, so a 1:1 crop from a 12 megapixel photo comes out around 3000 x 3000. You can cap the longest side if you want a smaller file, and the tool reports the final dimensions and byte count before you download.",
  },
  {
    q: "Does it keep transparency?",
    a: "Only if you export as PNG. JPEG has no alpha channel at all, so transparent areas are filled with white before encoding. The preview sits on a checkerboard so you can see which parts of your image are actually transparent.",
  },
  {
    q: "Is the image uploaded to crop it?",
    a: "No. Everything runs in your browser with the Canvas API. The picture is never sent to a server, never stored, and no account is needed.",
  },
];
