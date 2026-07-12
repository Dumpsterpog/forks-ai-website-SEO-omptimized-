"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  Play,
  Sparkles,
  Video,
  Scissors,
  Clock3,
  Captions,
  Wand2,
  ShieldCheck,
  Zap,
  X,
  Users,
  Home,
} from "lucide-react";

const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

const Badge = ({ children }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-200 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
};

const Pill = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-zinc-200 transition-all duration-700`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc, linear, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border border-white/5 bg-white/2 p-6 md:p-7 overflow-hidden transition-all duration-700`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          background: `radial-linear(circle at 30% 20%, ${linear} 0%, transparent 55%)`,
        }}
      />
      <div className="relative">
        <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="text-zinc-400 text-sm leading-relaxed mt-2">{desc}</div>
      </div>
    </div>
  );
};

const Step = ({ index, title, desc, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="flex gap-4 transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(-30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
        {index}
      </div>
      <div>
        <div className="text-white font-semibold">{title}</div>
        <div className="text-zinc-400 text-sm mt-1 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
};

const FAQItem = ({ q, a, delay = 0 }) => {
  const [open, setOpen] = useState(false);
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/2 transition"
      >
        <span className="font-semibold text-white">{q}</span>
        <span className="text-zinc-400 transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>{open ? "-" : "+"}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: open ? "500px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-6 pb-5">
          <div className="text-zinc-400 text-sm leading-relaxed">{a}</div>
        </div>
      </div>
    </div>
  );
};

const UseCaseCard = ({ title, desc, icon: Icon, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/5 bg-white/2 p-7 hover:border-white/10 hover:bg-white/3 transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-white font-bold text-lg">{title}</div>
      <div className="text-zinc-400 text-sm mt-2 leading-relaxed">{desc}</div>
    </div>
  );
};
const SectionTitle = ({ title }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="text-3xl md:text-4xl font-black text-white transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(18px)",
      }}
    >
      {title}
    </div>
  );
};

const SectionSubtitle = ({ text }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <p
      ref={ref}
      className="text-zinc-400 mt-3 max-w-2xl mx-auto leading-relaxed transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(18px)",
        transitionDelay: "120ms",
      }}
    >
      {text}
    </p>
  );
};

