// FAQ copy for the six text and developer tools. Lives outside the client
// components because each page.js is a Server Component and needs the same text
// to build its FAQPage schema. Rendered answer and structured answer stay
// identical by construction, which is what the structured data guidelines ask
// for.

export const DIFF_CHECKER_FAQS = [
  {
    q: "Is my text uploaded anywhere when I compare it?",
    a: "No. The comparison runs in your browser as ordinary JavaScript, so both texts stay on your device. You can disconnect from the network and the tool still works, which matters when you are diffing a contract, a patient note or unreleased code.",
  },
  {
    q: "How does the comparison decide which lines match?",
    a: "It computes the longest common subsequence of the two line lists, which is the same idea behind the diff command and version control. That is why inserting one line at the top shows as a single addition instead of marking every line below it as changed.",
  },
  {
    q: "What is the difference between the side by side and inline views?",
    a: "Side by side puts the original on the left and the changed version on the right, which suits reading two drafts. Inline stacks removals and additions in one column with minus and plus markers, which is how a patch or a pull request reads.",
  },
  {
    q: "Why is one line marked as changed rather than as a removal plus an addition?",
    a: "When a removed line and an added line sit in the same spot, they are almost always the same line after an edit, so they are paired into one changed row and compared again word by word. The highlighting inside the row shows exactly which words moved.",
  },
  {
    q: "Can I ignore whitespace or capitalisation?",
    a: "Yes. Ignoring whitespace collapses runs of spaces and trims the ends of each line before comparing, and ignoring case compares without capitalisation. Both options only affect the comparison, never the text that is displayed or copied.",
  },
  {
    q: "How large a text can it handle?",
    a: "Documents of a few thousand lines compare in well under a second. Beyond that the tool splits the work at lines that appear exactly once in both texts, so very large files stay responsive instead of exhausting the tab's memory.",
  },
];

export const PASSWORD_GENERATOR_FAQS = [
  {
    q: "Is the password generated on my device or on a server?",
    a: "On your device. The page calls crypto.getRandomValues in your browser, so the password exists only in this tab and is never sent anywhere. You can turn off your network connection and keep generating.",
  },
  {
    q: "What makes this random enough for a password?",
    a: "It uses the browser cryptographic generator rather than Math.random. Math.random is a fast statistical generator with a predictable internal state, which is fine for animations and unsuitable for secrets. Each character is also drawn with rejection sampling, so no character is slightly more likely than another.",
  },
  {
    q: "What does the entropy in bits actually mean?",
    a: "It is the size of the space the password was drawn from, expressed as a power of two. A password of L characters from a pool of P characters has L multiplied by the base two logarithm of P bits, because there are P to the power L equally likely results. Sixteen characters from the 62 letter and digit pool is 95.3 bits.",
  },
  {
    q: "Why show bits instead of a strength score out of five?",
    a: "Because the bits are a calculation and the score is a guess. Coloured meters usually reward a capital letter and a trailing exclamation mark, which is why Password1! scores well and falls in seconds. Entropy measures how the password was generated, which is the thing that decides how long guessing takes.",
  },
  {
    q: "How long should my password be?",
    a: "Long enough to clear roughly 80 bits for anything that matters, which is 13 characters from the letters and digits pool or 12 with symbols added. Length buys more than character variety does, so going from 12 to 16 characters helps more than adding one punctuation mark.",
  },
  {
    q: "Should I exclude ambiguous characters?",
    a: "Only when a human has to read the password back, from a printed sheet or over the phone, since it removes the pairs that look alike in most fonts. It shrinks the pool and therefore the entropy, and the figure on the page updates to show exactly how much, so add a character or two of length to compensate.",
  },
];

export const JSON_FORMATTER_FAQS = [
  {
    q: "Is my JSON sent to a server to be formatted?",
    a: "No. The parser and the formatter both run in your browser, so the document stays on your device. That matters more here than on most tools, because the JSON people paste into a formatter is usually an API response with real customer data or a token in it.",
  },
  {
    q: "How does it find the line and column of an error?",
    a: "The page parses the JSON with its own parser rather than handing it to the browser. The built in JSON.parse reports errors differently in every engine, and some do not give a line and column at all. Parsing it here means the position is exact and identical in every browser.",
  },
  {
    q: "Why does it say a trailing comma is invalid when my editor accepts it?",
    a: "Because JSON itself does not allow one, even though JavaScript object literals, JSON5 and most editors do. The same goes for comments, single quoted strings and unquoted property names. If you need those, what you have is JSON5 or a JavaScript object, not JSON.",
  },
  {
    q: "Does formatting change my data?",
    a: "Only the whitespace. The formatter keeps the original text of every number, the original order of every key and any duplicate keys, because parsing into JavaScript values and back would rewrite them. A long integer would lose its last digits, a huge exponent would turn into null, and keys that look like integers would be reordered.",
  },
  {
    q: "What indent size should I use?",
    a: "Two spaces is the common default for JSON and keeps deeply nested documents readable on a narrow screen. Four suits configuration files that people read more than they scroll. Tabs let each reader choose their own width, which some teams prefer. Minified is for sending over the network, not for reading.",
  },
  {
    q: "What does it mean when it warns about duplicate keys?",
    a: "The same property name appears twice in one object. That is technically legal JSON, but almost every parser keeps only the last one, so it is nearly always a bug in whatever produced the document. The tool points at the object it found them in rather than silently dropping one.",
  },
];

