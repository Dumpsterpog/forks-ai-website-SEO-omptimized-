// A JSON parser written by hand, because the built in one is not good enough
// for a formatter.
//
// Two reasons. First, the error message from JSON.parse is different in every
// engine: V8, SpiderMonkey and JavaScriptCore word it differently and do not
// agree on whether a line and column are included at all. Reporting where the
// error is happens to be the main reason anyone opens a JSON formatter, so it
// cannot depend on the browser.
//
// Second, parsing to JavaScript values and stringifying them back silently
// rewrites the document: 12345678901234567890 comes back as
// 12345678901234567000, 1e400 becomes null, duplicate keys collapse, and keys
// that look like integers get reordered. This parser keeps the original text of
// every number and the original order of every key, so formatting only changes
// the whitespace.

const ESCAPES = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);

class JsonSyntaxError extends Error {
  constructor(message, position) {
    super(message);
    this.name = "JsonSyntaxError";
    this.position = position;
  }
}

function locate(text, position) {
  let line = 1;
  let lineStart = 0;
  const limit = Math.min(position, text.length);
  for (let i = 0; i < limit; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: position - lineStart + 1, lineStart };
}

function lineText(text, lineStart) {
  const end = text.indexOf("\n", lineStart);
  return text.slice(lineStart, end === -1 ? text.length : end);
}

class Parser {
  constructor(text) {
    this.text = text;
    this.pos = 0;
  }

  fail(message, position = this.pos) {
    throw new JsonSyntaxError(message, position);
  }

  peek() {
    return this.text[this.pos];
  }

  atEnd() {
    return this.pos >= this.text.length;
  }

  skipWhitespace() {
    while (this.pos < this.text.length) {
      const code = this.text.charCodeAt(this.pos);
      // Space, tab, line feed and carriage return are the only whitespace JSON
      // allows. A non breaking space pasted out of a web page is not.
      if (code === 32 || code === 9 || code === 10 || code === 13) {
        this.pos++;
      } else if (code === 47) {
        this.fail("Comments are not allowed in JSON. Delete this line or use JSON5 instead.");
      } else {
        return;
      }
    }
  }

  parseDocument() {
    this.skipWhitespace();
    if (this.atEnd()) this.fail("The document is empty. Paste some JSON to check it.");
    const value = this.parseValue();
    this.skipWhitespace();
    if (!this.atEnd()) {
      this.fail(
        `Unexpected ${describe(this.peek())} after the end of the JSON value. A JSON document holds exactly one value.`
      );
    }
    return value;
  }

  parseValue() {
    this.skipWhitespace();
    if (this.atEnd()) this.fail("Unexpected end of input. A value was expected here.");
    const char = this.peek();

    if (char === "{") return this.parseObject();
    if (char === "[") return this.parseArray();
    if (char === '"') return this.parseString();
    if (char === "-" || (char >= "0" && char <= "9")) return this.parseNumber();
    if (char === "'") {
      this.fail("JSON strings use double quotes, not single quotes.");
    }
    if (char === "t") return this.parseLiteral("true");
    if (char === "f") return this.parseLiteral("false");
    if (char === "n") return this.parseLiteral("null");
    if (char === "N" || char === "I") {
      this.fail(`${char === "N" ? "NaN" : "Infinity"} is not a value JSON can represent.`);
    }
    this.fail(`Unexpected ${describe(char)}. A value was expected here.`);
    return null;
  }

  parseObject() {
    const start = this.pos;
    this.pos++; // consume the opening brace
    const entries = [];
    this.skipWhitespace();

    if (this.peek() === "}") {
      this.pos++;
      return { type: "object", entries, start, end: this.pos };
    }

    for (;;) {
      this.skipWhitespace();
      if (this.atEnd()) this.fail("Unexpected end of input. This object is never closed.", start);
      if (this.peek() === "}") {
        this.fail("Trailing comma before the closing brace. JSON does not allow one.");
      }
      if (this.peek() !== '"') {
        this.fail(
          `Property names must be wrapped in double quotes, and this one starts with ${describe(this.peek())}.`
        );
      }

      const key = this.parseString();
      this.skipWhitespace();
      if (this.peek() !== ":") {
        this.fail(
          this.atEnd()
            ? "Unexpected end of input. A colon was expected after the property name."
            : `Expected a colon after the property name, found ${describe(this.peek())}.`
        );
      }
      this.pos++;
      const value = this.parseValue();
      entries.push({ key: key.value, keyRaw: key.raw, value });

      this.skipWhitespace();
      if (this.atEnd()) this.fail("Unexpected end of input. This object is never closed.", start);
      const char = this.peek();
      if (char === ",") {
        this.pos++;
        continue;
      }
      if (char === "}") {
        this.pos++;
        return { type: "object", entries, start, end: this.pos };
      }
      this.fail(`Expected a comma or a closing brace, found ${describe(char)}.`);
    }
  }

