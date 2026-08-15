// Where a stamp lands on a page that may already be rotated.
//
// A PDF page carries a /Rotate value of 0, 90, 180 or 270 that every reader
// applies when it draws the page, but pdf-lib draws in the page's own
// unrotated coordinate space. Ignore that and a footer stamped on a scanned
// landscape page comes out running up the spine.
//
// So all the placing is done in the visible frame, the one the reader shows,
// and the result is mapped back into page space at the end. Plain module with
// no browser access, which also lets it be checked outside a browser.

export const NUMBER_POSITIONS = [
  { id: "bottom-center", label: "Bottom centre" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "top-center", label: "Top centre" },
  { id: "top-right", label: "Top right" },
  { id: "top-left", label: "Top left" },
];

export const NUMBER_FORMATS = [
  { id: "n", template: "{n}", label: "1" },
  { id: "page-n", template: "Page {n}", label: "Page 1" },
  { id: "page-n-of-N", template: "Page {n} of {N}", label: "Page 1 of 12" },
  { id: "n-of-N", template: "{n} of {N}", label: "1 of 12" },
  { id: "dash-n-dash", template: "- {n} -", label: "- 1 -" },
  { id: "custom", template: "", label: "Custom, written below" },
];

const norm = (angle) => (((Math.round(angle / 90) * 90) % 360) + 360) % 360;

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
 * and these are those three, inverted.
 */
export function toPageSpace(u, v, width, height, rotation) {
  const turn = norm(rotation);
  if (turn === 90) return { x: width - v, y: u };
  if (turn === 180) return { x: width - u, y: height - v };
  if (turn === 270) return { x: v, y: height - u };
  return { x: u, y: v };
}

/**
 * Where to start the baseline of a stamp, and at what angle to draw it.
 *
 * The angle comes back equal to the page's own rotation because pdf-lib
 * rotates counterclockwise and the reader then rotates clockwise, so the two
 * cancel and the text reads the right way up on screen.
 *
 * @param {object} spec
 * @param {number} spec.width page width in points, unrotated
 * @param {number} spec.height page height in points, unrotated
 * @param {number} spec.rotation the page's own /Rotate value
 * @param {string} spec.position one of NUMBER_POSITIONS
 * @param {number} spec.margin distance from the visible edge, in points
 * @param {number} spec.textWidth measured width of the stamp, in points
 * @param {number} spec.textHeight measured height of the stamp, in points
 * @param {object} [spec.offset] the media box origin, when it is not at 0, 0
 */
export function stampPlacement({
  width,
  height,
  rotation,
  position,
  margin,
  textWidth,
  textHeight,
  offset = { x: 0, y: 0 },
}) {
  const visible = visibleSize(width, height, rotation);
  const [row, column] = String(position).split("-");

  let u = (visible.width - textWidth) / 2;
  if (column === "left") u = margin;
  else if (column === "right") u = visible.width - margin - textWidth;

  // The baseline, not the top of the letters, so the descenders of a "Page 4"
  // still clear the bottom edge and a top stamp hangs below the margin.
  let v = margin;
  if (row === "top") v = visible.height - margin - textHeight;

  const point = toPageSpace(u, v, width, height, rotation);
  return {
    x: point.x + (offset.x || 0),
    y: point.y + (offset.y || 0),
    angle: norm(rotation),
    visible,
  };
}

/** "Page {n} of {N}" with the numbers filled in. */
export function formatLabel(template, n, total) {
  return String(template).replace(/\{n\}/g, String(n)).replace(/\{N\}/g, String(total));
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
