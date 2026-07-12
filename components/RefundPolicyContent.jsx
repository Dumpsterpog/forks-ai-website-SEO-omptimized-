"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, RefreshCcw } from "lucide-react";
import { dmSerifDisplay, dmSans } from "@/lib/fonts";

/* ── Section data ── */
const sections = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          This Refund Policy explains how refunds, cancellations, and billing disputes are handled for <strong className="text-white">FORKSAI</strong>. By purchasing a paid subscription, you acknowledge and agree to this policy alongside our Terms & Conditions and Privacy Policy.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">
          All subscription fees are generally <strong className="text-white">non-refundable</strong>, except as expressly stated below or required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "plans",
    title: "Subscription Plans",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "FORKSAI offers 1-day, monthly, yearly, and Lifetime Premium plans.",
          "1-day, monthly, and yearly subscriptions renew automatically according to the selected billing cycle unless canceled before the renewal date.",
          "The Lifetime plan is a one-time purchase that provides permanent Premium access with no recurring charges.",
          "Access to Premium features remains active until the end of the current billing period, even after cancellation of a recurring plan.",
          "Plan pricing is displayed at checkout and may be updated with reasonable notice.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "non-refundable",
    title: "General Refund Policy",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          We do not provide refunds or credits for the following:
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Partial subscription periods remaining after cancellation.",
            "Unused AI features, generation limits, or tool access during a billing period.",
            "Subscription renewals that were not canceled before the renewal date.",
            "Changes in personal circumstances, usage patterns, or academic schedules.",
            "Dissatisfaction with AI-generated content quality - outputs are provided as-is for educational purposes.",
            "Lifetime plan purchases - see the dedicated Lifetime section below for full details.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-zinc-700 shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "expectations",
    title: "Expectations, Change of Mind & Alternatives",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Premium is a digital service whose features are described in full on our pricing and feature pages before you pay. By purchasing, you confirm that you have reviewed what is included and that it suits your needs. Because access is granted instantly, we do not provide refunds simply because the Service, or any part of it, did not meet your personal expectations, preferences, or workflow.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          For clarity, the following are <strong className="text-white">not</strong> grounds for a refund or credit:
        </p>
        <ul className="space-y-3 text-sm text-zinc-400 mb-4">
          {[
            "The Service, or a specific feature, did not work the way you hoped or imagined it would.",
            "You changed your mind, no longer need the Service, or purchased by mistake.",
            "You found, or later switched to, a different tool or service that you prefer. Discovering or moving to an alternative is not a basis for a refund, credit, or plan change.",
            "You did not use, or stopped using, the Premium features during your billing period.",
            "Dissatisfaction with the style, tone, length, or quality of AI-generated content, which is provided as-is for educational purposes.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-zinc-700 shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Some situations are excluded from the above and may still qualify. If you report a confirmed technical fault on our side that prevents you from using a paid feature, we will work to resolve it within <strong className="text-white">one week (7 days)</strong> of your report. The outcome is handled as follows:
        </p>
        <ul className="space-y-3 text-sm text-zinc-400 mb-4">
          {[
            "If the fault is fixed within one week, no refund is issued. Instead, as compensation, we extend your subscription by the number of days the issue affected your access.",
            "If the fault is not resolved within one week, you are entitled to a full refund of the affected billing period.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Other limited exceptions - such as a duplicate charge or a payment you did not authorize - are covered in the <span className="text-[#b5ff4d]">Eligible Refund Scenarios</span> section below. Nothing in this policy limits any non-waivable rights you may have as a consumer under the laws of your jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "daily-plan",
    title: "1-Day Subscriptions",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          The 1-day plan provides 24 hours of full Premium access and renews automatically every day.
        </p>
        <div className="border border-white/8 rounded-xl p-5 bg-white/2">
          <ul className="space-y-3 text-sm text-zinc-400">
            {[
              "No refunds are provided for 1-day subscriptions once the billing cycle has started.",
              "You may cancel at any time to prevent future daily renewals.",
              "Cancellation takes effect immediately for future charges - the current day's access is not refunded.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "monthly-yearly",
    title: "Monthly & Yearly Subscriptions",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Monthly and yearly plans are billed in advance for the full selected period.",
          "Once a billing cycle has started, the payment is non-refundable.",
          "Canceling a subscription stops future charges but does not issue a partial refund for unused time.",
          "Yearly subscribers who cancel mid-period retain Premium access until the annual period ends.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "lifetime",
    title: "Lifetime Plan - No Refunds",
    content: (
      <>
        <div className="border border-white/10 rounded-xl p-5 bg-white/2 mb-5" style={{ borderColor: "rgba(168,130,255,0.2)", background: "rgba(168,130,255,0.04)" }}>
          <p className="text-sm text-zinc-300 leading-relaxed font-medium mb-1">
            The Lifetime plan is <span style={{ color: "#a882ff" }}>strictly non-refundable under all circumstances.</span>
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed mt-2">
            By completing a Lifetime purchase, you explicitly agree that no refund will be issued - regardless of reason.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "The Lifetime plan is a one-time, non-recurring payment of $99.99 USD.",
            "Once payment is confirmed, the transaction is final and cannot be reversed by FORKSAI.",
            "Accidental purchases, change of mind, or failure to cancel before purchasing are not grounds for a refund.",
            "Purchasing the Lifetime plan while already on a recurring subscription does not entitle you to a refund for the remaining subscription period.",
            "If you believe your account was charged fraudulently or without your authorization, contact us immediately at support@forksai.app - confirmed fraud cases will be reviewed separately.",
            "We strongly recommend reviewing all plan details at checkout before completing a Lifetime purchase.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span style={{ color: "#a882ff" }} className="shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-zinc-600 leading-relaxed">
          By purchasing the Lifetime plan you confirm that you have read and understood this policy in full, and that you accept the no-refund terms as a condition of the purchase.
        </p>
      </>
    ),
  },
  {
    id: "eligible",
    title: "Eligible Refund Scenarios",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Refunds may be considered in limited and exceptional circumstances only (excluding Lifetime purchases, which are never refundable):
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Duplicate charges caused by a confirmed billing error on our end.",
            "Verified technical issues that prevent access to Premium features for an extended period and cannot be resolved within a reasonable timeframe.",
            "Unauthorized or fraudulent transactions confirmed after review.",
            "Other exceptional cases approved at our sole discretion.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "process",
    title: "How to Request a Refund",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          To request a refund, contact us at <a href="mailto:support@forksai.app" className="text-[#b5ff4d] hover:underline underline-offset-4">support@forksai.app</a> with the following:
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Your account email address.",
            "The date and amount of the charge in question.",
            "A clear explanation of the issue.",
            "Any relevant screenshots or supporting details.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-600">
          Refund requests are reviewed within 5–7 business days. Note: refund requests for Lifetime purchases will not be approved.
        </p>
      </>
    ),
  },
  {
    id: "payment-provider",
    title: "Payment Processing",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        All payments are processed securely through <strong className="text-white">Dodo Payments</strong>. Approved refunds are returned to the original payment method according to Dodo Payments' processing timelines - typically 5–10 business days depending on your bank or card provider. FORKSAI has no control over how quickly your financial institution processes the return.
      </p>
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks & Disputes",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        If you initiate a chargeback with your payment provider without first contacting us, we reserve the right to suspend or permanently terminate your account and access to FORKSAI. We strongly encourage you to reach out to our support team first - most billing issues can be resolved quickly without involving your payment provider.
      </p>
    ),
  },
  {
    id: "cancel",
    title: "How to Cancel",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Recurring subscriptions (1-day, monthly, yearly) can be managed and canceled from the FORKSAI dashboard under Premium settings.",
          "The Lifetime plan has no subscription to cancel - access is permanent and no future charges will occur.",
          "Cancellation of a recurring plan prevents future renewals but does not revoke access until the end of the current billing period.",
          "After cancellation, you retain access to free-tier features - manual flashcard creation, the study dashboard, and streak tracking.",
          "AI-powered features (Summarizer, AI Flashcards, Quiz Generator, Revision Modes) are locked at the end of the billing period.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We may update this Refund Policy from time to time to reflect pricing changes, billing model updates, or legal requirements. The most recent revision date will always appear below.
        </p>
        <p className="mt-3 text-xs text-zinc-600 italic">Last updated: June 9, 2026 (v1.2)</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact & Support",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          For billing questions, refund requests, or payment issues:
        </p>
        <p className="mt-3">
          <a href="mailto:support@forksai.app" className="text-[#b5ff4d] hover:underline underline-offset-4 text-sm font-medium">
            support@forksai.app
          </a>
        </p>
        <p className="mt-3 text-xs text-zinc-600">We typically respond within 7 business days.</p>
      </>
    ),
  },
];

/* ── Component ── */
export default function RefundPolicyContent() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div
      className={`${dmSans.variable} ${dmSerifDisplay.variable} min-h-screen bg-[#080808] text-zinc-100`}
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* grain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-6 w-auto" />
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase leading-none">FORKSAI</p>
              <p className="text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">Refund Policy</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs">
            <a href="/" className="text-zinc-500 hover:text-white transition-colors">← Back home</a>
            <a href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
            <span className="text-[#b5ff4d] font-medium">Refunds</span>
          </nav>

          <button onClick={() => setNavOpen(v => !v)} className="md:hidden p-1.5 border border-white/8 rounded-lg text-zinc-400">
            {navOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {navOpen && (
          <div className="md:hidden border-t border-white/6 bg-[#080808]">
            <div className="px-6 py-4 flex flex-col gap-3 text-sm">
              <a href="/" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">← Back home</a>
              <a href="/privacy-policy" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Terms & Conditions</a>
              <span className="text-[#b5ff4d] font-medium">Refund Policy</span>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 pt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/8 rounded-full mb-6">
              <RefreshCcw size={12} className="text-[#b5ff4d]" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Billing & Refunds</span>
            </div>
            <h1
              style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
              className="text-[2.2rem] md:text-[2.8rem] font-normal leading-tight mb-3"
            >
              Refund Policy
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              This page explains how refunds, cancellations, and billing disputes are handled for FORKSAI Premium subscriptions.
            </p>
            <p className="text-xs text-zinc-700 mt-3 uppercase tracking-widest">Last updated: June 9, 2026 · v1.2</p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-[200px_1fr] gap-12">

            {/* Sticky TOC */}
            <aside className="hidden md:block">
              <div className="sticky top-28">
                <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 mb-4">On this page</p>
                <ul className="space-y-2">
                  {sections.map(s => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`text-xs transition-colors leading-relaxed block ${
                          s.id === "lifetime"
                            ? "text-zinc-500 hover:text-[#a882ff]"
                            : "text-zinc-600 hover:text-[#b5ff4d]"
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <div className="divide-y divide-white/5">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="scroll-mt-28 py-10 first:pt-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-[10px] font-mono text-zinc-700 pt-1 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
                      className={`text-xl font-normal ${section.id === "lifetime" ? "" : "text-white"}`}
                      {...(section.id === "lifetime" ? { style: { color: "#a882ff", fontFamily: "var(--font-dm-serif-display), serif" } } : {})}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <div className="ml-10">
                    {section.content}
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-white/5 px-6 md:px-12 py-8 mt-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
            <span>© {new Date().getFullYear()} FORKSAI. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@forksai.app" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
