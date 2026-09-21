# FORKSAI

### Turn your study material into your next study session.

AI flashcards, notes, revision tools, and practical study resources for **university students, high school students, and medical students**.

**[Start studying](https://forksai.app)** · **[Free tools](https://forksai.app/tools)** · **[Study guides](https://forksai.app/blogs)** · **[Student study kit](https://forksai.app/resources/student-study-kit)**

---

## From reading to remembering

Having notes is only the beginning. FORKSAI helps students turn study material into editable flashcards and summaries, practise recalling what they have learned, and build a more deliberate revision routine.

Start with one topic. Create your cards, check them against your source material, and use your mistakes to decide what to review next.

| What you want to do | Explore FORKSAI |
| --- | --- |
| Create flashcards from study material | [AI flashcards](https://forksai.app/ai-flashcards) |
| Turn a PDF into revision cards | [PDF to flashcards](https://forksai.app/pdf-to-flashcards) |
| Condense material before revision | [AI summarizer](https://forksai.app/ai-summarizer) |
| Explore AI-assisted study workflows | [AI study tools](https://forksai.app/ai-study-tools) |
| Practise with learning modes | [Learning tools](https://forksai.app/learn) |
| Organize your study notes | [Notes](https://forksai.app/notes) |

The free plan includes one AI-generated deck, unlimited manual decks, seven non-AI study modes, and two Quick Study sessions per week. See [current plans and limits](https://forksai.app/#pricing) for paid options.

AI-generated material can contain errors. Check important facts against your course materials. Medical study content is for education and revision; it is not clinical guidance.

## Built around your course

- **[University students](https://forksai.app/for/university-students):** turn lecture material into focused revision and practise before exams.
- **[High school students](https://forksai.app/for/high-school-students):** break large subjects into manageable topics and review regularly.
- **[Medical students](https://forksai.app/for/medical-students):** build focused decks, check terminology, and track gaps in recall.

## Free tools for everyday student work

Use these tools directly on the FORKSAI website:

| Tool | Use it to |
| --- | --- |
| [Attendance calculator](https://forksai.app/attendance-calculator) | Plan attendance against your target |
| [Final grade calculator](https://forksai.app/final-grade-calculator) | Work out the score needed for a target grade |
| [Marks percentage calculator](https://forksai.app/marks-percentage-calculator) | Convert marks into a percentage |
| [Negative marking calculator](https://forksai.app/negative-marking-calculator) | Estimate exam scores and understand guessing thresholds |
| [Text to flashcards](https://forksai.app/text-to-flashcards) | Prepare flashcards from text |
| [GPA calculator](https://forksai.app/gpa-calculator) | Calculate a credit-weighted GPA |
| [Pomodoro study timer](https://forksai.app/pomodoro-timer) | Run adjustable focus and break intervals |
| [Exam study planner](https://forksai.app/study-planner) | Turn an exam date into a daily revision target |
| [Word counter](https://forksai.app/word-counter) | Check the length of an assignment or draft |
| [Merge PDF](https://forksai.app/merge-pdf) | Combine documents for easier organization |

**[Browse the complete free tools directory →](https://forksai.app/tools)**

## A study kit you can actually use

The **[Student Study Kit](https://forksai.app/resources/student-study-kit)** contains simple downloadable templates:

- [Weekly revision planner](https://forksai.app/resources/weekly-revision-planner.txt) — choose topics and schedule review sessions.
- [Practice-question error log](https://forksai.app/resources/practice-question-error-log.txt) — record mistakes and decide what to revisit.
- [Flashcard quality checklist](https://forksai.app/resources/flashcard-quality-checklist.txt) — write clearer questions and more focused answers.

These templates may be copied and shared without required attribution. This permission applies to the templates; it does not grant a license to the application code.

## Learn how to study more effectively

Start with a method, then choose the tool that fits it:

- [Active recall](https://forksai.app/blog/active-recall)
- [Spaced repetition](https://forksai.app/blog/spaced-repetition)
- [RemNote vs Notion](https://forksai.app/blog/remnote-vs-notion)
- [AI study tools for nursing students](https://forksai.app/blog/ai-study-tool-nursing-students)
- [Flashcard apps for medical school](https://forksai.app/blog/best-flashcard-app-medical-school)

Comparing study apps? Explore the [Quizlet alternative](https://forksai.app/quizlet-alternative), [Anki alternative](https://forksai.app/anki-alternative), and [RemNote alternative](https://forksai.app/remnote-alternative) pages.

**[Read all study guides →](https://forksai.app/blogs)**

---

## About this repository

This repository contains the **FORKSAI marketing website**: public product pages, student landing pages, study guides, and free tools. The study dashboard is available at [dashboard.forksai.app](https://dashboard.forksai.app).

Built with **Next.js 16, React 19, and Tailwind CSS 4**.

| Directory | Contents |
| --- | --- |
| `app/` | App Router pages, metadata, route handlers, sitemap, and robots configuration |
| `components/` | Shared layouts and interface components |
| `lib/` | Shared content, product configuration, and helpers |
| `public/` | Static assets and downloadable study resources |
| `scripts/` | Repository maintenance and SEO audit scripts |

## Local development

Use a Node.js version supported by the installed Next.js release.

```bash
npm ci
```

Copy `.env.example` to `.env.local` and configure the values needed for the features you are running. `OLD_APP_ORIGIN` points to the existing application used by configured proxy routes. Firebase Admin variables are optional for the free-tool usage counter. Never commit credentials or `.env.local`.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Build and verification

```bash
npm run build
npm run seo:audit
npm run lint
```

The SEO audit uses the production build to check generated public pages for broken internal links and orphan pages. Run it after building. It excludes authenticated routes, API routes, and framework error pages. Use Search Console to assess indexing and search performance.

To serve the production build locally:

```bash
npm run start
```

When adding a public page, provide clear page content, accurate metadata, and relevant internal links. Check sitemap inclusion and keep product claims consistent with the shared configuration.

## Questions and feedback

Visit the [FAQ](https://forksai.app/faq) or email [team.forksai@gmail.com](mailto:team.forksai@gmail.com).

**[Explore FORKSAI →](https://forksai.app)**
