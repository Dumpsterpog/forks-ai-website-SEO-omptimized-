// FAQ copy for the four free tool pages. Lives outside the client components
// because each page.js is a Server Component and needs the same text to build
// its FAQPage schema. Rendered answer and structured answer stay identical by
// construction, which is what Google's structured data guidelines ask for.

export const ATTENDANCE_FAQS = [
  {
    q: "Why is 75% attendance the number everyone talks about?",
    a: "Most Indian universities and affiliated colleges set a minimum attendance requirement for exam eligibility, and 75% is the most common figure. It is a rule set by each institution, not a national law, so some departments use 80%, some allow a lower figure with a medical certificate, and some count practicals separately. The calculator defaults to 75% and lets you change it to whatever your own handbook says.",
  },
  {
    q: "How many classes can I skip if I am at exactly 75%?",
    a: "None. At exactly the threshold, the next class you miss puts you below it. The calculator returns zero in that case rather than rounding up to a friendlier number.",
  },
  {
    q: "How is the number of classes I can skip calculated?",
    a: "It solves attended divided by held plus skipped, greater than or equal to your threshold, for the largest whole number of skips. Because you cannot skip part of a class, the result is rounded down, so the answer is always safe rather than optimistic.",
  },
  {
    q: "Does this account for classes that have not happened yet?",
    a: "The skip answer assumes the only classes left to count are the ones you skip. If your semester has more classes scheduled after that, attending them will push your percentage back up, so treat the skip number as the worst case rather than a hard limit.",
  },
  {
    q: "My college counts each subject separately. Does that matter?",
    a: "Yes, and it matters a lot. If attendance is tracked per subject, run the calculator once per subject with that subject's own attended and held counts. An overall average can hide one subject sitting below the line.",
  },
  {
    q: "Is this attendance calculator free?",
    a: "Yes. It runs entirely in your browser, there is no account and no signup, and nothing you type is sent anywhere.",
  },
];

export const FINAL_GRADE_FAQS = [
  {
    q: "What do I need on my final exam to pass?",
    a: "Enter your current grade, the weight of the final exam, and the overall grade you are aiming for. The calculator returns the exact score the final has to earn. If that score is above 100 it says the target is out of reach and tells you the best grade still available to you.",
  },
  {
    q: "What does current grade mean here?",
    a: "It is your weighted average across everything that has already been marked, expressed as a percentage. If assignments, internals and quizzes make up 70% of the course and you are averaging 82% across them, your current grade is 82.",
  },
  {
    q: "Where do I find my final exam weight?",
    a: "It is in the course outline or syllabus, usually in the assessment breakdown table. If the final is described as worth 40 marks out of a 100 mark course, the weight is 40%.",
  },
  {
    q: "Why do most final grade calculators show impossible numbers?",
    a: "Because they print the raw result of the formula without checking it. A required score of 180% is arithmetically correct and practically useless. This page states plainly when a target cannot be reached and shows the highest grade you can still finish with.",
  },
  {
    q: "What does it mean when the answer is 0%?",
    a: "It means the grade you already carry into the exam is enough to hit your target even if you score nothing on the final. The page also shows the grade you are guaranteed at a zero, so you can see how much room you have.",
  },
  {
    q: "Does this work for letter grades?",
    a: "Work in percentages, then map the result to your institution's letter grade scale. Grade boundaries differ between universities, so converting for you would mean guessing at your scale.",
  },
];

export const CGPA_FAQS = [
  {
    q: "How do I convert CGPA to percentage?",
    a: "The most widely used rule in India is percentage equals CGPA multiplied by 9.5. This is the CBSE convention, and most universities and recruiters expect it. A CGPA of 8.5 becomes 80.75%.",
  },
  {
    q: "Why 9.5 and not 10?",
    a: "The CBSE multiplier came from averaging the mid points of the percentage bands behind each grade point. It is a convention, not a law of arithmetic, which is why some institutions use a straight multiplication by 10 and others subtract a fixed amount before multiplying. The converter lets you pick the rule and always names the one it applied.",
  },
  {
    q: "How do I convert a 4-point GPA to a percentage?",
    a: "Divide the GPA by 4 and multiply by 100, which is the same as multiplying by 25. A GPA of 3.5 becomes 87.5%. This is a linear mapping and it ignores the fact that many 4-point systems have uneven grade bands, so treat it as an approximation.",
  },
  {
    q: "Which formula does my university use?",
    a: "Check your academic regulations, transcript legend or the conversion certificate your examination office issues. Universities genuinely differ, and the number on an official conversion certificate is the one that counts for applications and job forms.",
  },
  {
    q: "Can I convert a 10-point CGPA straight to a 4-point GPA?",
    a: "Only approximately. This converter goes through percentage in both directions, which stacks two separate conventions. It is fine for a rough idea, but for university applications use the official conversion your institution or the receiving university specifies.",
  },
  {
    q: "Is my data sent anywhere?",
    a: "No. The conversion is a few lines of arithmetic that run in your browser. Nothing is uploaded and no account is needed.",
  },
];

export const TEXT_TO_FLASHCARDS_FAQS = [
  {
    q: "How does this turn text into flashcards without AI?",
    a: "It looks for the separator you already used when writing your notes. Q: and A: lines, a tab between two columns, a spaced dash, a colon, or fronts and backs on alternating lines. Each pattern is a simple string split, so the result is predictable and you can see exactly why a card came out the way it did.",
  },
  {
    q: "What format should I paste?",
    a: "Any of the five listed above. Leave the format on automatic and the page will pick the one that best fits your text, then tell you which it chose. If it guesses wrong, override it from the dropdown.",
  },
  {
    q: "Can I fix a card before exporting?",
    a: "Yes. Every parsed card is editable in the preview, and you can delete any card or add a blank one. The exports use whatever is in the preview at the time you click.",
  },
  {
    q: "How do I import the file into Anki?",
    a: "Download the Anki TSV export, then in Anki choose File, then Import, pick the file, set the field separator to Tab, and map field 1 to Front and field 2 to Back. The export writes one card per line with no header row.",
  },
  {
    q: "Does the CSV work with Quizlet and spreadsheets?",
    a: "Yes. The CSV is standard comma separated text with no header row, quoted where a field contains a comma or a quote mark, so it opens cleanly in Excel, Google Sheets and Quizlet's import box.",
  },
  {
    q: "Is anything I paste uploaded?",
    a: "No. Parsing, editing, exporting and printing all happen in your browser. Your notes never leave the page and no account is required.",
  },
];