  parseArray() {
    const start = this.pos;
    this.pos++; // consume the opening bracket
    const items = [];
    this.skipWhitespace();

    if (this.peek() === "]") {
      this.pos++;
      return { type: "array", items, start, end: this.pos };
    }

    for (;;) {
      this.skipWhitespace();
      if (this.atEnd()) this.fail("Unexpected end of input. This array is never closed.", start);
      if (this.peek() === "]") {
        this.fail("Trailing comma before the closing bracket. JSON does not allow one.");
      }

      items.push(this.parseValue());
      this.skipWhitespace();
      if (this.atEnd()) this.fail("Unexpected end of input. This array is never closed.", start);
      const char = this.peek();
      if (char === ",") {
        this.pos++;
        continue;
      }
      if (char === "]") {
        this.pos++;
        return { type: "array", items, start, end: this.pos };
      }
      this.fail(`Expected a comma or a closing bracket, found ${describe(char)}.`);
    }
  }

  parseString() {
    const start = this.pos;
    this.pos++; // consume the opening quote
    let value = "";

    for (;;) {
      if (this.atEnd()) this.fail("Unexpected end of input. This string is never closed.", start);
      const char = this.text[this.pos];
      const code = this.text.charCodeAt(this.pos);

      if (char === '"') {
        this.pos++;
        return { type: "string", value, raw: this.text.slice(start, this.pos), start, end: this.pos };
      }

      if (code < 0x20) {
        const name = code === 9 ? "A tab" : code === 10 ? "A line break" : "A control character";
        this.fail(`${name} inside a string has to be escaped, as \\t, \\n or \\u00${code.toString(16).padStart(2, "0")}.`);
      }

      if (char === "\\") {
        this.pos++;
        if (this.atEnd()) this.fail("Unexpected end of input in an escape sequence.");
        const escape = this.text[this.pos];
        if (escape === "u") {
          const hex = this.text.slice(this.pos + 1, this.pos + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            this.fail("A \\u escape needs exactly four hexadecimal digits after it.");
          }
          value += String.fromCharCode(parseInt(hex, 16));
          this.pos += 5;
          continue;
        }
        if (!ESCAPES.has(escape)) {
          this.fail(`\\${escape} is not a valid escape sequence in JSON.`);
        }
        value +=
          escape === "b"
            ? "\b"
            : escape === "f"
              ? "\f"
              : escape === "n"
                ? "\n"
                : escape === "r"
                  ? "\r"
                  : escape === "t"
                    ? "\t"
                    : escape;
        this.pos++;
        continue;
      }

      value += char;
      this.pos++;
    }
  }

  parseNumber() {
    const start = this.pos;
    if (this.peek() === "-") this.pos++;

    if (this.atEnd()) this.fail("Unexpected end of input in a number.", start);
    if (this.peek() === "0") {
      this.pos++;
      if (!this.atEnd() && this.peek() >= "0" && this.peek() <= "9") {
        this.fail("A number cannot have a leading zero in JSON.", start);
      }
    } else if (this.peek() >= "1" && this.peek() <= "9") {
      while (!this.atEnd() && this.peek() >= "0" && this.peek() <= "9") this.pos++;
    } else {
      this.fail(`Expected a digit, found ${describe(this.peek())}.`);
    }

    if (this.peek() === ".") {
      this.pos++;
      if (this.atEnd() || this.peek() < "0" || this.peek() > "9") {
        this.fail("A decimal point has to be followed by at least one digit.");
      }
      while (!this.atEnd() && this.peek() >= "0" && this.peek() <= "9") this.pos++;
    }

    if (this.peek() === "e" || this.peek() === "E") {
      this.pos++;
      if (this.peek() === "+" || this.peek() === "-") this.pos++;
      if (this.atEnd() || this.peek() < "0" || this.peek() > "9") {
        this.fail("An exponent has to be followed by at least one digit.");
      }
      while (!this.atEnd() && this.peek() >= "0" && this.peek() <= "9") this.pos++;
    }

    // The raw text is kept rather than the parsed number, so a long integer or
    // a very large exponent survives formatting untouched.
    return { type: "number", raw: this.text.slice(start, this.pos), start, end: this.pos };
  }

