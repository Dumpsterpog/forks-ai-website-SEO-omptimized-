"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Copy, BookOpen } from "lucide-react";
import { dmSerifDisplay, dmSans } from "@/lib/fonts";

/* ── Code block ── */
function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-3">
      {label && <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{label}</p>}
      <div className="relative rounded-xl border border-white/6 bg-white/3 p-5 font-mono text-sm text-zinc-300 overflow-x-auto">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg border border-white/8 text-zinc-600 hover:text-white hover:border-white/20 transition-all"
          title="Copy"
        >
          {copied ? <Check size={12} className="text-[#b5ff4d]" /> : <Copy size={12} />}
        </button>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

/* ── Sections ── */
const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      "FORKSAI is a study platform built to help students learn more effectively - not just consume more content.",
      "It combines AI-powered tools with habit-tracking features to turn passive reading into active, measurable learning.",
      "The platform covers the full study workflow: upload a document, generate flashcards or a summary, revise using quiz modes, and track your progress over time.",
      "Every feature is designed around one principle: consistent, active engagement beats occasional cramming. FORKSAI makes that habit easy to build and easy to see.",
      "### Who is it for?",
      "FORKSAI is built for university and secondary school students who deal with large volumes of reading material - textbooks, lecture notes, research papers - and need a faster, more effective way to revise.",
      "It works particularly well for subjects that require memorisation and understanding of structured content: medicine, law, sciences, history, economics, and similar fields.",
    ],
  },
  {
    id: "quickstart",
    title: "Getting Started",
    content: [
      "### 1. Create your account",
      "Sign up at forksai.com using Google or an email and password. Email accounts require verification before you can log in - check your inbox after registering.",
      "If you created an account before January 3, 2026, use the Forgot Password option or continue with Google sign-in, as the login system was updated at that point.",
      "### 2. Explore the dashboard",
      "After logging in, you land on the study dashboard. This is your home base - it shows your recent flashcard decks, daily and weekly study time, streak count, activity heatmap, and quick access to all tools.",
      "### 3. Create your first deck",
      "Click Create in the top bar. Free users can create Manual Flashcards immediately. Premium users also have access to AI Flashcards from uploaded PDFs or pasted text.",
      "### 4. Start studying",
      "Open any deck and choose a revision mode. The study timer can be started independently from the timer panel on the dashboard.",
      "### 5. Track your progress",
      "Check the heatmap and stats on your dashboard to see how consistent you are being. Achievements unlock automatically as you hit milestones.",
      { type: "note", text: "Premium features - AI Flashcards, PDF Summarizer, Quiz Generator, and Revision Modes - require an active subscription. You can upgrade anytime from the dashboard." },
    ],
  },
  {
    id: "ai-flashcards",
    title: "AI Flashcards",
    content: [
      "AI Flashcards generate a complete, ready-to-study deck from any text or PDF you provide - no manual card writing required.",
      "Each card is structured in a question–answer format. The AI identifies key concepts, definitions, processes, and exam-relevant points from your material and turns them into focused cards.",
      "Generation typically completes in under 30 seconds for most documents. Longer or more complex texts may take slightly longer.",
      "### How to generate a deck",
      "From the dashboard, click Create → AI Flashcards. You can paste text directly or upload a PDF. Review the input, then confirm to start generation.",
      "Once complete, the deck appears in your Recent Decks section on the dashboard and is immediately ready to study.",
      "### What makes a good input?",
      "Structured academic text works best - textbook chapters, lecture notes, revision guides, and academic handouts.",
      "The AI extracts meaning from content, so well-written, clearly structured material produces better cards than loosely formatted notes or bullet-point lists without context.",
      "Avoid uploading scanned images or image-only PDFs - the AI processes text content, not images. If your PDF is scanned, it needs OCR (text recognition) applied first before uploading.",
      "### Tips for better results",
      "If a deck feels too broad or shallow, try uploading a single chapter or topic section rather than an entire document. Focused input produces focused cards.",
      "For very dense material - full medical textbooks, entire course readers - break uploads into logical chunks: one unit or chapter at a time.",
      "You can generate multiple decks from the same document at different levels of granularity and use them at different stages of revision.",
      "### Editing generated decks",
      "After generation, you can open any deck and edit individual cards if the AI missed something or phrased an answer poorly.",
      "Treat AI-generated decks as a strong, fast starting point - not an unchangeable final product. Editing a few cards to match your course's exact terminology takes less than a minute and significantly improves the deck's quality.",
    ],
  },
  {
    id: "manual-flashcards",
    title: "Manual Flashcards",
    content: [
      "Manual Flashcards are available on the free plan. You write each question and answer yourself, giving you full control over the content and phrasing.",
      "This is useful when you want to capture very specific phrasing, your lecturer's exact definitions, or material that is not in a document you can upload.",
      "### How to create a manual deck",
      "From the dashboard, click Create → Manual Flashcards. The card editor opens - add a question and answer for each card.",
      "Give your deck a clear, descriptive title so it is easy to find later. Save when done, or add cards progressively and save as you go.",
      "### Editing and managing cards",
      "You can edit any card in a manual deck at any time - open the deck, select a card, and update the question or answer.",
      "Cards can be deleted individually. The entire deck can also be deleted from the deck management view on the dashboard.",
      "### How manual decks behave",
      "Manual decks are identical to AI-generated decks in every other way. They appear in Recent Decks, contribute to your streak when created, and can be studied using all revision modes (Premium required for revision modes).",
      "There is no visible difference between a manual and AI-generated deck when studying - you can mix both freely.",
      "### When to use manual vs AI",
      "Use AI flashcards when you have a document and want fast, broad coverage of a topic. Use manual cards when you need precision, or when your study material is not in an uploadable format - handwritten notes, whiteboard photos, or lecturer-verbal content.",
    ],
  },
  {
    id: "pdf-summarizer",
    title: "PDF Summarizer",
    content: [
      "The PDF Summarizer extracts the key concepts, arguments, definitions, and important points from uploaded documents - structured for revision, not just compressed for length.",
      "Instead of reading a 40-page paper front to back, upload it and get a focused breakdown of what actually matters for understanding and recall.",
      "Uploaded files are processed transiently and not stored on our servers after summarisation is complete. Your document content is not retained.",
      "### How to summarise a document",
      "From the dashboard, navigate to Summarizer (Premium). Upload your PDF and confirm. The summary is generated and displayed on screen.",
      "You can then use the summary as revision material directly, copy it into your own notes, or paste it into the AI Flashcard generator to create a deck from the summarised content - a two-step workflow that produces highly targeted flashcards.",
      "### Best use cases",
      "Textbook chapters where you need a fast orientation before deeper reading.",
      "Research papers and academic articles where the abstract undersells the actual content.",
      "Lecture slide decks that lack explanatory text between bullet points.",
      "Revision handouts that need to be condensed further for final-stage exam prep.",
      "Documents in subjects with high content density - law cases, medical papers, scientific reviews.",
      "### Output quality",
      "The summariser focuses on factual content and key arguments. It does not rewrite the document - it identifies what is most important and surfaces that first.",
      "Output quality is directly tied to input quality. Well-structured, clearly written documents produce better summaries than dense, jargon-heavy, or poorly formatted text.",
      "### Limitations",
      "Summaries are AI-generated and reflect the text in the document. If the source material is poorly written or heavily specialised, the summary will reflect that.",
      "For very long documents, the summary may feel broad. For better depth, upload individual sections or chapters rather than the full document.",
      "Always cross-reference with your original source for critical or high-stakes topics.",
    ],
  },
  {
    id: "quiz-generator",
    title: "Quiz Generator",
    content: [
      "The Quiz Generator creates exam-style questions from your study material - so you can test your knowledge before an exam does.",
      "It surfaces gaps: topics you think you understand but cannot recall accurately under question pressure. This is where most revision falls short - recognising content is much easier than retrieving it.",
      "Questions are generated on-demand and are not stored unless you explicitly save the session.",
      "### How to use",
      "Upload your material or paste text into the Quiz Generator (Premium). Select the format - multiple choice, short answer, or mixed - then generate.",
      "Work through the questions, attempt answers before revealing them, and note where you struggled. Those gaps become the focus for your next study session.",
      "### When to use it",
      "Use the Quiz Generator after you have already read and revised a topic - it works best as a recall check, not a first introduction to new material.",
      "It is particularly effective the day before an exam: generate 10–20 questions from each major topic and see what you can actually answer without looking.",
      "It also works well after creating and reviewing a flashcard deck - the quiz format forces a different type of retrieval than card-flipping.",
      "### Question quality",
      "Question quality depends on input quality. Well-structured academic text with clear concepts and definitions produces better, more targeted questions.",
      "If questions feel too surface-level or generic, try uploading a more focused section of your material - a single topic or chapter - rather than a broad overview document.",
    ],
  },
  {
    id: "revision-modes",
    title: "Revision Modes",
    content: [
      "FORKSAI offers two revision modes for studying flashcard decks. Both are available to Premium subscribers and work with any deck - AI-generated or manual.",
      "Switching between modes across study sessions is effective - different formats activate different retrieval pathways, which strengthens long-term retention.",
      "### Flip Cards",
      "The classic flashcard experience. You see the question, think through your answer mentally, then flip to reveal it. Completely self-paced.",
      "Flip Cards are best for: first-pass revision of a new deck, topics requiring careful reasoning rather than fast recall, and concepts where getting the exact phrasing right matters.",
      "How to use: open any deck and select Flip Cards mode. Use the on-screen buttons or keyboard arrow keys to navigate between cards. Press Space or click the card to flip.",
      "### Throw Cards",
      "A swipe-based rapid classification mode. Cards are presented one at a time - mark each as Known or Needs Work. Fast, high-repetition, and momentum-driven.",
      "Cards marked as Needs Work cycle back through the deck automatically, so you naturally spend more time on weaker cards without having to track them manually.",
      "Throw Cards are best for: final revision before an exam, reinforcing cards you already partially know, and when time is limited.",
      "How to use: open any deck and select Throw Cards mode. Swipe right or click the checkmark for Known. Swipe left or click X for Needs Work.",
      "### Combining modes effectively",
      "A useful two-phase pattern: use Flip Cards when you first encounter a new deck to properly learn the content. Switch to Throw Cards in later sessions to rapidly reinforce what you have learned and identify remaining weak points.",
      "For final exam prep, running multiple Throw Cards passes in a row is highly effective - by the end, only the cards you genuinely struggle with remain cycling through.",
    ],
  },
  {
    id: "study-timer",
    title: "Study Timer",
    content: [
      "The study timer on your dashboard tracks how long you actively study in each session. It records the exact start and end time and calculates the duration, which is then saved to your account.",
      "Timer data feeds into your daily total, weekly total, streak activity, heatmap entries, and achievement progress.",
      "### Starting a session",
      "From the dashboard, click Start in the Study Timer panel. The timer begins running and displays elapsed time on screen. You can navigate to other parts of the dashboard while the timer runs.",
      "### Pausing",
      "Click Pause to temporarily stop the timer without ending the session. The display freezes. Click Resume to continue. Paused time does not count toward your session total.",
      "### Stopping and saving",
      "Click Stop to end the session. The duration is immediately saved to your account. The session appears in your study history and updates your daily total on the dashboard.",
      { type: "note", text: "Always stop the timer before closing the browser tab or logging out. If you close without stopping, the session end time is not recorded and the session will not be saved." },
      "### Resetting",
      "The Reset button stops and discards the current session without saving it. Use this if you accidentally started the timer or want to start fresh.",
      "### Multiple sessions per day",
      "You can run multiple sessions per day - each is saved separately and their durations are summed to calculate your daily total. There is no limit on sessions per day.",
    ],
  },
  {
    id: "study-goals",
    title: "Study Goals",
    content: [
      "Study Goals are a session-based focus tool. They help you stay intentional about what you want to accomplish during a study block - rather than just running the timer and drifting.",
      "Setting a specific goal before starting a session is one of the most effective things you can do to improve study quality. It gives the session direction and makes it easier to stay on task.",
      "### How to add a goal",
      "Click Goals in the timer panel on the dashboard. Type your goal in the input field and press Add or hit Enter. Your first goal slot is available immediately.",
      "Each additional goal slot is unlocked after every 30 minutes of accumulated study timer activity in the current session. After 30 minutes running, a second slot opens. After 60 minutes, a third, and so on.",
      "### Completing and managing goals",
      "Tick off a goal as you complete it - completed goals are marked with a strikethrough so you can see progress at a glance.",
      "You can delete any goal at any time if it is no longer relevant or you want to replace it.",
      "### Storage behaviour",
      "Goals are stored in your browser's session storage only. They are not sent to the server or saved to your account.",
      "Goals reset when you close the browser tab, navigate away, or log out. They are a within-session focus tool - not a permanent task list.",
      { type: "note", text: "If you want to keep track of goals across sessions, note them down elsewhere before closing the tab. They will not be recoverable after the session ends." },
    ],
  },
  {
    id: "streaks",
    title: "Streaks",
    content: [
      "Your streak is the number of consecutive calendar days you have been active on FORKSAI. It is the single most visible consistency metric on the platform.",
      "Research on study habits consistently shows that frequency matters more than duration. A 20-minute session every day is more effective for retention than a 3-hour session once a week. The streak makes daily engagement visible and rewarding.",
      "### What counts as activity",
      "Any meaningful engagement counts: creating a flashcard deck (manual or AI-generated), or completing and saving a study timer session.",
      "The streak system checks for activity timestamps. As long as one of those events has a timestamp within a given calendar day, that day is marked as active.",
      "### How the streak is calculated",
      "The streak counts backwards from today. If today and yesterday both have activity, your streak is at least 2. If any day in that backwards chain has no recorded activity, the streak stops there.",
      "Multiple activities on the same day all count as one streak day. You cannot gain extra streak days by studying more in a single day.",
      "### Streak resets",
      "If a full calendar day passes with no activity, your streak resets to zero the following day. It restarts at 1 the next time you are active.",
      { type: "note", text: "Streak calculations use your local timezone at the time of activity. Travelling across timezones or using the platform around midnight may occasionally cause edge-case behaviour." },
      "### Keeping your streak alive on busy days",
      "Even a very short session maintains the streak. Creating a single flashcard or running the timer for five minutes is enough. On busy days, the goal is just to show up - the streak rewards consistency, not volume.",
    ],
  },
  {
    id: "heatmap",
    title: "Activity Heatmap",
    content: [
      "The activity heatmap gives you a calendar view of your study activity across the current month. It makes your consistency pattern immediately visible - no digging through stats required.",
      "Each day cell is one of three states: active (you studied that day), missed (a past day with no activity), or upcoming (a future day shown as an outline).",
      "Active days are shown in green. The intensity scales with the level of activity - a day with a long session or multiple decks created appears brighter than a day with minimal activity.",
      "### What the heatmap tells you",
      "At a glance, you can see your consistency pattern: are you studying every day, clustering sessions before deadlines, going quiet on weekends, or building real daily habits?",
      "The heatmap makes invisible patterns visible. A week of missed days is obvious in a way that a number in a stats panel is not.",
      "### Stats displayed alongside the heatmap",
      "The heatmap panel shows three summary stats for the current month: Active Days (total days with any recorded activity), Best Streak (longest consecutive run this month), and Consistency (active days as a percentage of days elapsed so far this month).",
      "These three numbers together give a complete picture: total effort, best run, and overall rate.",
      "### Heart Mode",
      "Certain accounts have Heart Mode enabled - a personalised visual variant that replaces standard activity indicators with heart icons. This does not affect any underlying functionality or stat calculations.",
      "### Using it effectively",
      "Glance at the heatmap at the start of each session. If you see a gap forming, use it as a nudge to do at least a short session rather than let the gap extend further.",
    ],
  },
  {
    id: "achievements",
    title: "Achievements",
    content: [
      "Achievements are milestone markers that unlock automatically based on your real activity on FORKSAI. No manual tracking, no claiming, no opt-in required.",
      "They are designed as quiet positive reinforcement - recognition for the work you are already doing, surfaced at the moment you hit a meaningful threshold.",
      "### What they reward",
      "Achievements cover multiple dimensions of effort: streak length (e.g. 7-day streak, 30-day streak), total study time accumulated (e.g. 10 hours, 50 hours), number of flashcard decks created, total individual cards generated, length of single study sessions, and overall platform consistency over time.",
      "Each achievement has a specific numeric threshold. You can view the requirement for any locked achievement from the Achievements page.",
      "### Viewing your achievements",
      "Navigate to Achievements from the dashboard sidebar or top bar. Unlocked achievements display with the date you earned them. Locked achievements show their requirement so you know what to aim for.",
      "### Persistence",
      "Achievements are stored permanently to your account. They persist across sessions, devices, browser clears, and password resets. Once unlocked, they do not reset.",
      "### Design intent",
      "There is no leaderboard, no comparison to other users, and no penalty for locked achievements. The system is purely about recognising your own progress.",
    ],
  },
  {
    id: "premium",
    title: "Free vs Premium",
    content: [
      "FORKSAI has a permanent free tier and an optional Premium subscription. The free tier is not a trial - it is a full, usable version of the platform. Premium unlocks the AI-powered tools.",
      "### Free plan includes",
      "Manual flashcard creation - create and edit decks by writing your own cards, with no limit on decks or cards.",
      "Full study dashboard - timer, goals, streak tracking, activity heatmap, and study statistics.",
      "Achievement tracking - all achievements are available and unlock on both free and Premium plans.",
      "Complete deck and study history - full access to all your past decks and recorded sessions.",
      "### Premium adds",
      "AI Flashcard generation - upload a PDF or paste text and get a complete flashcard deck in under 30 seconds.",
      "PDF Summarizer - extract key points from any document instantly without reading it in full.",
      "Quiz Generator - create exam-style multiple choice and short answer questions from your material.",
      "All Revision Modes - Flip Cards and Throw Cards for actively studying your decks.",
      "Priority AI processing - faster generation during high-demand periods.",
      "### Subscription plans",
      "Premium is available on three billing cycles: 1-day (24-hour access, auto-renews daily), monthly, and yearly (best per-day value). Pricing is displayed at checkout.",
      "### Upgrading",
      "Click Upgrade in the dashboard top bar at any time. Premium activates immediately after payment - no waiting, no setup.",
      "### What happens if you cancel",
      "You retain Premium access until the end of your current billing period. After that, AI tools are locked and you return to the free tier.",
      "Your decks, study history, stats, streaks, and achievements are never deleted when you cancel - they are all still there if you resubscribe later.",
    ],
  },
  {
    id: "account",
    title: "Account Management",
    content: [
      "### Signing in",
      "FORKSAI supports two sign-in methods: Google Sign-In (one-click, no password required) and Email & Password (requires email verification on first sign-up).",
      "Both methods work with the same account as long as the email address matches. You can use either to access your account.",
      "### Email verification",
      "After registering with email and password, a verification link is sent to your inbox. You must verify before logging in for the first time.",
      "If the email does not arrive, check your spam folder. If it is still not there after a few minutes, use the Resend Verification option on the login screen.",
      "### Forgot password",
      "If you have forgotten your password - or if you signed up via Google and want to set a password - use the Forgot Password link on the login page. A reset link is sent to your registered email.",
      "Accounts created exclusively via Google Sign-In do not initially have a password. You can add one at any time using Forgot Password.",
      "### Deleting your account",
      "To request full account deletion - permanently removing your account, flashcard decks, study history, streaks, achievements, and all associated data - contact us at support@forksai.app with your account email and a clear deletion request.",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: [
      "### Streak not updating",
      "Confirm that a study session was properly started and stopped, or that a flashcard deck was created on that day. The streak updates based on server-recorded timestamps - if a session was not saved, it will not count.",
      "If you are sure you studied but the streak did not update, try refreshing the dashboard. Streak recalculation runs on each page load.",
      "### Timer not saving",
      "You must click Stop before closing the tab or navigating away. The session end time is recorded at the exact moment you click Stop. Closing the browser without stopping means the session is lost.",
      "### AI generation failed or produced poor results",
      "Refresh and try again. Ensure your document contains readable, selectable text - scanned image PDFs without a text layer cannot be processed. Try selecting text in the PDF in your browser; if you cannot, the file needs OCR applied first.",
      "If generation succeeds but the output feels low quality, try a smaller, more focused section of your material rather than the full document.",
      "### Flashcards not appearing after generation",
      "Wait a few seconds and refresh the dashboard. Newly generated decks appear in Recent Decks. If they are still not showing after 30 seconds, navigate to My Decks from the sidebar - the full deck list updates independently of the Recent Decks widget.",
      "### Login issues",
      "Log out, clear your browser cache (Ctrl+Shift+Delete), and log back in. If your account was created before January 3 2026, use Forgot Password or continue with Google sign-in.",
      "### Premium features locked after payment",
      "Premium status is verified on each page load. Wait a few seconds and hard-refresh the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). If still locked after one minute, contact us with your account email and payment confirmation.",
      "### Study stats look incorrect",
      "Stats are calculated from saved session data only. Sessions closed without stopping the timer are not included. Timezone changes can cause edge cases in daily stat groupings.",
      "### Email verification not arriving",
      "Check your spam folder. Add support@forksai.app to your contacts and try resending. Ensure you are checking the exact email address used to register.",
    ],
  },
  {
    id: "limitations",
    title: "Limitations & Disclaimer",
    content: [
      "### AI accuracy",
      "AI-generated summaries, flashcards, and quiz questions may occasionally contain inaccuracies, miss important nuance, or oversimplify complex concepts.",
      "Output quality is directly tied to input quality. Poorly formatted, ambiguous, or highly specialised source text will produce less reliable results than clean, well-structured academic text.",
      "FORKSAI makes no guarantee of accuracy, completeness, or fitness for purpose for any AI-generated content.",
      "### FORKSAI as a study aid",
      "FORKSAI is a study aid - not a replacement for attending lectures, reading primary sources, or consulting tutors and subject experts.",
      "AI-generated flashcards and summaries should be treated as a starting point for revision, not as a definitive or authoritative source.",
      "Always verify important information against your original course materials - especially for high-stakes assessments.",
      "### Academic integrity",
      "You are responsible for how you use FORKSAI in the context of your institution's academic integrity policies.",
      "Using FORKSAI to generate flashcards or summaries from your own study material to aid revision is generally within the spirit of normal study practice. Submitting AI-generated content as your own original coursework is governed entirely by your institution's rules.",
      "### Document uploads",
      "Do not upload sensitive, personally identifiable, confidential, or legally protected documents. Uploaded files are processed transiently and discarded, but exercise appropriate caution about what you upload.",
      "### Statistics accuracy",
      "Study statistics, streaks, and session records are calculated in good faith but may not be perfectly accurate in all edge cases - for example, if connectivity drops mid-session, if you cross timezones, or if the browser terminates unexpectedly.",
    ],
  },
  {
    id: "public-decks",
    title: <span><span style={{ color: '#8fba55', fontWeight: '600' }}>[NEW]</span> Explore & Import Public Decks</span>,
    content: [
      "FORKSAI allows users to discover and import AI-generated flashcard decks shared publicly by other learners. This enables you to benefit from high-quality decks created by peers, without having to generate or write cards yourself.",
      "### Privacy: What is and isn't shared",
      "When a creator shares a deck publicly, only the flashcard content is visible to other users - their email address, account details, and personal information are never exposed. The creator's account name is shown for attribution purposes only. You can confidently share your decks knowing your privacy is completely protected.",
      "### What are public decks?",
      "Public decks are AI-generated flashcard decks that their creators have chosen to share with all FORKSAI users. They appear in the Explore section of the platform, searchable by topic, subject, and deck title.",
      "Only AI-generated decks can be published publicly. Manually created and imported decks remain private to the creator's account.",
      "### Finding and previewing public decks",
      "Navigate to the Explore section from the dashboard sidebar or top navigation. Browse by topic or search for specific subjects or keywords.",
      "Preview any deck before importing - you can see the deck title, creation date, card count, and topic tags. A sample of cards is shown so you can assess quality and relevance.",
      "### Importing a deck",
      "Click Import to add a public deck to your account. A private copy is created in your study collection. The original deck remains unchanged, and you maintain your own version indefinitely.",
      "Imported decks appear immediately in My Decks and are ready to study. You can edit imported decks using the same tools available for any other deck.",
      "### Credit to the original creator",
      "When you import a deck, the original creator's name is recorded and visible in the deck details - to recognise and credit their effort.",
      "If you find an imported deck particularly useful, consider keeping the creator's attribution visible when sharing your own insights with peers.",
      "### Key differences: public vs imported decks",
      "A public deck is created and shared by a peer - it reflects that user's interpretation and choice of key concepts. An imported copy is now yours to edit and adapt.",
      "You can edit cards, add new cards, or delete cards from an imported deck without affecting the source deck or other users who imported it.",
      "### When to use public decks",
      "Use public decks when you find one that matches your exact topic and course - importing saves you the time of generating or writing cards.",
      "If you find a deck that is 80% useful but missing a few key areas, import it and add your own cards to fill the gaps.",
      "Public decks work well for standardised subjects with shared content - for example, decks on basic biology, first-year maths, or entry-level languages are likely to be reliable across schools.",
      "Be cautious with subject-specific decks that depend heavily on your exact curriculum - a deck on a particular textbook chapter created by a peer student might not align perfectly with your course.",
      "### Quality and accuracy",
      "Public decks are created by students using FORKSAI's AI tools - the same tools you have access to. Quality varies: some decks reflect careful, refined material, while others may be rough first-pass outputs.",
      "Always review and verify important information against your course materials and lecturer's notes, especially before high-stakes exams.",
      "If you encounter a public deck with inaccurate, harmful, or inappropriate content, please report it to support@forksai.app with a link to the deck.",
      "### Sharing your own decks",
      "After generating an AI-generated deck, you can toggle it to Public to share with other FORKSAI users. Use the deck settings to control visibility.",
      "Public deck creators are credited by name in the deck details when other users import. This encourages the creation and sharing of high-quality study material across the community.",
    ],
  },
  {
    id: "study-rooms",
    title: "Study Rooms",
    content: [
      "Study Rooms let you host a live, multiplayer study session with other FORKSAI users. You pick a flashcard deck, share a 6-character room code, and everyone studies together in real time.",
      "Rooms automatically expire and all data is deleted 2 hours after creation - there is nothing to clean up.",
      "### Creating a room",
      "From the dashboard, click the Study Room button and select Create Room. Choose a deck from your collection, pick your settings, then confirm. You will receive a 6-character room code to share with participants.",
      "### Joining a room",
      "Click Study Room and select Join Room. Enter the 6-character code shared by the host. Once in the lobby, you can see who else has joined and chat while waiting for the host to start.",
      "### Session settings",
      "Hosts configure the room before starting. Available settings are:",
      "Answer mode - Flip shows each card for review; Write requires participants to type their answer before revealing it.",
      "Study mode - Host-paced advances all participants to the next card at the same time, controlled by the host. Race mode lets everyone answer independently and tracks completion speed on a live leaderboard.",
      "Breaks - You can configure automatic study breaks. Timer-based breaks trigger after a set number of minutes (5 to 120). Card-based breaks trigger after a set number of cards (2 to 50). A 5-minute countdown appears on screen for everyone when a break is active, with options to resume early or skip.",
      "### During the session",
      "In host-paced mode, the host advances cards using the Next Card button. All participants see the same card at the same time. Each participant answers independently.",
      "In race mode, all cards are available immediately. Participants work through the deck at their own pace. A live leaderboard on the right shows each participant's progress and answer count.",
      "The host can see how many participants have answered the current card before advancing in host-paced mode.",
      "### Live chat",
      "A chat panel is available in the lobby and during the session. In the lobby, the chat appears below the room info card. During the session, the chat is accessible via a tab in the right panel alongside the scores.",
      "A notification dot appears on the Chat tab when new messages arrive while you are viewing the Scores tab.",
      "Chat messages are visible to all room participants. All messages are deleted when the room expires.",
      "### Shuffle",
      "The host can shuffle the card order from the lobby before starting the session. This randomises the sequence for all participants.",
      "### Room expiry",
      "Rooms expire 2 hours after creation. If a session is still in progress at that point, participants will no longer be able to submit answers and the room will close. Plan sessions accordingly.",
      { type: "note", text: "Study Room activity does not count toward your personal streak, study timer, or heatmap. It is a collaborative feature separate from your individual progress tracking." },
      "### Room codes",
      "Room codes are 6 characters and randomly generated. Share the code only with people you intend to study with. Anyone with the code can join an open room.",
    ],
  },
  {
    id: "contact",
    title: "Contact & Support",
    content: [
      "For technical issues, billing questions, feature requests, or general enquiries, contact the FORKSAI team at:",
      { type: "email", address: "support@forksai.app" },
      "We aim to respond within 7 business days.",
      "### What to include in your message",
      "For technical issues: your account email, a description of the problem, what you expected to happen, and any error messages you saw. Screenshots are helpful.",
      "For billing issues: your account email, the date and amount of the charge, and your payment confirmation if available.",
      "For account deletion requests: your account email and a clear statement that you want your account and all associated data permanently deleted.",
      "### Other resources",
      "Privacy Policy - how your data is collected, used, and protected.",
      "Terms & Conditions - the rules governing your use of FORKSAI.",
      "Refund Policy - how billing disputes and refund requests are handled.",
    ],
  },
];

