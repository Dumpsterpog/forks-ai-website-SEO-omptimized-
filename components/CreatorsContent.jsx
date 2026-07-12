"use client";

export default function CreatorsContent() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-purple-200 selection:text-black">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FAFAFA] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-serif font-black text-2xl tracking-tight">
            FORKSAI<span className="text-yellow">.</span>
          </a>
        </div>
      </header>

      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border-2 border-black rounded-xl px-3 py-1.5 bg-white shadow-[2px_2px_0_#111] text-xs font-bold transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            ← Back
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16 xl:gap-24">

          {/* LEFT — Hero / Intro */}
          <div className="lg:w-2/5 lg:sticky lg:top-28 mb-10 lg:mb-0">
            <div className="text-6xl sm:text-7xl mb-6 hover:scale-110 transition-transform cursor-default">🌟</div>
            <h1 className="font-serif font-black text-5xl sm:text-6xl xl:text-7xl leading-[1.06] text-[#111] mb-6 tracking-tight">
              Creator{" "}
              <span
                className="italic block"
                style={{
                  textDecoration: "underline",
                  textDecorationColor: "#c084fc",
                  textDecorationThickness: "5px",
                  textUnderlineOffset: "6px",
                }}
              >
                Affiliates
              </span>
            </h1>
            <p className="text-[#555] text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-sm">
              Create content, share FORKSAI with your audience, and build a serious revenue stream.
            </p>

            {/* Quick-stat pills */}
            <div className="flex flex-col gap-3">
              {[
                { icon: "🎥", label: "TikTok, YouTube & Instagram" },
                { icon: "💸", label: "Revenue share & flat fees" },
                { icon: "📈", label: "Analytics-based payouts" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-2 border-black rounded-xl px-4 py-2.5 bg-white shadow-[2px_2px_0_#111] text-sm font-bold w-fit"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Content card */}
          <div className="lg:w-3/5">
            <div className="bg-white border-4 border-black rounded-2xl p-8 xl:p-10 shadow-[6px_6px_0_#111]">
              <div className="space-y-8">

                <div>
                  <h2 className="text-2xl font-black mb-3 uppercase tracking-wider">The Vision 🎥</h2>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    As a Creator Affiliate, you hold the megaphone. Share how FORKSAI transforms the way
                    students summarize notes, flip through AI flashcards, and crush exam prep. Create authentic
                    tutorials, reels, or shoutouts that matter to your audience.
                  </p>
                </div>

                <div className="border-t-2 border-dashed border-black/20 pt-8">
                  <h2 className="text-2xl font-black mb-3 uppercase tracking-wider">Perks &amp; Commissions 💸</h2>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    <span className="bg-purple-100 font-bold px-1 rounded">
                      All high-tier perks, flat-fee sponsorships, and revenue share commissions are discussed
                      over email
                    </span>{" "}
                    once you apply. We are dedicated to ensuring you get paid generously for the students you
                    empower based on your analytics. Just reach out!
                  </p>
                </div>

                <div className="border-t-2 border-dashed border-black/20 pt-8">
                  <h2 className="text-xl font-black mb-4">Ready to start earning?</h2>
                  <button
                    onClick={() => { window.location.href = "/apply"; }}
                    className="w-full font-black text-base border-2 border-black rounded-xl px-6 py-4 bg-black text-white shadow-[4px_4px_0_#c084fc] transition-all hover:shadow-[2px_2px_0_#c084fc] hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    Apply as a Creator →
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