export const BASE64_FAQS = [
  {
    q: "Is my text or file uploaded when I encode it?",
    a: "No. Encoding and decoding both happen in your browser, and a file you choose is read from disk into memory in this tab rather than sent anywhere. Nothing is uploaded, logged or stored.",
  },
  {
    q: "Why do accented characters and emoji break in other base64 tools?",
    a: "Because base64 encodes bytes, not characters, and the browser btoa function assumes one byte per character. Emoji make it throw an error outright. Accented letters are worse: btoa quietly encodes the Latin-1 byte, so cafe with an accent comes back as mojibake instead of failing. This tool converts to UTF-8 bytes with TextEncoder first, so both survive exactly.",
  },
  {
    q: "What is URL safe base64?",
    a: "Standard base64 uses plus and slash, which both have a meaning inside a URL and get percent-encoded when you paste them into one. The URL safe variant swaps them for dash and underscore, and usually drops the trailing equals signs. JSON web tokens use it, which is why a JWT decodes here and not in a strict decoder.",
  },
  {
    q: "Why did my base64 get about a third bigger?",
    a: "Base64 stores three bytes in four characters, so the encoded form is always around 33 percent larger than the original plus a little padding. That is the cost of moving binary data through something that only accepts text, and it is the reason not to base64 large images into your HTML.",
  },
  {
    q: "Do I need the equals signs at the end?",
    a: "They pad the data out to a whole number of four character groups. Some systems require them and others strip them, so this decoder restores them for you if they are missing. It also ignores line breaks, which base64 in email headers and PEM certificates always has.",
  },
  {
    q: "Is base64 a form of encryption?",
    a: "No, and this is worth being blunt about. It is an encoding, fully reversible by anyone, with no key involved. Anything you base64 is as readable as the original to anyone who pastes it into a decoder like this one, so it hides nothing.",
  },
];

export const URL_ENCODE_FAQS = [
  {
    q: "What is the difference between encodeURI and encodeURIComponent?",
    a: "encodeURIComponent escapes the reserved characters, so a slash becomes %2F and an ampersand becomes %26. encodeURI leaves those alone, because in a whole URL they are structure rather than data. Use encodeURIComponent for one query parameter value or path segment, and encodeURI for a complete address that only needs its spaces and non ASCII characters fixed.",
  },
  {
    q: "Which one should I use for a query string value?",
    a: "encodeURIComponent, every time. If the value contains an ampersand or an equals sign and you used encodeURI, those characters survive unescaped and the server reads them as the start of the next parameter, which truncates your value or invents one that was never sent.",
  },
  {
    q: "Why does a space sometimes become %20 and sometimes a plus sign?",
    a: "Both are correct, in different places. Percent encoding says %20. The application/x-www-form-urlencoded format, which HTML forms submit and most query strings use, says a plus sign. A plus in a path segment stays a literal plus, which is why decoding with the wrong rule turns plus signs into spaces that were never there.",
  },
  {
    q: "Is the encoding done on your server?",
    a: "No. It runs in your browser, so the URL, the token or the search query you paste stays on your device and is never uploaded or logged.",
  },
  {
    q: "Why did my decode fail with a malformed escape error?",
    a: "A percent sign has to be followed by exactly two hexadecimal digits, so a literal percent in text has to be written %25. A stray percent, as in a copied 100% figure, breaks decoding. The other cause is a multi byte character that was copied in half, which leaves valid looking escapes that do not spell out valid UTF-8.",
  },
  {
    q: "Does percent encoding hide anything?",
    a: "No. It is a formatting rule, not a security measure. Anyone can decode it in one step, so a token or an email address in a URL is exactly as readable after encoding as before.",
  },
];
