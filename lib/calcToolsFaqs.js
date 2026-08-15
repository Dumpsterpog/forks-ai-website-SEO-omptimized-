// FAQ copy for the six everyday calculators. Lives outside the client
// components because each page.js is a Server Component and needs the same
// text to build its FAQPage schema. The rendered answer and the structured
// answer stay identical by construction, which is what Google's structured
// data guidelines ask for.

export const AGE_FAQS = [
  {
    q: "How do you calculate age in years, months and days?",
    a: "Count whole years first, then whole months, then the days left over. The calculator does it by finding the largest number of whole months between the two dates and measuring the remainder in days from there, which avoids the negative day counts that simpler methods produce around short months.",
  },
  {
    q: "How does this handle leap years?",
    a: "February is treated as 29 days in a year divisible by 4, except centuries that are not divisible by 400. So 2000 and 2024 have a 29 February and 1900 and 2100 do not. The total day count is a real calendar day count, so every leap day between the two dates is included.",
  },
  {
    q: "What happens if I was born on 29 February?",
    a: "Your exact age in years, months and days is still precise, because it is measured from the real date. For the next birthday countdown in a year with no 29 February, the calculator uses 28 February and says on screen that it has done so. Different countries and institutions handle this differently, so check what your own paperwork says if it matters legally.",
  },
  {
    q: "Why do some age calculators disagree with each other by a day?",
    a: "Almost always because of how they borrow days across a month boundary. From 31 January to 1 March, one method says one month and one day and another says one month and minus one day, which then gets patched into something wrong. This page adds months with the day clamped to the length of the month it lands in, so 31 January plus one month is 28 or 29 February and the remainder is never negative.",
  },
  {
    q: "Can I work out age on a date other than today?",
    a: "Yes. Switch the second date away from today and put in any date you like. That is how you check an age on an application cut-off date or an exam eligibility date rather than on the day you happen to be looking.",
  },
  {
    q: "Is the age calculator free?",
    a: "Yes. It runs entirely in your browser, there is no account and no signup, and neither date you type is sent anywhere.",
  },
];

export const PERCENTAGE_FAQS = [
  {
    q: "How do I work out what percent one number is of another?",
    a: "Divide the part by the whole and multiply by 100. 45 out of 60 is 45 divided by 60, which is 0.75, so 75%. The first mode on this page does exactly that as you type.",
  },
  {
    q: "How do I find a percentage of a number?",
    a: "Divide the percentage by 100 and multiply by the number. 18% of 250 is 0.18 multiplied by 250, which is 45. The second mode also shows what is left over after taking that share away.",
  },
  {
    q: "How do I calculate percentage increase or decrease?",
    a: "Subtract the old value from the new one, divide by the old value, and multiply by 100. Going from 80 to 100 is 20 divided by 80, which is 25%, an increase. Going from 100 to 80 is minus 20 divided by 100, which is a 20% decrease. The two are not the same size, which is why the order of the numbers matters.",
  },
  {
    q: "Why can I not calculate a percentage increase from zero?",
    a: "Because the formula divides by the starting number, and dividing by zero has no answer. A rise from 0 to 40 is an increase of 40 in absolute terms, but there is no percentage that describes it. The calculator says so and shows you the absolute change instead of printing infinity.",
  },
  {
    q: "Does a 20% rise followed by a 20% fall get me back to where I started?",
    a: "No. 100 rises by 20% to 120, then falls by 20% of 120, which is 24, landing on 96. Each percentage is taken from a different base, so they do not cancel. Use the third mode with your actual start and end values rather than adding the percentages up.",
  },
  {
    q: "What is the difference between percent and percentage points?",
    a: "If a rate moves from 20% to 25%, that is a rise of 5 percentage points, and also a 25% increase in the rate itself. Both statements are true and they describe different things. Use percentage points when the quantity you are comparing is already a percentage.",
  },
];

export const MARKS_FAQS = [
  {
    q: "How do I calculate the percentage of marks?",
    a: "Add up the marks you obtained across every subject, add up the maximum marks across the same subjects, divide the first total by the second and multiply by 100. This page keeps a separate maximum for each subject, so a 50 mark paper and a 100 mark paper are weighted correctly rather than averaged as if they were equal.",
  },
  {
    q: "Why not just average the per-subject percentages?",
    a: "Because that treats every subject as equally weighted, which is only true when every paper is out of the same total. If you score 90% on a 25 mark paper and 60% on a 100 mark paper, the average of the two percentages is 75% but the real overall percentage is 66%. The calculator uses the marks, not the percentages.",
  },
  {
    q: "Can I add more subjects?",
    a: "Yes. Use the add subject button for as many rows as you need, and remove any row you do not want counted. Rows you have not filled in are ignored, so the running total stays correct while you are still typing.",
  },
  {
    q: "Can each subject have a different maximum?",
    a: "Yes, and that is the point of this page. Practicals out of 50, theory out of 100 and an internal out of 20 can all sit in the same list, and the total maximum adds up from whatever you enter.",
  },
  {
    q: "How do I include internal assessment or practical marks?",
    a: "Add them as their own rows with their own maximum marks. If your university instead scales a subject to a fixed weight before combining, apply that scaling first and enter the scaled numbers, because weighting rules differ between institutions.",
  },
  {
    q: "Does this convert my percentage to a grade or CGPA?",
    a: "No, because grade boundaries and conversion rules differ between boards and universities. Use the CGPA to percentage converter for the common conversion rules, and check your own academic regulations for the one that applies to you.",
  },
];

