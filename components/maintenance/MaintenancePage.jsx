"use client";

import { MotionConfig, motion } from "framer-motion";
import ServerRoom from "./ServerRoom";
import MisoWhack from "./MisoWhack";
import "./maintenance.css";

// The maintenance page (/maintenance). Built for the dashboard app and moved
// here, so it stays up when the app itself is down.
//
// Miso has got into the server room and is chewing the cables, which is why
// FORKSAI is down; the engineers are untangling it. Under the picture is a
// game to play while waiting: shoo Miso away from the servers.

const MotionDiv = motion.div;

export default function MaintenancePage({ fontClass = "" }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`mn-page ${fontClass}`}>
        <header className="mn-header">
          <a href="/" className="mn-brand" aria-label="FORKSAI home">
            FORKSAI
          </a>
          <a href="/dashboard" className="mn-retry-small">
            Try again
          </a>
        </header>

        {/* Desktop: the picture and the words on the left, the game on the
            right, all on one screen. Phone: the words, then the game, then
            the picture, so the game is on screen without scrolling. */}
        <main className="mn-main">
          <div className="mn-left">
            <MotionDiv className="mn-scene-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <ServerRoom />
            </MotionDiv>
            <MotionDiv className="mn-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <h1>We&apos;ll be back shortly</h1>
              <p>
                Miso got into the server room and decided the cables were snacks. We&apos;re untangling everything now. Your decks and notes are safe.
              </p>
              <a href="/dashboard" className="mn-retry">
                Try FORKSAI again
              </a>
            </MotionDiv>
          </div>
          <MotionDiv className="mn-right" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <MisoWhack />
          </MotionDiv>
        </main>
      </div>
    </MotionConfig>
  );
}
