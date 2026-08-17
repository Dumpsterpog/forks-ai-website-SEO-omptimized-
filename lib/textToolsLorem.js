// Placeholder text generation. Pure arithmetic over a fixed word list, with a
// seeded generator rather than Math.random, so the same seed always produces
// the same passage. That matters twice: the server and the browser render
// identical text on the first paint, and a layout you liked can be reproduced
// instead of being lost to the next click.
//
// No browser APIs, so the Server Component and the client component can both
// import it.

// The classic passage, which is a scrambled and partly invented version of
// Cicero's De Finibus. The list below is the vocabulary those extracts use.
const WORDS = [
  "a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aliquam", "aliquet",
  "amet", "ante", "arcu", "at", "auctor", "augue", "bibendum", "blandit",
  "commodo", "condimentum", "congue", "consectetur", "consequat", "convallis",
  "cras", "cursus", "dapibus", "diam", "dictum", "dignissim", "dolor",
  "donec", "dui", "duis", "efficitur", "egestas", "eget", "eleifend",
  "elementum", "elit", "enim", "erat", "eros", "est", "et", "etiam", "eu",
  "euismod", "ex", "facilisis", "fames", "faucibus", "felis", "fermentum",
  "feugiat", "finibus", "fringilla", "fusce", "gravida", "habitant", "hendrerit",
  "iaculis", "id", "imperdiet", "in", "integer", "interdum", "ipsum", "justo",
  "lacinia", "lacus", "laoreet", "lectus", "leo", "libero", "ligula", "lobortis",
  "lorem", "luctus", "maecenas", "magna", "malesuada", "massa", "mattis",
  "mauris", "maximus", "metus", "mi", "molestie", "mollis", "morbi", "nam",
  "nec", "neque", "netus", "nibh", "nisi", "nisl", "non", "nulla", "nullam",
  "nunc", "odio", "orci", "ornare", "pellentesque", "pharetra", "phasellus",
  "placerat", "porta", "porttitor", "posuere", "praesent", "pretium", "primis",
  "pulvinar", "purus", "quam", "quis", "quisque", "rhoncus", "risus", "rutrum",
  "sagittis", "sapien", "scelerisque", "sed", "sem", "semper", "senectus",
  "sit", "sodales", "sollicitudin", "suscipit", "suspendisse", "tellus",
  "tempor", "tempus", "tincidunt", "tortor", "tristique", "turpis", "ullamcorper",
  "ultrices", "ultricies", "urna", "ut", "varius", "vehicula", "vel", "velit",
  "venenatis", "vestibulum", "vitae", "vivamus", "viverra", "volutpat",
  "vulputate",
];

// The opening every reader recognises. Used verbatim when the option is on,
// because a passage that does not start "Lorem ipsum" tends to be mistaken for
// real copy during a review.
const OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const LOREM_UNITS = [
  { id: "paragraphs", label: "Paragraphs", max: 50, defaultCount: 3 },
  { id: "sentences", label: "Sentences", max: 200, defaultCount: 8 },
  { id: "words", label: "Words", max: 2000, defaultCount: 60 },
];

export const LOREM_FORMATS = [
  { id: "text", label: "Plain text" },
  { id: "html", label: "HTML" },
];

export function getUnit(id) {
  return LOREM_UNITS.find((unit) => unit.id === id) || LOREM_UNITS[0];
}

// mulberry32. Small, fast and good enough for choosing words, and above all
// deterministic, which Math.random is not.
function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

function between(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// A run of words with no punctuation and no repeat of the word just used, so
// the text does not stutter the way a naive random pick does.
function words(random, count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    let word = pick(random, WORDS);
    let guard = 0;
    while (word === out[out.length - 1] && guard < 5) {
      word = pick(random, WORDS);
      guard += 1;
    }
    out.push(word);
  }
  return out;
}

/**
 * One sentence: six to sixteen words, sentence cased, with a comma dropped in
 * once or twice on the longer ones so the block has some rhythm to it.
 */
function sentence(random) {
  const length = between(random, 6, 16);
  const list = words(random, length);
  if (length > 9) {
    const at = between(random, 3, length - 4);
    list[at] = `${list[at]},`;
  }
  return `${capitalise(list.join(" "))}.`;
}

function paragraph(random) {
  const count = between(random, 3, 6);
  const out = [];
  for (let i = 0; i < count; i += 1) out.push(sentence(random));
  return out.join(" ");
}

/**
 * The passage itself.
 *
 * @param {object} spec
 * @param {string} spec.unit one of LOREM_UNITS
 * @param {number} spec.count how many of them
 * @param {number} spec.seed any integer; the same seed gives the same text
 * @param {boolean} spec.startWithLorem open with the familiar first line
 * @returns {string[]} the paragraphs, so the caller decides how to join them
 */
export function generateLorem({ unit, count, seed, startWithLorem }) {
  const spec = getUnit(unit);
  const wanted = Math.max(1, Math.min(spec.max, Math.floor(Number(count) || 0)));
  const random = makeRandom(seed);

  if (spec.id === "paragraphs") {
    const out = [];
    for (let i = 0; i < wanted; i += 1) {
      let block = paragraph(random);
      // The opening replaces the first sentence rather than being added to it,
      // so a request for three paragraphs is still three paragraphs.
      if (i === 0 && startWithLorem) {
        const rest = block.slice(block.indexOf(". ") + 1).trim();
        block = rest ? `${OPENING} ${rest}` : OPENING;
      }
      out.push(block);
    }
    return out;
  }

  if (spec.id === "sentences") {
    const out = [];
    for (let i = 0; i < wanted; i += 1) {
      out.push(i === 0 && startWithLorem ? OPENING : sentence(random));
    }
    return [out.join(" ")];
  }

  // Words. The count is the number of words, so the opening is only used when
  // there is room for all eight of its words.
  const opening = "Lorem ipsum dolor sit amet consectetur adipiscing elit".split(" ");
  const useOpening = startWithLorem && wanted >= opening.length;
  const rest = words(random, wanted - (useOpening ? opening.length : 0));
  const all = useOpening ? [...opening, ...rest] : rest;
  return [`${capitalise(all.join(" "))}.`];
}

/** Plain text: a blank line between paragraphs, which is what a paste expects. */
export function asPlainText(blocks) {
  return blocks.join("\n\n");
}

/**
 * HTML: one paragraph element per block. No class names and no wrapper, because
 * this is going straight into someone else's markup.
 */
export function asHtml(blocks) {
  return blocks.map((block) => `<p>${block}</p>`).join("\n");
}

export function renderLorem(blocks, format) {
  return format === "html" ? asHtml(blocks) : asPlainText(blocks);
}

/** Word and character counts for the generated passage, not the markup. */
export function loremStats(blocks) {
  const text = asPlainText(blocks);
  const trimmed = text.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    characters: text.length,
    paragraphs: blocks.length,
  };
}