  parseLiteral(word) {
    const start = this.pos;
    if (this.text.slice(this.pos, this.pos + word.length) !== word) {
      const found = this.text.slice(this.pos).match(/^[A-Za-z]+/);
      this.fail(
        found
          ? `${found[0]} is not a JSON value. Did you mean ${word}? JSON keywords are lowercase.`
          : `Expected ${word}.`
      );
    }
    this.pos += word.length;
    return { type: "literal", raw: word, start, end: this.pos };
  }
}

function describe(char) {
  if (char === undefined) return "the end of the input";
  if (char === "\n") return "a line break";
  if (char === "\t") return "a tab";
  if (char === " ") return "a space";
  return `"${char}"`;
}

/**
 * Parses text into an AST that keeps raw number text and key order.
 * Returns { ok: true, ast } or { ok: false, error } where the error carries a
 * one-based line and column plus the offending line, ready to display.
 */
export function parseJson(input) {
  // CRLF is collapsed first so the reported column matches the character the
  // user is looking at rather than counting an invisible carriage return.
  const text = input.replace(/\r\n?/g, "\n");
  const parser = new Parser(text);
  try {
    const ast = parser.parseDocument();
    return { ok: true, ast, text };
  } catch (error) {
    if (!(error instanceof JsonSyntaxError)) throw error;
    const position = Math.min(error.position, text.length);
    const { line, column, lineStart } = locate(text, position);
    return {
      ok: false,
      error: {
        message: error.message,
        line,
        column,
        position,
        source: lineText(text, lineStart),
      },
    };
  }
}

function indentString(size) {
  if (size === "tab") return "\t";
  return " ".repeat(size);
}

function writeNode(node, unit, level, sortKeys, out) {
  if (node.type === "object") {
    if (node.entries.length === 0) {
      out.push("{}");
      return;
    }
    const entries = sortKeys
      ? [...node.entries].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
      : node.entries;
    const inner = unit ? "\n" + unit.repeat(level + 1) : "";
    const closing = unit ? "\n" + unit.repeat(level) : "";
    out.push("{");
    entries.forEach((entry, i) => {
      if (i > 0) out.push(",");
      out.push(inner);
      out.push(entry.keyRaw);
      out.push(unit ? ": " : ":");
      writeNode(entry.value, unit, level + 1, sortKeys, out);
    });
    out.push(closing);
    out.push("}");
    return;
  }

  if (node.type === "array") {
    if (node.items.length === 0) {
      out.push("[]");
      return;
    }
    const inner = unit ? "\n" + unit.repeat(level + 1) : "";
    const closing = unit ? "\n" + unit.repeat(level) : "";
    out.push("[");
    node.items.forEach((item, i) => {
      if (i > 0) out.push(",");
      out.push(inner);
      writeNode(item, unit, level + 1, sortKeys, out);
    });
    out.push(closing);
    out.push("]");
    return;
  }

  out.push(node.raw);
}

export function formatJson(ast, { indent = 2, sortKeys = false } = {}) {
  const out = [];
  writeNode(ast, indentString(indent), 0, sortKeys, out);
  return out.join("");
}

export function minifyJson(ast, { sortKeys = false } = {}) {
  const out = [];
  writeNode(ast, "", 0, sortKeys, out);
  return out.join("");
}

// Shape of the document, which is the other thing people want from a formatter:
// how deep it goes and how much of it there is.
export function jsonStats(ast) {
  let keys = 0;
  let values = 0;
  let arrays = 0;
  let objects = 0;
  let depth = 0;

  const walk = (node, level) => {
    depth = Math.max(depth, level);
    if (node.type === "object") {
      objects++;
      keys += node.entries.length;
      for (const entry of node.entries) walk(entry.value, level + 1);
      return;
    }
    if (node.type === "array") {
      arrays++;
      for (const item of node.items) walk(item, level + 1);
      return;
    }
    values++;
  };

  walk(ast, 1);
  return { keys, values, arrays, objects, depth };
}

// Duplicate keys are legal JSON and almost always a bug, since most parsers
// keep only the last one. Worth pointing out rather than silently collapsing.
export function findDuplicateKeys(ast, path = "root", found = []) {
  if (ast.type === "object") {
    const seen = new Set();
    for (const entry of ast.entries) {
      if (seen.has(entry.key)) found.push({ path, key: entry.key });
      seen.add(entry.key);
      findDuplicateKeys(entry.value, `${path}.${entry.key}`, found);
    }
  } else if (ast.type === "array") {
    ast.items.forEach((item, i) => findDuplicateKeys(item, `${path}[${i}]`, found));
  }
  return found;
}
