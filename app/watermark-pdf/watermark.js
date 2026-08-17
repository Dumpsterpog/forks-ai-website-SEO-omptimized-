// Where a watermark lands on a page that may already be rotated.
//
// Same trap as the page numbering tool next door, and the same answer. A PDF
// page carries a /Rotate value of 0, 90, 180 or 270 that every reader applies
// when it draws the page, while pdf-lib draws in the page's own unrotated
// coordinate space. Stamp a diagonal across the stored page and on a rotated
// scan it comes out crossing the wrong way, often half off the sheet.
//
// So the watermark is placed in the visible frame, the one the reader shows,
// and the point and the angle are mapped back into page space at the end.
// Plain module with no browser access, which also lets it be checked outside a
// browser.

export const WATERMARK_POSITIONS = [
  { id: "middle-center", label: "Middle, across the page" },
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top centre" },
  { id: "top-right", label: "Top right" },
  { id: "middle-left", label: "Middle left" },
  { id: "middle-right", label: "Middle right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom centre" },
  { id: "bottom-right", label: "Bottom right" },
];

// Font size is derived rather than typed, because the useful question is how
// much of the page the watermark covers, and that answer has to hold for an A4
// portrait page and a slide in landscape alike.
export const MIN_FONT_SIZE = 4;
export const MAX_FONT_SIZE = 400;

const norm = (angle) => (((Math.round(angle / 90) * 90) % 360) + 360) % 360;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/** The page size as the reader shows it, which swaps on a quarter turn. */
export function visibleSize(width, height, rotation) {
  const turn = norm(rotation);
  return turn === 90 || turn === 270
    ? { width: height, height: width }
    : { width, height };
}

/**
 * A point in the visible frame, back into the page's own coordinates.
 *
 * The reader turns the content clockwise by the rotation, so page point (x, y)
 * shows up at:
 *   90:  (u, v) = (y, W - x)
 *   180: (u, v) = (W - x, H - y)
 *   270: (u, v) = (H - y, x)
 * and these are those three, inverted. Identical to the page numbering tool's
 * version on purpose: the two tools must agree about what the visible frame is.
 */
export function toPageSpace(u, v, width, height, rotation) {
  const turn = norm(rotation);
  if (turn === 90) return { x: width - v, y: u };
  if (turn === 180) return { x: width - u, y: height - v };
  if (turn === 270) return { x: v, y: height - u };
  return { x: u, y: v };
}

/**
 * The box a piece of text occupies once it has been turned by an angle. A
 * diagonal watermark is wider and taller than the text itself, and ignoring
 * that is how a 45 degree stamp ends up hanging off both edges.
 */
export function rotatedBox(textWidth, textHeight, angle) {
  const radians = toRadians(angle);
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return {
    width: textWidth * cos + textHeight * sin,
    height: textWidth * sin + textHeight * cos,
  };
}

/**
 * The font size that makes the watermark cover the requested share of the
 * visible page, then shrunk if that would push it past the margins.
 *
 * @param {object} spec
 * @param {object} spec.visible the visible page size
 * @param {number} spec.margin distance from the visible edge, in points
 * @param {number} spec.angle how far the text is turned, in degrees
 * @param {number} spec.sizePercent share of the visible width to cover
 * @param {(size: number) => {width: number, height: number}} spec.measure
 *   measures the text at a given font size, which only the caller can do
 */
export function fitFontSize({ visible, margin, angle, sizePercent, measure }) {
  // Text metrics are linear in the font size, so one measurement at a
  // reference size gives every other size by simple proportion. No search
  // loop, and no dependence on the font being loaded twice.
  const reference = 100;
  const at = measure(reference);
  if (!(at.width > 0) || !(at.height > 0)) return MIN_FONT_SIZE;

  const box = rotatedBox(at.width, at.height, angle);
  const wanted = (Math.max(1, Math.min(100, sizePercent)) / 100) * visible.width;
  let size = (reference * wanted) / box.width;

  // The margins are a hard limit, so a long word at 90 percent is scaled down
  // to fit rather than being allowed to run off the sheet.
  const availableWidth = Math.max(1, visible.width - 2 * margin);
  const availableHeight = Math.max(1, visible.height - 2 * margin);
  const scaled = rotatedBox((at.width * size) / reference, (at.height * size) / reference, angle);
  const shrink = Math.min(availableWidth / scaled.width, availableHeight / scaled.height, 1);
  size *= shrink;

  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
}

/**
 * Where to start the baseline of the watermark, at what size and at what angle.
 *
 * The returned angle is the watermark's own angle plus the page's rotation,
 * because pdf-lib turns text counterclockwise and the reader then turns the
 * page clockwise. Adding the rotation cancels the reader's turn, so a 45
 * degree watermark reads at 45 degrees on screen whatever the page is doing.
 *
 * @param {object} spec
 * @param {number} spec.width page width in points, unrotated
 * @param {number} spec.height page height in points, unrotated
 * @param {number} spec.rotation the page's own /Rotate value
 * @param {string} spec.position one of WATERMARK_POSITIONS
 * @param {number} spec.margin distance from the visible edge, in points
 * @param {number} spec.angle watermark angle in degrees, counterclockwise
 * @param {number} spec.sizePercent share of the visible width to cover
 * @param {(size: number) => {width: number, height: number}} spec.measure
 * @param {object} [spec.offset] the media box origin, when it is not at 0, 0
 */
export function watermarkPlacement({
  width,
  height,
  rotation,
  position,
  margin,
  angle,
  sizePercent,
  measure,
  offset = { x: 0, y: 0 },
}) {
  const visible = visibleSize(width, height, rotation);
  const fontSize = fitFontSize({ visible, margin, angle, sizePercent, measure });
  const text = measure(fontSize);
  const box = rotatedBox(text.width, text.height, angle);

  const [row, column] = String(position).split("-");

  // The centre of the watermark in the visible frame. Centring rather than
  // cornering the box is what keeps a turned stamp inside the page: a diagonal
  // has no corner that lines up with the page's.
  let cu = visible.width / 2;
  if (column === "left") cu = margin + box.width / 2;
  else if (column === "right") cu = visible.width - margin - box.width / 2;

  let cv = visible.height / 2;
  if (row === "bottom") cv = margin + box.height / 2;
  else if (row === "top") cv = visible.height - margin - box.height / 2;

  // From the centre back to the baseline start. The text runs along
  // (cos a, sin a) and its body sits above the baseline, along the
  // perpendicular (-sin a, cos a).
  const radians = toRadians(angle);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const u = cu - (text.width / 2) * cos + (text.height / 2) * sin;
  const v = cv - (text.width / 2) * sin - (text.height / 2) * cos;

  const point = toPageSpace(u, v, width, height, rotation);
  return {
    x: point.x + (offset.x || 0),
    y: point.y + (offset.y || 0),
    angle: angle + norm(rotation),
    fontSize,
    visible,
    box,
    // The centre in the visible frame, as a fraction of it, which is what the
    // on-page preview needs to put its overlay in the same place.
    center: { u: cu / visible.width, v: cv / visible.height },
  };
}

/**
 * The standard PDF fonts are encoded in WinAnsi, which covers Latin text and
 * nothing else. Saying so up front beats a stack trace from deep inside the
 * encoder when someone pastes a rupee sign or a Devanagari word.
 */
export function unsupportedCharacters(text) {
  const bad = [...new Set([...String(text)].filter((ch) => ch.charCodeAt(0) > 255))];
  return bad.join(" ");
}
