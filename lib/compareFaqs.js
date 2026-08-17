// FAQ copy for the comparison and alternative pages. Lives outside the client
// components because each page.js is a Server Component and needs the same
// text to build its FAQPage schema, which keeps the rendered answer and the
// structured answer identical by construction.
//
// Rule for every answer in this file: anything specific is about FORKSAI.
// Statements about another product stay at the level of that product's own
// public positioning, and no answer quotes a competitor's price, quota or
// feature list, because those move and a stale answer here would be a lie
// with a schema wrapped around it.

export const REMNOTE_ALTERNATIVE_FAQS = [
  {
    q: "What is the closest alternative to RemNote?",
    a: "It depends on which half of RemNote you actually use. If you mostly use it as a knowledge base and the flashcards are a bonus, you want another notes-first tool. If you mostly use it to revise and the note-taking is a means to an end, you want a study tool that builds the deck for you. FORKSAI is the second kind: you give it a PDF, pasted notes, a YouTube link or a photo of a page, and it produces a flashcard deck you can start reviewing straight away.",
  },
  {
    q: "Can I move my existing cards into FORKSAI?",
    a: "Yes, if you can get them out as a file. FORKSAI imports Quizlet exports, Anki decks as .txt or .apkg, and plain CSV or TXT. The import runs as a three step flow: pick the source, upload the file, then review and edit the parsed cards before anything is saved, so a messy export does not silently become a messy deck.",
  },
  {
    q: "Does FORKSAI use spaced repetition?",
    a: "Yes. The spaced repetition mode runs FSRS-5, the scheduling algorithm that replaced the older SM-2 family, and you rate each card from 1 to 4 on how confident you were. Cards you keep forgetting come back sooner, and the Weak Spot Trainer mode pulls out only the cards with a high forget count and loops until you clear them.",
  },
  {
    q: "Do I still get notes, or is it only flashcards?",
    a: "You get both. FORKSAI turns a PDF into structured notes in four styles: structured, Cornell, narrative or outline, with a detail level and a focus area you choose. There is also a summarizer with a rich text editor and a manual notes editor. Notes and decks sit in the same library, in the same folders.",
  },
  {
    q: "Is FORKSAI free?",
    a: "There is a free plan. It covers one AI-generated deck with no cap on the cards in it, unlimited manual decks, the study modes, live study rooms, the public decks library and progress tracking. Podcast Mode, the Medical Encyclopedia, Interactive Mind Maps and Case Study Mode are on the paid plan. Current prices and limits are on the FORKSAI homepage, which is the only place we quote them so they cannot go stale here.",
  },
  {
    q: "Is FORKSAI good for medical students?",
    a: "It is one of the groups it is built around. Alongside the normal deck tools there is a Medical Encyclopedia that returns an anatomy and location breakdown for any medical term, with physiology and clinical significance on the paid plan, plus image occlusion for labelling diagrams and a Case Study Mode that generates a scenario from your deck.",
  },
  {
    q: "How long does it take to get a deck out of a PDF?",
    a: "Usually well under a minute for a normal chapter. You upload the file, pick a difficulty, the question types and roughly how many cards you want, and the cards land one at a time as they are generated so you can see what you are getting before it finishes.",
  },
  {
    q: "Do I have to give up my current notes app?",
    a: "No, and for a lot of people that is the right answer. Plenty of students keep writing in whatever they already use and send the finished material to FORKSAI when it is time to revise. Paste the text, upload the export as a PDF, or import a CSV. FORKSAI does not need to own your notes to build you a deck from them.",
  },
];

export const FORKSAI_VS_REMNOTE_FAQS = [
  {
    q: "What is the main difference between FORKSAI and RemNote?",
    a: "The starting point. RemNote is built around the idea that flashcards should live inside your notes, so the cards come out of the writing you do. FORKSAI starts from material you already have, a PDF, a slide deck, pasted text, a YouTube lecture or a photo, and generates the deck from it. One asks you to write in a particular way. The other asks you for a file.",
  },
  {
    q: "Which one is better for medical school?",
    a: "Both are used for it and the honest answer is that it depends on how you study. If you build a personal knowledge base you keep returning to for years, a notes-first tool suits that habit. If your bottleneck is turning a sixty page lecture handout into review material before Friday, FORKSAI is aimed squarely at that, and it adds a Medical Encyclopedia lookup, image occlusion for diagrams and a Case Study Mode built from your own deck.",
  },
  {
    q: "Can I use both?",
    a: "Yes, and it is a reasonable setup. Keep writing wherever your notes already live, then export or paste the finished material into FORKSAI when you want a deck and a review schedule out of it. FORKSAI also imports Quizlet, Anki .txt and .apkg, and CSV or TXT files.",
  },
  {
    q: "Does FORKSAI have spaced repetition as good as a dedicated SRS?",
    a: "It runs FSRS-5, which is the algorithm modern spaced repetition research settled on and the one that replaced SM-2 in serious tools. You rate confidence 1 to 4 with the keyboard, and each session ends with analytics on time spent, retention and the cards you are weakest on. There is a separate writeup on the site comparing FSRS-5 and SM-2 if you want the detail.",
  },
  {
    q: "What does FORKSAI have that a notes-first tool usually does not?",
    a: "Twelve study modes rather than one review screen. Beyond flip cards and spaced repetition there is a swipe mode, a Weak Spot Trainer, a timed Memory Sprint, MCQ practice, an Exam Simulator that generates questions from your deck, Explain Back where you type an answer and the AI grades it, an AI tutor with hint and Socratic modes, image occlusion, a Pomodoro mode and live study rooms you can revise in with other people.",
  },
  {
    q: "How much does FORKSAI cost?",
    a: "There is a free plan and a paid plan. Current pricing is on the FORKSAI homepage. We keep the numbers in one place on purpose so this page cannot fall out of date and quote you something wrong.",
  },
];

