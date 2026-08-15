// Text statistics and case conversion, shared by /word-counter and
// /case-converter. No browser APIs, so both pages can render the same numbers
// during hydration that they render after it.

// Reading and speaking rates are stated assumptions, not measurements. They are
// exposed here so the UI can name the rate it used rather than presenting the
// estimate as a fact about the reader.
export const READING_WORDS_PER_MINUTE = 200;
export const SPEAKING_WORDS_PER_MINUTE = 130;

const WORD_SPLIT = /\s+/;

export function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(WORD_SPLIT).length;
}

// Sentence detection is punctuation based: a run of . ! ? or an ellipsis ends a
// sentence when whitespace or the end of the text follows it. Abbreviations
// like "Dr." are counted as sentence ends, which the page says out loud.
export function countSentences(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed
    .split(/[.!?…]+(?=\s|$)/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length;
}

// A paragraph is a block of text with a blank line on either side. A single
// line break inside a block is a soft wrap, not a new paragraph.
export function countParagraphs(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean).length;
}

export function formatDuration(minutes) {
  if (minutes <= 0) return "0 min";
  if (minutes < 1) return "under 1 min";
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes - whole) * 60);
  if (whole < 60) return seconds >= 30 ? `${whole} min 30 sec` : `${whole} min`;
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function textStats(text) {
  const value = typeof text === "string" ? text : "";
  const words = countWords(value);
  // Array spread rather than .length so an emoji or an accented character built
  // from a surrogate pair counts as one character, not two.
  const characters = [...value].length;
  const charactersNoSpaces = [...value.replace(/\s/g, "")].length;
  const trimmed = value.trim();
  const wordList = trimmed ? trimmed.split(WORD_SPLIT) : [];
  const longest = wordList.reduce((a, b) => (b.length > a.length ? b : a), "");

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences: countSentences(value),
    paragraphs: countParagraphs(value),
    lines: value ? value.split(/\r\n|\r|\n/).length : 0,
    readingMinutes: words / READING_WORDS_PER_MINUTE,
    speakingMinutes: words / SPEAKING_WORDS_PER_MINUTE,
    averageWordLength: words ? charactersNoSpaces / words : 0,
    averageSentenceLength: countSentences(value) ? words / countSentences(value) : 0,
    longestWord: longest,
  };
}

// Splits a string into words for the programmer cases. Handles spaces,
// punctuation, underscores, dashes and camel humps, so "XMLHttpRequest" comes
// back as XML, Http, Request rather than one blob.
export function splitWords(text) {
  return String(text)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export function toUpperCase(text) {
  return String(text).toUpperCase();
}

export function toLowerCase(text) {
  return String(text).toLowerCase();
}

// Title case capitalises every word and lowercases the rest of it, which is the
// behaviour people expect from a converter. Style guides that keep "of" and
// "the" lowercase disagree, and the page says which rule this one follows.
export function toTitleCase(text) {
  return String(text).replace(/\S+/g, (word) => {
    const lower = word.toLowerCase();
    // Leading punctuation like an opening quote should not eat the capital.
    const match = lower.match(/[a-z0-9]/);
    if (!match) return lower;
    const at = lower.indexOf(match[0]);
    return lower.slice(0, at) + lower.charAt(at).toUpperCase() + lower.slice(at + 1);
  });
}

// Sentence case lowercases everything, then capitalises the first letter of the
// text and the first letter after each sentence ending. The pronoun I is put
// back because losing it is the one change everybody notices.
export function toSentenceCase(text) {
  const lower = String(text).toLowerCase();
  const cased = lower.replace(/(^\s*|[.!?…]\s+|\n\s*)([a-z])/g, (m, prefix, letter) => prefix + letter.toUpperCase());
  return cased.replace(/\bi\b/g, "I").replace(/\bi'/g, "I'");
}

export function toCamelCase(text) {
  const words = splitWords(text);
  if (words.length === 0) return "";
  return words
    .map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word.toLowerCase())))
    .join("");
}

export function toPascalCase(text) {
  return splitWords(text)
    .map((word) => capitalize(word.toLowerCase()))
    .join("");
}

export function toSnakeCase(text) {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join("_");
}

export function toKebabCase(text) {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join("-");
}

export function toConstantCase(text) {
  return splitWords(text)
    .map((word) => word.toUpperCase())
    .join("_");
}

export const CASES = [
  { id: "upper", label: "UPPER CASE", sample: "THE QUICK BROWN FOX", convert: toUpperCase },
  { id: "lower", label: "lower case", sample: "the quick brown fox", convert: toLowerCase },
  { id: "title", label: "Title Case", sample: "The Quick Brown Fox", convert: toTitleCase },
  { id: "sentence", label: "Sentence case", sample: "The quick brown fox.", convert: toSentenceCase },
  { id: "camel", label: "camelCase", sample: "theQuickBrownFox", convert: toCamelCase },
  { id: "pascal", label: "PascalCase", sample: "TheQuickBrownFox", convert: toPascalCase },
  { id: "snake", label: "snake_case", sample: "the_quick_brown_fox", convert: toSnakeCase },
  { id: "kebab", label: "kebab-case", sample: "the-quick-brown-fox", convert: toKebabCase },
  { id: "constant", label: "CONSTANT_CASE", sample: "THE_QUICK_BROWN_FOX", convert: toConstantCase },
];
