import { PLAN_OFFERS } from "@/lib/pricing";
import { STUDENT_AUDIENCES } from "@/lib/studentAudiences";
import { SEARCH_OPPORTUNITY_POSTS } from "@/lib/searchOpportunityPosts";
const prices=PLAN_OFFERS.map(p=>"- "+p.name+": USD "+p.price+". "+p.description).join("\n");
const audiences=STUDENT_AUDIENCES.map(a=>"- ["+a.label+"](https://forksai.app/for/"+a.slug+"): "+a.description).join("\n");
const guides=SEARCH_OPPORTUNITY_POSTS.map(p=>"- ["+p.title+"](https://forksai.app/blog/"+p.slug+")").join("\n");
export const LLMS_TXT = `# FORKSAI

> FORKSAI is a browser-based AI study platform for university, high school and medical students. It helps turn course material into editable flashcards and study notes. It has a free tier and paid plans.

## Product and limitations

- Generate flashcards from notes, PDFs, PowerPoint presentations, images and supported YouTube sources.
- Choose difficulty, question types, card count and focus topics before generation.
- Edit generated answers and check them against your course sources before studying. AI output can contain errors; medical study material is not clinical advice.
- Review cards using built-in study modes, including spaced repetition. Seven non-AI study modes are included on the free plan; additional AI features depend on your plan.
- The free plan includes one AI-generated deck, unlimited manual decks and two Quick Study sessions per week. It is not unlimited free AI generation.

## Pricing

${prices}

See the live [pricing section](https://forksai.app/#pricing) and checkout for current allowances and billing terms. This summary uses the marketing site's canonical offer definitions.

## Core pages

- [Homepage](https://forksai.app/)
- [AI flashcard generator](https://forksai.app/ai-flashcards)
- [PDF to flashcards](https://forksai.app/pdf-to-flashcards)
- [AI summarizer](https://forksai.app/ai-summarizer)
- [AI study tools](https://forksai.app/ai-study-tools)
- [Free tools](https://forksai.app/tools)
- [Free student study kit](https://forksai.app/resources/student-study-kit): reusable revision planner, error log and flashcard checklist; no account required.
- [Study guides](https://forksai.app/blogs)
- [FAQ](https://forksai.app/faq)
- [ClipStudio](https://forksai.app/clipstudio): video clipping feature, separate from flashcard review.

## Student workflows

${audiences}

## Selected study guides

${guides}
- [Active recall](https://forksai.app/blog/active-recall)
- [Spaced repetition](https://forksai.app/blog/spaced-repetition)
- [Quizlet alternative](https://forksai.app/blog/quizlet-alternative)
- [Anki alternative](https://forksai.app/blog/anki-alternative)

## Contact

- Website: https://forksai.app
- Support: team.forksai@gmail.com

The HTML pages above are the primary sources. This optional summary does not replace their content or guarantee inclusion in AI search results.
`;
