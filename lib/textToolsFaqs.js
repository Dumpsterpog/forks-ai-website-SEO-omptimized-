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
