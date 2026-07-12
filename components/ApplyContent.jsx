"use client";

import { useState } from "react";

export default function ApplyContent() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    type: "",
    program: "",
    institution: "",
    influencerType: "",
    username: "",
  });

  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type, influencerType: "", program: "", institution: "", username: "" }));
  };

  const handleInfluencerSelect = (influType) => {
    setFormData((prev) => ({ ...prev, influencerType: influType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/userHandler?action=submitApplication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 409) {
        setStatus("exists");
        setTimeout(() => setStatus("idle"), 4000);
        return;
      }

      if (!response.ok) throw new Error("Failed to submit application");

      setStatus("success");
      setFormData({ name: "", age: "", email: "", type: "", program: "", institution: "", influencerType: "", username: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-yellow selection:text-black">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FAFAFA] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-serif font-black text-2xl tracking-tight">
            FORKSAI<span className="text-yellow">.</span>
          </a>
        </div>
      </header>

      {/* Main Content - wide container, side-by-side on lg+ */}
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border-2 border-black rounded-xl px-3 py-1.5 bg-white shadow-[2px_2px_0_#111] text-xs font-bold transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            ← Back
          </button>
        </div>

        {/* Two-column layout: hero left, form right */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16 xl:gap-24">

          {/* LEFT - Hero / Intro */}
          <div className="lg:w-2/5 lg:sticky lg:top-28 mb-10 lg:mb-0">
            <div className="text-6xl sm:text-7xl mb-6 hover:scale-110 transition-transform cursor-default">🔈</div>
            <h1 className="font-serif font-black text-5xl sm:text-6xl xl:text-7xl leading-[1.06] text-[#111] mb-6 tracking-tight">
              Work with{" "}
              <span
                className="italic block"
                style={{
                  textDecoration: "underline",
                  textDecorationColor: "#F0D44A",
                  textDecorationThickness: "5px",
                  textUnderlineOffset: "6px",
                }}
              >
                us today
              </span>
            </h1>
            <p className="text-[#555] text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-sm">
              We're searching for passionate students and creative voices to join the FORKSAI movement. Ready to earn and learn together?
            </p>

            {/* Perks strip */}
            <div className="flex flex-col gap-3">
              {[
                { icon: "💸", label: "Earn real money" },
                { icon: "📚", label: "Access exclusive resources" },
                { icon: "🤝", label: "Join a growing community" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 border-2 border-black rounded-xl px-4 py-2.5 bg-white shadow-[2px_2px_0_#111] text-sm font-bold w-fit">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Info Pages Links */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = "/apply/ambassadors"; }}
                className="flex-1 bg-[#FAFAFA] border-2 border-black rounded-xl px-4 py-3 text-sm font-bold flex flex-col justify-center items-center shadow-[3px_3px_0_#8FBA55] transition-all hover:shadow-[1px_1px_0_#8FBA55] hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span>🎓 Read about</span>
                <span className="text-green uppercase tracking-wide text-xs">Student Ambassadors</span>
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = "/apply/creators"; }}
                className="flex-1 bg-[#FAFAFA] border-2 border-black rounded-xl px-4 py-3 text-sm font-bold flex flex-col justify-center items-center shadow-[3px_3px_0_#c084fc] transition-all hover:shadow-[1px_1px_0_#c084fc] hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span>🌟 Read about</span>
                <span className="text-purple-600 uppercase tracking-wide text-xs">Creator Affiliates</span>
              </button>
            </div>
          </div>

          {/* RIGHT - Form */}
          <div className="lg:w-3/5">
            <div className="bg-white border-4 border-black rounded-2xl p-8 xl:p-10 shadow-[6px_6px_0_#111]">
              <h2 className="text-xl font-black mb-6 uppercase tracking-wider">Application Form</h2>
              <form onSubmit={handleSubmit} className="space-y-5 text-left">

                {/* Name + Age row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs block">Full Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#FAFAFA] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 transition-all font-mono"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs block">Age</label>
                    <input
                      required
                      type="number"
                      name="age"
                      min="13"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full bg-[#FAFAFA] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 transition-all font-mono"
                      placeholder="19"
                    />
                  </div>
                </div>

                {/* Email - full width */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs block">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FAFAFA] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 transition-all font-mono"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Join type selector */}
                <div className="pt-4 border-t-2 border-dashed border-black/20">
                  <label className="font-black text-base block mb-3 uppercase">How do you want to join us?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleTypeSelect("student")}
                      className={`border-2 border-black rounded-xl px-4 py-4 font-bold text-sm text-center transition-all ${
                        formData.type === "student"
                          ? "bg-yellow shadow-[3px_3px_0_#111] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect("influencer")}
                      className={`border-2 border-black rounded-xl px-4 py-4 font-bold text-sm text-center transition-all ${
                        formData.type === "influencer"
                          ? "bg-yellow shadow-[3px_3px_0_#111] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      🌟 Influencer
                    </button>
                  </div>
                </div>

                {/* Student fields */}
                {formData.type === "student" && (
                  <div className="p-5 bg-blue-50 border-2 border-black rounded-xl space-y-4 shadow-[2px_2px_0_#111]">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-xs block">Institution Name</label>
                        <input
                          required
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                          className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 font-mono"
                          placeholder="E.g. Harvard University"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-xs block">Program / Major</label>
                        <input
                          required
                          type="text"
                          name="program"
                          value={formData.program}
                          onChange={handleChange}
                          className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 font-mono"
                          placeholder="E.g. Computer Science"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Influencer fields */}
                {formData.type === "influencer" && (
                  <div className="p-5 bg-purple-50 border-2 border-black rounded-xl space-y-4 shadow-[2px_2px_0_#111]">
                    <div>
                      <label className="font-bold text-xs block mb-2.5">Primary Platform</label>
                      <div className="flex gap-3">
                        {["tiktok", "youtube", "instagram"].map((plat) => (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleInfluencerSelect(plat)}
                            className={`flex-1 border-2 border-black rounded-full px-4 py-2 font-bold text-[11px] uppercase tracking-wide transition-all ${
                              formData.influencerType === plat
                                ? "bg-black text-white shadow-[2px_2px_0_#111] -translate-x-px -translate-y-px"
                                : "bg-white hover:bg-gray-100"
                            }`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.influencerType && (
                      <div className="space-y-1.5">
                        <label className="font-bold text-xs block capitalize">{formData.influencerType} Username</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">@</span>
                          <input
                            required
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-white border-2 border-black rounded-xl pl-8 pr-3 py-2 text-sm font-medium outline-none focus:ring-4 focus:ring-black/10 font-mono"
                            placeholder={`your_${formData.influencerType}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting" || !formData.type || (formData.type === "influencer" && !formData.influencerType)}
                  className="w-full mt-4 font-black text-base border-2 border-black rounded-xl px-6 py-4 bg-green text-white shadow-[4px_4px_0_#111] transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting"
                    ? "Submitting..."
                    : status === "success"
                    ? "Received! Wait 24 hrs, we'll contact you 🚀"
                    : status === "error"
                    ? "Error! Try Again"
                    : status === "exists"
                    ? "Response Already Recorded"
                    : "Apply Now →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
