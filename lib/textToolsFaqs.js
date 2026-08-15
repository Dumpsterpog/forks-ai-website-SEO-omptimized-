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