export const SGPA_CGPA_FAQS = [
  {
    q: "How do I convert SGPA to CGPA?",
    a: "Multiply each semester's SGPA by the credits that semester carried, add those products together, and divide by the total credits. That credit weighting is what turns several semester figures into one cumulative figure.",
  },
  {
    q: "Can I just average my SGPAs?",
    a: "Only if every semester carried exactly the same number of credits. When credits differ, a plain average and a credit-weighted CGPA give different answers, and the credit-weighted one is what a transcript shows. The calculator prints both so you can see the gap.",
  },
  {
    q: "What SGPA do I need next semester to reach my target CGPA?",
    a: "The reverse mode answers that. It takes your current CGPA, the credits behind it, the credits still to come and your target, then solves for the average the remaining credits have to hit. If that number is above the top of your scale it says the target is out of reach and shows the best CGPA still available.",
  },
  {
    q: "Do all universities calculate CGPA the same way?",
    a: "No. Credit weighting is the common core, but institutions differ on whether failed or repeated papers count, whether audit courses carry credits, how a supplementary attempt is treated and whether the figure is rounded or truncated. Check your own academic regulations, because your university's rule is the one that appears on your transcript.",
  },
  {
    q: "Does this work on a 4-point scale?",
    a: "Yes. Set the scale to 4 and enter your semester GPAs on that scale. The arithmetic is identical, only the ceiling changes, and the validation follows the scale you picked.",
  },
  {
    q: "How do I turn my CGPA into a percentage?",
    a: "That is a separate conversion with its own institution-specific rule, so it lives on the CGPA to percentage converter rather than here. That page names the formula it applies rather than picking one silently.",
  },
];

export const NEGATIVE_MARKING_FAQS = [
  {
    q: "How is a score with negative marking calculated?",
    a: "Multiply the number of correct answers by the marks each correct answer earns, then subtract the number of wrong answers multiplied by the penalty for each wrong answer. Questions you left blank score nothing and cost nothing under the schemes this page models.",
  },
  {
    q: "What marking scheme should I choose?",
    a: "Use the one printed in your own exam's instructions. The presets here are common patterns, such as four marks for a correct answer with one deducted for a wrong one, offered as starting points rather than as any particular exam board's official rule. Marking schemes change between sessions and between papers, so read the paper.",
  },
  {
    q: "Can my score go negative?",
    a: "Yes, if the penalties outweigh what you earned. The calculator shows the negative figure rather than clamping it to zero, because a paper that deducts more than you scored is exactly the situation worth seeing clearly. Whether your exam floors the total at zero is a rule of that exam, not of the arithmetic.",
  },
  {
    q: "How many questions do I need to guess right for guessing to be worth it?",
    a: "Break even is where the marks gained equal the marks lost, which works out as the penalty divided by the sum of the penalty and the marks per correct answer. Under a scheme awarding four with one deducted, that is one in five, or 20% accuracy. Above that rate guessing gains marks on average, below it guessing costs marks. The calculator prints this figure for whatever scheme you enter.",
  },
  {
    q: "What is accuracy here?",
    a: "Correct answers divided by attempted answers, as a percentage. It deliberately ignores the questions you skipped, because it measures how reliable you were when you did commit to an answer. The attempt rate is shown separately.",
  },
  {
    q: "Is this calculator free?",
    a: "Yes. It runs in your browser, needs no account, and nothing you enter leaves your device.",
  },
];

export const UNIT_CONVERTER_FAQS = [
  {
    q: "How do I convert Celsius to Fahrenheit?",
    a: "Multiply by 9, divide by 5, then add 32. So 20C is 68F and 100C is 212F. Going the other way, subtract 32 first, then multiply by 5 and divide by 9.",
  },
  {
    q: "Why is temperature different from the other conversions?",
    a: "Length, weight and area scales all start at the same zero, so converting is a single multiplication. Temperature scales have different zero points, so Celsius to Fahrenheit needs an offset of 32 as well as a factor, and Kelvin sits 273.15 below Celsius. That offset is why you cannot convert a temperature by scaling alone.",
  },
  {
    q: "What is 0 Celsius in Fahrenheit and Kelvin?",
    a: "0C is exactly 32F and exactly 273.15K. Another useful anchor is minus 40, which is the one temperature where Celsius and Fahrenheit read the same number.",
  },
  {
    q: "How many feet are in a metre?",
    a: "One metre is about 3.2808399 feet, because a foot is defined as exactly 0.3048 metres. The tool uses the exact definition and then shows the result to eight significant figures rather than rounding early.",
  },
  {
    q: "Are the conversion factors exact?",
    a: "The imperial to metric factors used here are the internationally agreed definitions, which are exact: an inch is exactly 25.4 millimetres, a pound is exactly 0.45359237 kilograms, and the area units follow from squaring the length ones. Any rounding you see is in the display, not in the arithmetic.",
  },
  {
    q: "Does this convert weight or mass?",
    a: "Mass, which is what kilograms and pounds measure in everyday use. Converting a kilogram to a pound assumes standard gravity, which is the assumption behind every bathroom scale, so for ordinary purposes the answer is the one you want.",
  },
];
