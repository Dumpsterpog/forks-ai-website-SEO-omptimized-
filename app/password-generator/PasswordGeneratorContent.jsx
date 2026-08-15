"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  FormulaBlock,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CopyButton } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { PASSWORD_GENERATOR_FAQS } from "@/lib/textToolsFaqs";
import {
  CHARSETS,
  MIN_LENGTH,
  MAX_LENGTH,
  buildPool,
  generatePassword,
  entropyBits,
  strengthFor,
  averageCrackSeconds,
  formatDuration,
  GUESSES_PER_SECOND,
} from "@/lib/textToolsPassword";

const SET_KEYS = Object.keys(CHARSETS);

export default function PasswordGeneratorContent() {
  const [length, setLength] = useState(20);
  const [selected, setSelected] = useState({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [requireEach, setRequireEach] = useState(true);
  const [password, setPassword] = useState("");

  const pool = buildPool(selected, excludeAmbiguous);
  const bits = entropyBits(pool.length, length);
  const strength = strengthFor(bits);
  const crackTime = formatDuration(averageCrackSeconds(bits));

  const regenerate = useCallback(() => {
    setPassword(generatePassword({ length, selected, excludeAmbiguous, requireEach }));
  }, [length, selected, excludeAmbiguous, requireEach]);

  // Generated after mount rather than during render, because the server has no
  // password to render and a value produced during render would not match the
  // one the browser produces.
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const toggleSet = (key) => {
    setSelected((current) => {
      const next = { ...current, [key]: !current[key] };
      // Refuse to empty the pool entirely, since that leaves nothing to draw from.
      if (!SET_KEYS.some((item) => next[item])) return current;
      return next;
    });
  };

  return (
    <ToolPageShell>
      {/* The password and its controls come first. Everything explanatory is
          below them. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Password generator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Strong random passwords, generated on your device by the browser
          cryptographic generator and never sent anywhere. Pick the length and
          the character sets, and see the real entropy in bits rather than a
          colour coded guess. Free and no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <label htmlFor="password" className={labelClass}>
            Your password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            readOnly
            value={password}
            spellCheck="false"
            autoComplete="off"
            aria-describedby="entropy-readout"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3.5 font-mono text-base sm:text-lg font-bold text-[#111] break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={regenerate} className={buttonClass}>
              <RefreshCw size={14} strokeWidth={2.75} /> Generate again
            </button>
            <CopyButton value={password} label="Copy password" disabled={!password} />
          </div>

          <div className="mt-6">
            <label htmlFor="length" className={labelClass}>
              Length: {length} characters
            </label>
            <div className="flex items-center gap-3">
              <input
                id="length"
                name="length"
                type="range"
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="flex-1 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded-lg"
              />
              <input
                type="number"
                aria-label="Length in characters"
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                value={length}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setLength(Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(next))));
                  }
                }}
                className="w-20 border-2 border-black rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#111] outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
              />
            </div>
          </div>

          <fieldset className="mt-5 border-2 border-black rounded-xl px-4 py-3">
            <legend className="text-xs font-black uppercase tracking-widest text-[#111]/60 px-1">
              Characters to use
            </legend>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {SET_KEYS.map((key) => (
                <label
                  key={key}
                  htmlFor={`set-${key}`}
                  className="flex items-center gap-2 text-sm text-[#111] cursor-pointer"
                >
                  <input
                    id={`set-${key}`}
                    name={`set-${key}`}
                    type="checkbox"
                    checked={selected[key]}
                    onChange={() => toggleSet(key)}
                    className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                  />
                  <span>
                    {CHARSETS[key].label}{" "}
                    <span className="text-[#777] font-mono text-xs">{CHARSETS[key].sample}</span>
                  </span>
                </label>
              ))}
              <label
                htmlFor="exclude-ambiguous"
                className="flex items-center gap-2 text-sm text-[#111] cursor-pointer"
              >
                <input
                  id="exclude-ambiguous"
                  name="exclude-ambiguous"
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                <span>
                  Exclude look alike characters{" "}
                  <span className="text-[#777] font-mono text-xs">I l 1 O 0</span>
                </span>
              </label>
              <label
                htmlFor="require-each"
                className="flex items-center gap-2 text-sm text-[#111] cursor-pointer"
              >
                <input
                  id="require-each"
                  name="require-each"
                  type="checkbox"
                  checked={requireEach}
                  onChange={(e) => setRequireEach(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                <span>At least one from each set</span>
              </label>
            </div>
          </fieldset>

          {/* aria-live so a screen reader hears the new password and the new
              entropy figure as the options change. */}
          <div id="entropy-readout" aria-live="polite" className="mt-5">
            <div className="border-2 border-black rounded-xl px-4 py-3" style={{ background: "#F0D44A" }}>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
                Entropy
              </p>
              <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
                {bits.toFixed(1)} bits
              </p>
              <p className="text-sm text-[#111]/80 mt-1">
                {strength.label}. {strength.note}
              </p>
            </div>
            <p className="text-xs text-[#666] mt-2 leading-relaxed">
              {length} characters drawn from a pool of {pool.length}, so{" "}
              {length} &times; log<sub>2</sub>({pool.length}) = {bits.toFixed(1)} bits. An attacker
              who has stolen the password database and can try{" "}
              {GUESSES_PER_SECOND.toExponential(0)} guesses per second against a fast hash needs{" "}
              {crackTime} on average. That guessing rate is an assumption, not a measurement, and a
              slow hash such as bcrypt or Argon2 makes it far worse for the attacker.
            </p>
            {requireEach ? (
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                Requiring one character from each set removes a few possible passwords from the
                pool, so the true figure is a fraction of a bit under the number above.
              </p>
            ) : null}
          </div>

          <OnDeviceNote>
            The password is produced by crypto.getRandomValues in this tab. It is never sent
            over the network, never logged and never stored, so closing the page is all it
            takes to destroy it.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Where the randomness comes from">
        <p>
          Every character is drawn with{" "}
          <strong>crypto.getRandomValues</strong>, the browser cryptographically
          secure generator, seeded by the operating system. The other obvious
          candidate, Math.random, is a fast statistical generator with a
          predictable internal state, and an attacker who sees a few of its
          outputs can reconstruct the rest. It has no business generating a
          secret, and it appears nowhere in this tool.
        </p>
        <p>
          Picking a character also has to be done carefully. Taking the remainder
          of a raw random number by the pool size makes the first few characters
          of the pool very slightly more likely than the rest, because the number
          range does not divide evenly. This generator rejects and redraws the
          values that fall in that uneven tail, so every character is equally
          likely.
        </p>
      </ToolSection>

      <ToolSection title="What entropy in bits means">
        <p>
          A password chosen at random from a pool of P characters, L characters
          long, could have come out P<sup>L</sup> different ways, all equally
          likely. Entropy states that number as a power of two, which is a more
          workable size.
        </p>
        <FormulaBlock>entropy in bits = length &times; log2(pool size)</FormulaBlock>
        <p>
          Sixteen characters from the 62 character letters and digits pool is 16
          &times; log2(62) = 95.3 bits. Add the symbol set for a pool of 89 and
          the same length gives 103.6 bits. Drop to 8 characters from a pool of
          64 and the number is exactly 48 bits, which is small enough to fall in
          an afternoon.
        </p>
        <p>
          This is a property of how the password was generated, not of the string
          it produced. A password manager entry and a memorable phrase can print
          the same characters and have wildly different entropy, because what
          matters is how many other passwords were equally likely to appear.
        </p>
      </ToolSection>

      <ToolSection title="Why the coloured strength meters mislead">
        <p>
          Most strength meters score the string in front of them: one point for a
          capital, one for a digit, one for a symbol. Password1! collects all
          three and still falls almost immediately, because it is a dictionary
          word with the exact decorations every cracking tool tries first.
        </p>
        <p>
          Length is the cheapest real improvement. Every extra character
          multiplies the search space by the pool size, so going from 12 to 16
          characters is worth far more than adding one exclamation mark to the
          end of a short password.
        </p>
        <p>
          A practical target is 80 bits or more for anything you would mind
          losing, which is around 13 characters of letters and digits. Above 100
          bits the password is no longer the weak part of your security, and your
          attention is better spent on turning on two factor authentication and
          never reusing the password anywhere else.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PASSWORD_GENERATOR_FAQS} />
      </ToolSection>

      <ToolCta
        location="password_generator"
        heading="Good at remembering passwords. Better at remembering your course."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so the material you are studying stays in your head."
      />

      <TextToolCrossLinks current="/password-generator" />
    </ToolPageShell>
  );
}