const SectionCard = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/10 bg-linear-to-b from-white/5 to-white/1.5 p-8 md:p-10 backdrop-blur-sm transition-all duration-700 hover:border-white/15 hover:bg-white/3"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default function ClipsComingSoon() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = useMemo(
    () => [
      {
        icon: Scissors,
        title: "Auto-clip from the good parts",
        desc: "Forks scans your video for peaks - pacing changes, reactions, hooks - and proposes clips with timestamps so you can pick fast.",
        linear: "rgba(16,185,129,0.18)",
      },
      {
        icon: Captions,
        title: "Captions that actually look clean",
        desc: "Modern subtitle styling, smart line breaks, emoji-safe. We're focusing on readability, not spammy text.",
        linear: "rgba(59,130,246,0.18)",
      },
      {
        icon: Wand2,
        title: "Title + hook suggestions",
        desc: "Get multiple hook options for each clip so you can test what performs best without rewriting everything yourself.",
        linear: "rgba(139,92,246,0.18)",
      },
      {
        icon: Clock3,
        title: "Perfect lengths for every platform",
        desc: "15s / 30s / 60s presets + creator-friendly pacing. Auto trims filler while preserving context.",
        linear: "rgba(236,72,153,0.16)",
      },
      {
        icon: ShieldCheck,
        title: "Privacy first",
        desc: "We're building this with a strict privacy approach: no selling data, and clear user control over uploads.",
        linear: "rgba(251,146,60,0.16)",
      },
      {
        icon: Zap,
        title: "Fast exports",
        desc: "Generate clips in batches and export clean MP4s ready to post. No complicated timeline editing required.",
        linear: "rgba(14,165,233,0.16)",
      },
    ],
    []
  );

  const useCases = [
    {
      title: "YouTube creators",
      desc: "Turn long videos into 5–20 shorts without spending hours on editing.",
      icon: Video,
    },
    {
      title: "Educators",
      desc: "Clip key moments from lessons and publish bite-sized revision content.",
      icon: Sparkles,
    },
    {
      title: "Podcasters",
      desc: "Auto-detect highlights and export clean reels with captions.",
      icon: Play,
    },
  ];

  const faqs = [
    {
      q: "Is this available right now?",
      a: "Not yet. We're finishing the first production version. The goal is to launch early access soon with limited seats so we can keep it stable and fast.",
    },
    {
      q: "Will it be free?",
      a: "We'll have a free tier for trying it out. Power features (batch exports, premium caption styles, longer videos) will be part of Premium.",
    },
    {
      q: "What kind of videos will it support?",
      a: "General creator content first (talking head, podcast, screen recordings). We'll keep improving clip detection over time.",
    },
    {
      q: "How do you handle privacy?",
      a: "We're building privacy-first from day one: your uploads are yours. Clear controls and no shady usage of personal content.",
    },
  ];

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setToast("Please enter a valid email address");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/accountRequests?action=waitlist", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    reason: "clips_waitlist",
    waitlist: "clips", // optional tag
  }),
});

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setStatus(data.status === "exists" ? "exists" : "created");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background with parallax effect */}
      <div
        className="fixed inset-0 transition-transform duration-300"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          background: `radial-linear(circle at 50% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
                       radial-linear(circle at 100% 45%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                       radial-linear(circle at 0% 100%, rgba(139, 92, 246, 0.04) 0%, transparent 45%)`,
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-linear(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-linear(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Top bar */}
   <header className="relative z-20 px-6 pt-6 animate-slideDown">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    {/* Left: Logo */}
    <div className="flex items-center gap-3">
      <img src="/forks-logo.png" alt="Forks" className="h-9 w-14" />
      <span className="text-lg font-bold tracking-tight">FORKS</span>
    </div>

    {/* Right: Nav buttons */}
   <div className="flex items-center gap-3">
  <a
    href="/"
    className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-zinc-200 inline-flex items-center gap-2"
  >
    <Home size={16} />
    Home
  </a>

  <a
    href="/docs"
    className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-zinc-200"
  >
    Docs
  </a>
</div>
  </div>
</header>


      <main className="relative z-10">
        {/* HERO WITH WAITLIST */}
        <section className="px-6 pt-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left - Hero Content */}
              <div>
                <Badge>
                  <Sparkles size={16} className="text-emerald-300" />
                  New: Clips Tool (Early access soon)
                </Badge>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mt-6 animate-fadeInUp">
                  Turn one video into
                  <span className="block bg-linear-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-1 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                    10 clean clips
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 mt-6 max-w-xl leading-relaxed animate-fadeInUp" style={{ animationDelay: "200ms" }}>
                  Upload a long video. Forks finds the moments worth clipping,
                  generates short versions, and formats them for Shorts / Reels /
                  TikTok.
                  <span className="text-zinc-300 font-medium">
                    {" "}
                    No timeline editing. No guesswork.
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 mt-8">
                  <Pill delay={0}>⚡ Fast clip suggestions</Pill>
                  <Pill delay={100}>🧠 Smart captions</Pill>
                  <Pill delay={200}>🔒 Privacy-first</Pill>
                </div>
              </div>

              {/* Right - Waitlist Card */}
              <div className="relative animate-fadeInUp" style={{ animationDelay: "300ms" }}>
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-linear-to-b from-white/[0.07] to-white/2 overflow-hidden backdrop-blur-sm hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10">
                  <div
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{
                      background:
                        "radial-linear(circle at 30% 20%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-linear(circle at 80% 70%, rgba(59,130,246,0.1) 0%, transparent 50%)",
                    }}
                  />

                  <div className="relative p-8">
                    {/* Social Proof */}
                    <div className="mb-6 flex flex-col items-center">
                      <div className="flex -space-x-2 mb-3">
                        {[
                          { bg: "from-purple-500 to-pink-500", text: "AT" },
                          { bg: "from-blue-500 to-cyan-500", text: "VT" },
                          { bg: "from-green-500 to-emerald-500", text: "MP" },
                          { bg: "from-orange-500 to-red-500", text: "OG" },
                          { bg: "from-yellow-500 to-amber-500", text: "VM" },
                        ].map((avatar, i) => (
                          <div
                            key={i}
                            className={`w-9 h-9 rounded-full bg-linear-to-br ${avatar.bg} border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-semibold shadow-lg animate-scaleIn`}
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            {avatar.text}
                          </div>
                        ))}
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium shadow-lg animate-scaleIn" style={{ animationDelay: "250ms" }}>+245</div>
                      </div>
                      <p className="text-sm text-emerald-400 font-medium flex items-center gap-2 animate-fadeIn" style={{ animationDelay: "400ms" }}>
                        <Users className="w-4 h-4" />
                        250+ creators already on the waitlist
                      </p>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                      Get Early Access
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                      Join the waitlist and be among the first to try our clips tool. Limited spots available.
                    </p>

                    {/* Waitlist Input */}
                    {!status || status === "error" ? (
                      <div className="space-y-3">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent text-white placeholder:text-zinc-500 transition-all duration-300 focus:scale-[1.02]"
                        />

                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full px-6 py-3.5 rounded-xl bg-linear-to-r from-emerald-400 to-cyan-400 text-black font-bold hover:from-emerald-300 hover:to-cyan-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                        >
                          {loading ? (
                            "Joining..."
                          ) : (
                            <>
                              Join Waitlist
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : null}

                    {/* Status Messages */}
                    {status === "created" && (
                      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-300 animate-slideIn">
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">You're on the waitlist!</div>
                            <div className="text-sm text-emerald-400/80">We'll notify you when early access opens 🚀</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {status === "exists" && (
                      <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-yellow-300 animate-slideIn">
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">Already registered</div>
                            <div className="text-sm text-yellow-400/80">This email is on the waitlist. You're all set!</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {status === "error" && (
                      <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-300 animate-slideIn">
                        <div className="flex items-start gap-3">
                          <X className="w-5 h-5 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">Something went wrong</div>
                            <div className="text-sm text-red-400/80">Please try again or contact support</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-zinc-500 mt-4 text-center">
                      No spam. Just launch updates and your early access invite.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  k: "Made for output",
                  v: "Create clips at scale without losing quality.",
                  delay: 0,
                },
                {
                  k: "Creator-friendly",
                  v: "No over-edited captions. Clean formats.",
                  delay: 100,
                },
                {
                  k: "Built into Forks",
                  v: "Works alongside Legacy, Flashcards, Quiz, etc.",
                  delay: 200,
                },
              ].map((x) => {
                const [ref, isVisible] = useScrollAnimation();
                return (
                  <div
                    key={x.k}
                    ref={ref}
                    className="rounded-2xl border border-white/5 bg-white/2 p-6 hover:border-white/10 hover:bg-white/3 transition-all duration-700"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(20px)",
                      transitionDelay: `${x.delay}ms`,
                    }}
                  >
                    <div className="text-white font-bold">{x.k}</div>
                    <div className="text-zinc-400 text-sm mt-2 leading-relaxed">
                      {x.v}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <SectionTitle title="What this tool will do" />
              <SectionSubtitle text="We're not building another random 'clip generator'. This is meant to feel like a real workflow you can rely on." />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Feature key={f.title} {...f} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <SectionCard delay={0}>
              <div className="text-2xl md:text-3xl font-black text-white">
                How it works
              </div>
              <div className="text-zinc-400 mt-3 leading-relaxed">
                The goal is simple: upload once, export clips you're actually
                proud to post.
              </div>

              <div className="mt-8 space-y-6">
                <Step
                  index="01"
                  title="Upload your long video"
                  desc="Podcast, lecture, screen recording or talking head. Forks reads audio + pacing patterns."
                  delay={0}
                />
                <Step
                  index="02"
                  title="Pick suggested moments"
                  desc="You'll get clip candidates with timestamps + short reasons why they were selected."
                  delay={100}
                />
                <Step
                  index="03"
                  title="Export in your style"
                  desc="Subtitles, safe margins, pacing presets, and clean formatting. No clutter."
                  delay={200}
                />
              </div>
            </SectionCard>

            <SectionCard delay={200}>
              <div className="text-2xl md:text-3xl font-black text-white">
                Built for creators who post consistently
              </div>
              <div className="text-zinc-400 mt-3 leading-relaxed">
                We're focusing on small details that matter: smooth captions,
                good defaults, quick exports, and predictable results.
              </div>

              <div className="mt-7 space-y-3">
                {[
                  "Detect hooks + standout moments",
                  "Caption styles that match your brand",
                  "Batch export clips in one go",
                  "Shorts/Reels/TikTok formatting presets",
                  "No watermark in Premium",
                ].map((x, i) => {
                  const [ref, isVisible] = useScrollAnimation();
                  return (
                    <div
                      key={x}
                      ref={ref}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition-all duration-700"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateX(0)" : "translateX(-20px)",
                        transitionDelay: `${i * 50}ms`,
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                        <Check className="w-4 h-4 text-emerald-200" />
                      </div>
                      <div className="text-zinc-200 text-sm">{x}</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </section>

        {/* USE CASES */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <SectionTitle title="Who it's for" />
              <SectionSubtitle text="If you create long-form content, this saves you hours every week." />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((u, i) => (
                <UseCaseCard key={u.title} {...u} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <SectionTitle title="FAQ" />
              <SectionSubtitle text="Quick answers before you ask us in Discord 😭" />
            </div>

            <div className="grid gap-4">
              {faqs.map((f, i) => (
                <FAQItem key={f.q} q={f.q} a={f.a} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src="/forks-logo.png" alt="FORKS" className="h-9 w-14" />
                <div>
                  <div className="font-bold">FORKS</div>
                  <div className="text-zinc-500 text-sm">
                    ClipStudio - Coming Soon
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <a href="/" className="text-zinc-400 hover:text-white transition-all duration-300">
                  Home
                </a>
                <a href="/ai-study-tools" className="text-zinc-400 hover:text-white transition-all duration-300">
                  AI Study Tools
                </a>
                <a href="/docs" className="text-zinc-400 hover:text-white transition-all duration-300">
                  Docs
                </a>
                <a href="/privacy-policy" className="text-zinc-400 hover:text-white transition-all duration-300">
                  Privacy
                </a>
                <a href="/terms" className="text-zinc-400 hover:text-white transition-all duration-300">
                  Terms
                </a>
              </div>
            </div>

            <div className="text-xs text-zinc-600">
              © {new Date().getFullYear()} FORKS. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-black/80 border border-white/10 backdrop-blur-xl text-sm shadow-2xl">
          <div className="flex items-center gap-3 text-zinc-200">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            {toast}
            <button
              onClick={() => setToast("")}
              className="ml-2 opacity-70 hover:opacity-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}