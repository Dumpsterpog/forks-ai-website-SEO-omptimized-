export const STUDENT_AUDIENCES = [
  {
    "slug": "university-students",
    "label": "University students",
    "title": "AI Flashcards for University Students",
    "description": "Turn lecture notes and PDFs into flashcards, check the answers, and build a manageable review routine for university exams.",
    "intro": "A semester produces more material than you can comfortably reread. Build a review deck from one lecture at a time, then use the questions to find what you can explain without looking at your notes.",
    "sections": [
      [
        "From lecture slides to a focused deck",
        "Start with one lecture PDF or a short section of your notes. Choose the card count, difficulty, and question types rather than asking for hundreds of cards at once. Keep your learning objectives nearby: a useful deck covers the concepts your course expects you to understand.",
        "For an introductory economics lecture, separate the definition of opportunity cost from a question that asks you to apply it to a decision. For a biology lecture, separate a process into its stages before adding a question about how the stages connect."
      ],
      [
        "Check before you memorize",
        "Compare each generated answer with your lecture material. Rewrite vague questions, correct mistakes, and split cards that ask for several unrelated facts. AI-generated content can be wrong; your course notes and assigned sources remain the reference.",
        "Avoid copying an entire slide onto the back of a card. A prompt such as “What changes demand?” is ambiguous; “What happens to demand for a normal good when income rises, holding other factors constant?” gives you a specific answer to retrieve."
      ],
      [
        "Make review fit your week",
        "Begin a study session with cards due for review, then add material from your next lecture. Use spaced repetition to schedule another encounter with material rather than deciding to reread every chapter each evening.",
        "Keep practice problems, essays, and past papers in the routine. Flashcards help you retrieve component knowledge; solving a full problem shows whether you can use it. If your review queue grows beyond the time you have, reduce new cards and remove duplicates."
      ]
    ],
    "tools": [
      [
        "/pdf-to-flashcards",
        "PDF to flashcards"
      ],
      [
        "/final-grade-calculator",
        "Final grade calculator"
      ],
      [
        "/blog/study-schedule",
        "Build a study schedule"
      ]
    ]
  },
  {
    "slug": "high-school-students",
    "label": "High school students",
    "title": "AI Flashcards for High School Students",
    "description": "Create flashcards from class notes, revise vocabulary and science concepts, and combine daily review with exam practice.",
    "intro": "Make your next revision session specific: one topic, a small set of questions, and a clear way to check your answers. FORKSAI can help turn class material into a starting deck you can edit.",
    "sections": [
      [
        "Choose one topic from class",
        "Use a short section of teacher-provided notes or a textbook extract you are allowed to use. Start with the topic you are revising today, such as cell structure, a set of language verbs, or causes of a historical event.",
        "Choose a modest number of cards so you can check every answer. Match the wording to your teacher’s explanations and the syllabus. More cards do not automatically mean better preparation."
      ],
      [
        "Write questions you can mark",
        "For vocabulary, ask for the meaning and then practise using the word in a sentence. For science, separate a definition from a question about its application. For history, distinguish a date from a question explaining a cause.",
        "A useful science prompt is “Which cell structure controls what enters and leaves the cell?” rather than “Tell me everything about cells.” Read the question, answer without peeking, and then compare with the back of the card. Correct generated errors before practising again."
      ],
      [
        "Combine recall with exam questions",
        "Review a manageable set regularly and use repeated mistakes to choose what to revisit in your notes. Spaced repetition can organize when cards return, but you still need to think through the answer rather than recognize familiar words.",
        "For mathematics, work through full problems on paper. For essays, practise planning and writing a response. Use flashcards for formulas, terms, and key ideas, then use class exercises or past papers to practise the format you will face."
      ]
    ],
    "tools": [
      [
        "/text-to-flashcards",
        "Text to flashcards"
      ],
      [
        "/marks-percentage-calculator",
        "Marks percentage calculator"
      ],
      [
        "/blog/active-recall",
        "Active recall guide"
      ]
    ]
  },
  {
    "slug": "medical-students",
    "label": "Medical students",
    "title": "AI Flashcards for Medical Students",
    "description": "Build and edit flashcards from medical lecture PDFs, practise recall, and organize review alongside course questions and clinical learning.",
    "intro": "Medical courses combine a large factual workload with the need to apply knowledge. Turn a focused lecture section into editable flashcards, verify every answer, and keep case-based practice alongside your review.",
    "sections": [
      [
        "Build around a learning objective",
        "Start with a lecture section and its learning objectives rather than an entire textbook. Ask for a focused card count and question style. Separate anatomy relationships, physiological mechanisms, and terminology into questions that test one thing at a time.",
        "For a physiology topic, make one card about a mechanism and another about the predicted effect of a change. This helps expose whether you understand the relationship instead of simply recognizing a paragraph you have seen before."
      ],
      [
        "Verify every generated medical answer",
        "Check cards against your course material and authoritative references used by your program. Pay particular attention to units, exceptions, drug names, and any claims that depend on current guidance. Edit or discard cards you cannot verify.",
        "Do not upload patient-identifiable information. These study cards are educational material and are not a source of clinical advice. A generated deck cannot replace your curriculum, supervised clinical teaching, or an up-to-date clinical reference."
      ],
      [
        "Keep reviews and application connected",
        "Use scheduled reviews for factual retrieval, and use question banks or course cases to practise reasoning. When you miss a case question, identify the knowledge gap before adding a card; avoid copying the whole explanation into several oversized prompts.",
        "Maintain a review load you can finish alongside lectures and placements. Remove repeated cards, split difficult prompts, and reduce new material when due reviews accumulate. FORKSAI is a way to prepare and review cards, not a guarantee of exam performance."
      ]
    ],
    "tools": [
      [
        "/pdf-to-flashcards",
        "Lecture PDF to flashcards"
      ],
      [
        "/blog/how-to-make-anki-cards",
        "How to write useful cards"
      ],
      [
        "/blog/spaced-repetition",
        "Spaced repetition guide"
      ]
    ]
  }
];