export const FORKSAI_VS_NOTION_FAQS = [
  {
    q: "Can Notion do flashcards?",
    a: "People do build flashcard setups inside Notion, usually with toggle lists or a database where the answer stays hidden until you open the row. That works as a store of question and answer pairs. What it does not give you on its own is a scheduler deciding which cards you see today, which is the part that makes spaced repetition work. If you want that inside Notion you generally add something else on top.",
  },
  {
    q: "Should I replace Notion with FORKSAI?",
    a: "Probably not, and we would rather say so. Notion is a general workspace for documents, databases, wikis and project tracking, and FORKSAI does not try to be any of those. FORKSAI replaces the part of your Notion setup that was trying to be a revision system. Keep the workspace, move the revision.",
  },
  {
    q: "How do I get my Notion pages into FORKSAI?",
    a: "Export the page or copy the text. FORKSAI takes pasted text directly and it takes PDF uploads, so exporting a Notion page to PDF and dropping it in works. From there it generates the deck. You can also import a CSV if you have your material in a Notion database.",
  },
  {
    q: "What does FORKSAI do that a workspace does not?",
    a: "It schedules. FSRS-5 spaced repetition decides which cards come back and when, based on how you rated each one. On top of that it generates the cards from your material rather than asking you to type them, and it ships twelve study modes including an Exam Simulator, a Weak Spot Trainer, Explain Back grading and live study rooms.",
  },
  {
    q: "Is FORKSAI a note-taking app?",
    a: "It takes notes, but it is not a workspace. It turns a PDF into notes in structured, Cornell, narrative or outline style, it has a summarizer with a rich text editor, and it has a manual notes editor. What it does not have is databases, relations, project boards or team wikis, which is exactly the ground Notion covers.",
  },
  {
    q: "Can I use FORKSAI and Notion together?",
    a: "That is the setup we would suggest. Plan and write in Notion, then send finished material to FORKSAI when you need a deck and a review schedule. Notes and decks live in the same folder tree inside FORKSAI, so the revision side stays organised without needing to mirror your workspace.",
  },
];

export const FLASHCARDS_AND_NOTES_FAQS = [
  {
    q: "Which app integrates flashcards and notes best?",
    a: "There is no single winner, because the two designs solve different problems. Notes-first tools let you write cards inline as you take notes, which is excellent if you take notes in that tool and painful if your material arrives as somebody else's PDF. Study-first tools like FORKSAI go the other way: hand over the material and get both the notes and the deck out of it. Pick based on where your material comes from, not on which list it tops.",
  },
  {
    q: "How does FORKSAI keep notes and flashcards together?",
    a: "They share the library. A deck and the notes generated from the same source sit in the same folder tree, which supports nested folders, tags, search, and bulk move or delete. Open a deck and you can see which study modes you have already run on it, so the notes and the review history stay attached to the same material.",
  },
  {
    q: "Can it make notes and a deck from the same PDF?",
    a: "Yes. The same upload can produce a flashcard deck and a set of notes. Notes come in structured, Cornell, narrative or outline style, with a detail level and a focus area you set, and the deck comes with a difficulty, question types and a card count you set.",
  },
  {
    q: "Do I have to write my notes in a special syntax?",
    a: "No. There is no card syntax to learn in FORKSAI. You upload or paste the material as it is and the AI extracts the question and answer pairs. If you would rather write the cards yourself there is a manual creator with images, drag to reorder and batch editing before you save.",
  },
  {
    q: "What happens after the deck exists?",
    a: "You review it. FSRS-5 spaced repetition schedules the cards, and there are eleven other modes for when plain review is not what you need, including a Weak Spot Trainer that shows only your high forget count cards, an Exam Simulator that writes MCQs from the deck, and Explain Back where you type an answer in your own words and the AI grades it. Deck analytics show new and due counts, mastered percentage, retention and your weakest cards.",
  },
  {
    q: "Can I bring in decks I already made elsewhere?",
    a: "Yes. FORKSAI imports Quizlet exports, Anki decks as .txt or .apkg, and CSV or TXT files, with a review step before saving so you can fix the parsing on anything that came across badly.",
  },
];