/* ── Highlight ── */
function highlightText(text, query) {
  if (!query || typeof text !== "string") return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-[#b5ff4d]/20 text-[#b5ff4d] px-0.5 rounded">{part}</mark>
      : part
  );
}

/* ── Render content line ── */
function RenderLine({ line, search }) {
  if (typeof line === "object" && line.type === "note") {
    return (
      <div className="flex gap-3 px-4 py-3 rounded-xl border border-white/6 bg-white/2">
        <span className="text-[#b5ff4d] shrink-0 text-xs mt-0.5">Note</span>
        <p className="text-xs text-zinc-500 leading-relaxed">{line.text}</p>
      </div>
    );
  }
  if (typeof line === "object" && line.type === "email") {
    return (
      <a href={`mailto:${line.address}`} className="text-sm text-[#b5ff4d] hover:underline underline-offset-4 font-medium">
        {line.address}
      </a>
    );
  }
  if (typeof line === "object" && line.type === "code") {
    return <CodeBlock code={line.code} label={line.label} />;
  }
  if (typeof line === "string") {
    if (line.startsWith("### ")) {
      return (
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-6 mb-1 first:mt-0">
          {line.replace("### ", "")}
        </p>
      );
    }
    return <p className="text-sm text-zinc-400 leading-relaxed">{highlightText(line, search)}</p>;
  }
  return null;
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function DocumentationContent() {
  const sectionRefs = useRef(sections.map(() => React.createRef()));
  const mainRef = useRef(null);
  const [active,   setActive]   = useState(sections[0].id);
  const [search,   setSearch]   = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSection = (idx) => {
    const el = sectionRefs.current[idx]?.current;
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop - 40, behavior: "smooth" });
    }
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollTop + el.clientHeight / 2;
      sectionRefs.current.forEach((ref, idx) => {
        const el = ref.current;
        if (!el) return;
        if (mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) {
          setActive(sections[idx].id);
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const filteredSections = search
    ? sections.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.content.some(l => typeof l === "string" && l.toLowerCase().includes(search.toLowerCase()))
      )
    : sections;

  return (
    <div
      className={`${dmSans.variable} ${dmSerifDisplay.variable} h-screen bg-[#080808] text-white flex flex-col overflow-hidden`}
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* grain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      <div className="relative z-10 flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-white/6 bg-[#080808] px-5 py-8">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 mb-8">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-5 w-auto" />
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase leading-none">FORKSAI</p>
              <p className="text-[8px] uppercase tracking-widest text-zinc-700 mt-0.5">Docs</p>
            </div>
          </a>

          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search docs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-full border border-white/8 bg-white/3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#b5ff4d]/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 overflow-y-auto flex-1">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(idx)}
                className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  active === sec.id
                    ? "bg-white/6 text-white font-medium border-l-2 border-[#b5ff4d] pl-2.5"
                    : "text-zinc-600 hover:text-zinc-300 hover:bg-white/3"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </nav>

          {/* Bottom links */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-2">
            {[["← Back home", "/"], ["Privacy", "/privacy-policy"], ["Terms", "/terms"]].map(([label, href]) => (
              <a key={href} href={href} className="text-[10px] text-zinc-700 hover:text-white transition-colors uppercase tracking-widest">{label}</a>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto px-6 md:px-12 lg:px-16 py-12">
          <div className="max-w-2xl mx-auto">

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/8 rounded-full mb-6">
                <BookOpen size={12} className="text-[#b5ff4d]" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Documentation</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-dm-serif-display), serif" }} className="text-[2.2rem] md:text-[2.8rem] font-normal leading-tight mb-3">
                FORKSAI Docs
              </h1>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Everything you need to know about the platform - from getting started to understanding how each feature works.
              </p>
            </motion.div>

            {/* Search results notice */}
            {search && (
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xs text-zinc-600">
                  {filteredSections.length} result{filteredSections.length !== 1 ? "s" : ""} for <span className="text-zinc-400">"{search}"</span>
                </p>
                <button onClick={() => setSearch("")} className="text-xs text-zinc-700 hover:text-white transition-colors underline underline-offset-4">Clear</button>
              </div>
            )}

            {/* Sections */}
            <div className="divide-y divide-white/5">
              {(search ? filteredSections : sections).map((sec, idx) => {
                const realIdx = sections.findIndex(s => s.id === sec.id);
                return (
                  <motion.section
                    key={sec.id}
                    ref={sectionRefs.current[realIdx]}
                    id={sec.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.4 }}
                    className="py-10 first:pt-0 scroll-mt-8"
                  >
                    {/* Section title */}
                    <div className="flex items-start gap-4 mb-5">
                      <span className="text-[10px] font-mono text-zinc-700 pt-1 w-6 shrink-0">
                        {String(realIdx + 1).padStart(2, "0")}
                      </span>
                      <h2 style={{ fontFamily: "var(--font-dm-serif-display), serif" }} className="text-xl font-normal text-white">
                        {highlightText(sec.title, search)}
                      </h2>
                    </div>

                    {/* Section content */}
                    <div className="ml-10 space-y-3">
                      {sec.content.map((line, i) => (
                        <RenderLine key={i} line={line} search={search} />
                      ))}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 px-6 md:px-12 py-8 mt-8">
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
            <span>© {new Date().getFullYear()} FORKSAI. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@forksai.app" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
      </div>

    </div>
  );
}
