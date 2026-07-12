"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";


/* ── Shared CSS ───────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:#f6f7fb; font-family:'DM Sans',sans-serif; color:#1a1d28; overflow-x:hidden; }

  .nav { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(255,255,255,0.92); backdrop-filter:blur(16px); border-bottom:1px solid rgba(66,85,255,0.08); height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 48px; transition:box-shadow 0.3s; }
  .nav.scrolled { box-shadow:0 2px 20px rgba(66,85,255,0.1); }
  .nav-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:22px; color:#4255ff; letter-spacing:-0.5px; display:flex; align-items:center; gap:8px; text-decoration:none; }
  .nav-links { display:flex; gap:4px; align-items:center; }
  .nav-link { font-size:14px; font-weight:500; color:#1a1d28; padding:8px 14px; border-radius:10px; cursor:pointer; transition:background 0.2s,color 0.2s; border:none; background:transparent; text-decoration:none; display:block; }
  .nav-link:hover,.nav-link.active { background:#eef0ff; color:#4255ff; }
  .dropdown-wrap { position:relative; }
  .dropdown-trigger { font-size:14px; font-weight:500; color:#1a1d28; padding:8px 14px; border-radius:10px; cursor:pointer; transition:background 0.2s,color 0.2s; border:none; background:transparent; display:flex; align-items:center; gap:5px; font-family:'DM Sans',sans-serif; line-height:1; }
  .dropdown-trigger:hover,.dropdown-trigger.open { background:#eef0ff; color:#4255ff; }
  .dropdown-chevron { transition:transform 0.2s; display:flex; align-items:center; }
  .dropdown-trigger.open .dropdown-chevron { transform:rotate(180deg); }
  .dropdown-menu { position:absolute; top:calc(100% + 8px); left:50%; transform:translateX(-50%); background:white; border-radius:16px; padding:6px; min-width:230px; box-shadow:0 12px 40px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06); z-index:200; animation:dropIn 0.15s ease; }
  @keyframes dropIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .dropdown-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background 0.15s; text-decoration:none; }
  .dropdown-item:hover { background:#f5f6ff; }
  .dropdown-item-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .dropdown-item-text { display:flex; flex-direction:column; gap:1px; }
  .dropdown-item-title { font-size:13px; font-weight:600; color:#1a1d28; line-height:1.3; }
  .dropdown-item-desc  { font-size:11px; color:#9ca3af; line-height:1.3; }
  .btn-ghost { padding:9px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:transparent; border:1.5px solid rgba(66,85,255,0.25); color:#4255ff; font-family:'DM Sans',sans-serif; }
  .btn-ghost:hover { background:#eef0ff; }
  .btn-primary { padding:10px 22px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:#4255ff; color:white; border:none; box-shadow:0 4px 14px rgba(66,85,255,0.3); font-family:'DM Sans',sans-serif; }
  .btn-primary:hover { background:#2d3de0; transform:translateY(-1px); }

  .page { max-width:1200px; margin:0 auto; }

  /* HERO */
  .hero { padding:140px 48px 80px; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
  .hero-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#4255ff; margin-bottom:16px; }
  .hero-title { font-family:'Sora',sans-serif; font-size:clamp(36px,5vw,60px); font-weight:800; letter-spacing:-2px; line-height:1.06; margin-bottom:20px; }
  .hero-title em { color:#4255ff; font-style:normal; }
  .hero-sub { font-size:17px; color:#6b7280; line-height:1.65; margin-bottom:28px; }
  .hero-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .btn-hp { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; background:#4255ff; color:white; border:none; box-shadow:0 8px 24px rgba(66,85,255,0.35); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hp:hover { background:#2d3de0; transform:translateY(-2px); }
  .btn-hs { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:600; cursor:pointer; background:white; color:#1a1d28; border:1.5px solid rgba(0,0,0,0.1); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hs:hover { background:#f9f9f9; }

  /* STEP FLOW WIDGET */
  .flow-widget { background:white; border-radius:24px; padding:28px; box-shadow:0 12px 40px rgba(66,85,255,0.12); border:1.5px solid rgba(66,85,255,0.1); }
  .flow-steps { display:flex; align-items:center; gap:0; margin-bottom:20px; }
  .flow-step { display:flex; align-items:center; gap:8px; flex:1; }
  .flow-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .flow-dot.done { background:#4255ff; color:white; }
  .flow-dot.active { background:#eef0ff; border:1.5px solid rgba(66,85,255,0.4); color:#4255ff; }
  .flow-dot.idle { background:#f6f7fb; border:1.5px solid rgba(0,0,0,0.07); color:#9ca3af; }
  .flow-line { flex:1; height:2px; background:rgba(66,85,255,0.12); margin:0 6px; }
  .flow-label { font-size:11px; font-weight:600; color:#6b7280; }
  .flow-label.active { color:#4255ff; }
  .flow-content { background:#f6f7fb; border-radius:14px; padding:18px; }

  /* STEP DEMOS */
  .step-badge { display:inline-block; background:#eef0ff; color:#4255ff; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; margin-bottom:12px; }
  .step-title { font-size:15px; font-weight:700; margin-bottom:4px; }
  .step-desc { font-size:12px; color:#6b7280; line-height:1.5; margin-bottom:14px; }
  .diff-pills { display:flex; gap:8px; }
  .diff-pill { flex:1; padding:10px 8px; border-radius:12px; border:1.5px solid; font-size:12px; font-weight:700; text-align:center; cursor:pointer; transition:all 0.15s; }
  .diff-pill.easy   { border-color:rgba(74,222,128,0.4); background:rgba(74,222,128,0.08); color:#4ade80; }
  .diff-pill.medium { border-color:rgba(66,85,255,0.3); background:#eef0ff; color:#4255ff; }
  .diff-pill.hard   { border-color:rgba(248,113,113,0.4); background:rgba(248,113,113,0.08); color:#f87171; }
  .qtype-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
  .qtype-chip { padding:8px 10px; border-radius:10px; border:1.5px solid; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; }
  .qtype-chip.on  { border-color:rgba(66,85,255,0.3); background:#eef0ff; color:#4255ff; }
  .qtype-chip.off { border-color:rgba(0,0,0,0.07); color:#9ca3af; }
  .tag-row { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
  .focus-tag { padding:4px 12px; border-radius:100px; background:#eef0ff; border:1px solid rgba(66,85,255,0.2); color:#4255ff; font-size:11px; font-weight:600; }
  .word-bar { height:5px; background:#f3f4f6; border-radius:3px; overflow:hidden; margin-top:8px; }
  .word-fill { height:100%; background:#4255ff; border-radius:3px; transition:width 0.4s; }
  .count-slider { width:100%; -webkit-appearance:none; height:5px; border-radius:3px; outline:none; margin-top:8px; }

  /* SECTIONS */
  .section { padding:96px 48px; }
  .section-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#4255ff; margin-bottom:16px; }
  .section-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; letter-spacing:-1.5px; line-height:1.1; }
  .section-body { font-size:16px; color:#6b7280; line-height:1.65; max-width:520px; margin-top:14px; }

  /* SCREENSHOT GRID */
  .sc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:40px; }
  .sc-cell { aspect-ratio:16/10; border-radius:14px; border:2px dashed rgba(66,85,255,0.18); background:white; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; cursor:pointer; transition:all 0.2s; }
  .sc-cell:hover { border-color:#4255ff; background:#f5f6ff; transform:translateY(-2px); box-shadow:0 8px 24px rgba(66,85,255,0.1); }
  .sc-emoji { font-size:26px; }
  .sc-lbl { font-size:10px; font-weight:600; color:#9ca3af; text-align:center; padding:0 6px; }

  /* STEPS LIST */
  .steps-list { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:40px; }
  .step-card { background:white; border-radius:20px; padding:24px; border:1.5px solid rgba(0,0,0,0.06); }
  .step-card-num { font-family:'Sora',sans-serif; font-size:32px; font-weight:800; color:#eef0ff; margin-bottom:10px; }
  .step-card-title { font-family:'Sora',sans-serif; font-size:16px; font-weight:700; margin-bottom:6px; }
  .step-card-desc { font-size:13px; color:#6b7280; line-height:1.55; }
  .step-card-badge { display:inline-block; margin-top:10px; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; }

  /* FEATURE LIST */
  .feat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:32px; }
  .feat-item { display:flex; gap:14px; align-items:flex-start; padding:18px; border-radius:14px; background:white; border:1.5px solid rgba(0,0,0,0.06); }
  .feat-icon { width:40px; height:40px; border-radius:12px; background:#eef0ff; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .feat-title { font-size:14px; font-weight:700; margin-bottom:4px; }
  .feat-desc { font-size:13px; color:#6b7280; line-height:1.5; }

  /* QUESTION TYPES SHOWCASE */
  .qtype-showcase { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:32px; }
  .qt-card { background:white; border-radius:16px; padding:20px; border:1.5px solid rgba(0,0,0,0.06); transition:all 0.2s; }
  .qt-card:hover { border-color:rgba(66,85,255,0.2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(66,85,255,0.08); }
  .qt-icon { font-size:22px; margin-bottom:10px; }
  .qt-title { font-size:14px; font-weight:700; margin-bottom:4px; }
  .qt-desc { font-size:12px; color:#6b7280; line-height:1.5; }

  /* RESULTS DEMO */
  .results-demo { background:white; border-radius:20px; padding:24px; border:1.5px solid rgba(66,85,255,0.1); }
  .rd-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .rd-badge { background:#eef0ff; color:#4255ff; padding:4px 12px; border-radius:100px; font-size:11px; font-weight:700; }
  .rd-card { border-radius:14px; padding:20px; margin-bottom:10px; border:1.5px solid rgba(0,0,0,0.07); }
  .rd-q { font-size:13px; font-weight:600; color:#1a1d28; margin-bottom:8px; }
  .rd-a { font-size:12px; color:#6b7280; line-height:1.5; padding-top:8px; border-top:1px solid rgba(0,0,0,0.06); }
  .rd-mark-known { display:inline-block; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; background:#ecfdf5; color:#15803d; }
  .rd-mark-review { display:inline-block; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; background:#fef2f2; color:#b91c1c; }

  /* CTA */
  .cta-bar { background:linear-gradient(135deg,#4255ff,#6b78ff); padding:80px 48px; text-align:center; }
  .cta-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; color:white; letter-spacing:-1.5px; margin-bottom:14px; }
  .cta-sub { font-size:16px; color:rgba(255,255,255,0.75); margin-bottom:32px; }
  .btn-cta { padding:14px 32px; border-radius:14px; font-size:16px; font-weight:700; background:white; color:#4255ff; border:none; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.15); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-cta:hover { transform:translateY(-2px); }

  /* MODAL */
  .modal-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.45); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  .modal-box { background:white; border-radius:24px; padding:40px; width:100%; max-width:420px; position:relative; box-shadow:0 32px 80px rgba(0,0,0,0.18); animation:slideUp 0.28s ease; }
  .modal-close { position:absolute; top:14px; right:14px; width:30px; height:30px; border-radius:50%; border:none; background:#f6f7fb; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; color:#6b7280; }
  .modal-close:hover { background:#e5e7eb; }
  .modal-title { font-family:'Sora',sans-serif; font-size:24px; font-weight:800; margin-bottom:4px; }
  .modal-sub { font-size:14px; color:#6b7280; margin-bottom:24px; }
  .inp-lbl { font-size:13px; font-weight:600; margin-bottom:5px; display:block; }
  .inp { width:100%; padding:11px 15px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.1); font-size:15px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; margin-bottom:14px; }
  .inp:focus { border-color:#4255ff; box-shadow:0 0 0 3px rgba(66,85,255,0.1); }
  .modal-divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
  .modal-divider::before,.modal-divider::after { content:''; flex:1; height:1px; background:rgba(0,0,0,0.08); }
  .modal-divider span { font-size:12px; color:#6b7280; }
  .btn-google { width:100%; padding:12px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.1); background:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-google:hover { background:#f9f9f9; }
  .modal-submit { width:100%; padding:13px; border-radius:12px; background:#4255ff; color:white; border:none; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; margin-top:4px; }
  .modal-submit:hover { background:#2d3de0; }
  .modal-toggle { text-align:center; margin-top:14px; font-size:13px; color:#6b7280; }
  .modal-toggle button { background:none; border:none; color:#4255ff; font-weight:700; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; }
  .user-pill { display:flex; align-items:center; gap:8px; padding:6px 14px; border-radius:100px; background:#eef0ff; border:1px solid rgba(66,85,255,0.2); cursor:pointer; font-size:13px; font-weight:600; color:#4255ff; }
  .uav { width:24px; height:24px; border-radius:50%; background:#4255ff; color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }

  footer { background:#0f1117; padding:64px 48px 32px; color:rgba(255,255,255,0.5); }
  .ft-inner { max-width:1200px; margin:0 auto; }
  .ft-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; padding-bottom:48px; border-bottom:1px solid rgba(255,255,255,0.07); }
  .ft-logo { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:white; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .ft-tagline { font-size:14px; line-height:1.6; margin-bottom:20px; color:rgba(255,255,255,0.45); }
  .ft-col-h { font-size:11px; font-weight:700; color:white; margin-bottom:14px; letter-spacing:0.5px; text-transform:uppercase; }
  .ft-link { display:block; font-size:14px; color:rgba(255,255,255,0.4); margin-bottom:10px; text-decoration:none; transition:color 0.2s; }
  .ft-link:hover { color:white; }
  .ft-bot { display:flex; justify-content:space-between; align-items:center; padding-top:24px; font-size:13px; flex-wrap:wrap; gap:12px; }

  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .fiv { opacity:0; transform:translateY(20px); transition:opacity 0.6s ease,transform 0.6s ease; }
  .fiv.vis { opacity:1; transform:translateY(0); }

  @media (max-width:900px) {
    .nav { padding:0 16px; } .nav-links { display:none; }
    .nav-actions .btn-ghost { display:none; }
    .hero { grid-template-columns:1fr; padding:100px 20px 48px; gap:32px; }
    .hero-title { font-size:clamp(32px,7vw,48px); letter-spacing:-1.5px; }
    .hero-sub { font-size:16px; }
    .flow-widget { padding:20px; }
    .section { padding:56px 20px; }
    .section-title { font-size:clamp(24px,6vw,36px); letter-spacing:-1px; }
    .sc-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .steps-list { grid-template-columns:1fr 1fr; gap:12px; }
    .qtype-showcase { grid-template-columns:1fr 1fr; gap:10px; }
    .feat-grid { grid-template-columns:1fr; }
    .results-demo { padding:18px; }
    .rd-card { padding:14px; }
    .cta-bar { padding:56px 20px; }
    .cta-title { font-size:clamp(26px,6vw,36px); letter-spacing:-1px; }
    footer { padding:48px 20px 24px; }
    .ft-grid { grid-template-columns:1fr 1fr; gap:24px; padding-bottom:32px; }
    .modal-box { padding:28px 20px; }
  }
  @media (max-width:480px) {
    .hero-title { font-size:30px; }
    .steps-list,.qtype-showcase { grid-template-columns:1fr; }
    .sc-grid { grid-template-columns:1fr 1fr; }
    .ft-grid { grid-template-columns:1fr; }
    .diff-pills { gap:6px; }
    .qtype-grid { grid-template-columns:1fr; }
  }
  .hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:8px; border:none; background:transparent; }
  .hamburger span { display:block; width:22px; height:2px; background:#1a1d28; border-radius:2px; transition:all 0.25s; }
  .mobile-menu { display:none; position:fixed; top:64px; left:0; right:0; background:white; border-bottom:1px solid rgba(66,85,255,0.08); padding:16px 20px 20px; z-index:99; box-shadow:0 8px 32px rgba(0,0,0,0.08); animation:fadeIn 0.2s ease; }
  .mobile-menu a, .mobile-menu button { display:block; width:100%; text-align:left; padding:12px 0; font-size:15px; font-weight:500; color:#1a1d28; border:none; background:transparent; border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer; font-family:'DM Sans',sans-serif; text-decoration:none; }
  .mobile-menu a:last-child, .mobile-menu button:last-child { border-bottom:none; }
  .mobile-menu-tools { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#9ca3af; padding:14px 0 8px; border-bottom:none!important; }
  .mobile-menu a.tool-link { padding:9px 0 9px 12px; font-size:14px; color:#4255ff; border-bottom:1px solid rgba(0,0,0,0.04)!important; }
  .mobile-menu-cta { margin-top:12px; width:100%; padding:13px; border-radius:12px; background:#4255ff; color:white; border:none; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
  @media (max-width:900px) { .hamburger { display:flex; } }
`;

/* ── Auth Modal ── */
function AuthModal({ onClose, onSuccess }) {
  const [mode,    setMode]    = useState("signup");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");


  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const u        = result.user;
      onSuccess({ name: u.displayName || u.email.split("@")[0], email: u.email, uid: u.uid, photoURL: u.photoURL });
    } catch (err) {
      setError(err.code === "auth/popup-closed-by-user" ? "Sign-in cancelled." : err.message);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!email || !pass) return setError("Please fill in all fields.");
    if (pass.length < 6)  return setError("Password must be at least 6 characters.");
    setError(""); setLoading(true);
    try {
      let result;
      if (mode === "signup") {
        result = await createUserWithEmailAndPassword(auth, email, pass);
        if (name) await updateProfile(result.user, { displayName: name });
      } else {
        result = await signInWithEmailAndPassword(auth, email, pass);
      }
      const u = result.user;
      onSuccess({ name: u.displayName || name || email.split("@")[0], email: u.email, uid: u.uid });
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use":  "An account with this email already exists.",
        "auth/user-not-found":        "No account found with this email.",
        "auth/wrong-password":        "Incorrect password.",
        "auth/invalid-email":         "Please enter a valid email address.",
        "auth/too-many-requests":     "Too many attempts. Try again later.",
        "auth/invalid-credential":    "Invalid email or password.",
      };
      setError(msgs[err.code] || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <img src="/forks-logo.png" alt="FORKSAI" style={{ height:26, width:"auto", marginBottom:10 }} />
        <div className="modal-title">{mode === "signup" ? "Create your account" : "Welcome back"}</div>
        <div className="modal-sub">{mode === "signup" ? "Start studying smarter. It's free." : "Log in to continue."}</div>
        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          {loading ? "Please wait..." : "Continue with Google"}
        </button>
        <div className="modal-divider"><span>or</span></div>
        {mode === "signup" && (
          <div><label className="inp-lbl">Full name</label><input className="inp" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
        )}
        <div><label className="inp-lbl">Email</label><input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
        <div><label className="inp-lbl">Password</label><input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ marginBottom:0 }} /></div>
        {error && <div style={{ marginTop:10, padding:"8px 12px", borderRadius:10, background:"#fef2f2", border:"1px solid rgba(239,68,68,0.2)", fontSize:13, color:"#b91c1c" }}>{error}</div>}
        <button className="modal-submit" style={{ marginTop:14, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Sign up free →" : "Log in →"}
        </button>
        <div className="modal-toggle">
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => { setMode(m => m === "signup" ? "login" : "signup"); setError(""); }}>
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}


function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".fiv");
    const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }); }, { threshold:0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Screenshot labels (4x4 = 16) ── */
const SCREENSHOTS = [
  ["✏️","Name your deck"],  ["🔢","Set card count"],   ["🎯","Pick difficulty"],    ["📋","Question types"],
  ["🧠","Smart Focus tags"], ["📊","Focus intensity"],  ["📝","Paste notes input"],  ["📄","Upload PDF"],
  ["⚡","AI generation"],   ["🃏","Flip card view"],    ["📊","Progress chart"],     ["🔄","Quiz mode"],
  ["✅","Mark known"],       ["❌","Flag for review"],  ["📥","Download PDF deck"],  ["🔁","New deck flow"],
];

/* ── Steps ── */
const STEPS = [
  { n:"01", title:"Name your deck",        badge:"Step 1",     desc:"Give your deck a title. Pick from popular topics or name it after your exam, subject, or chapter.",                           bg:"#eef0ff", c:"#4255ff" },
  { n:"02", title:"Configure your cards",  badge:"Step 2",     desc:"Choose how many cards (up to 100), set difficulty (Easy, Medium, Hard), and pick which question types the AI should use.",  bg:"#fff7e6", c:"#d97706" },
  { n:"03", title:"Smart Focus",           badge:"Step 3 Beta",desc:"Add specific topics you want the AI to focus on. Set focus intensity from Balanced through to Dominant. Totally optional.", bg:"#f0fdf4", c:"#16a34a" },
  { n:"04", title:"Add your material",     badge:"Step 4",     desc:"Paste your notes (100+ words) or upload a PDF up to 5MB. The AI reads your exact material and generates targeted cards.",    bg:"#f5f3ff", c:"#7c3aed" },
];

/* ── Question types (from actual dashboard code) ── */
const QTYPES = [
  { icon:"📖", title:"Theoretical",  desc:"Concept-based questions testing understanding of ideas and principles." },
  { icon:"🔢", title:"Numerical",    desc:"Calculation questions requiring working through numbers and equations." },
  { icon:"📝", title:"Definition",   desc:"Term-to-definition and definition-to-term style questions." },
  { icon:"💡", title:"Application",  desc:"Scenario-based questions where you apply knowledge to real situations." },
  { icon:"🔘", title:"MCQ",          desc:"Multiple choice questions with one correct option from four." },
  { icon:"🧪", title:"Experimental", desc:"Lab and data interpretation questions for science subjects." },
];

/* ── Features ── */
const FEATURES = [
  { icon:"⚡", title:"Ready in 30 seconds",        desc:"From uploading your PDF to having a full deck ready before you've made a coffee." },
  { icon:"🧠", title:"Smart Focus system",          desc:"Tag specific topics and dial intensity from Balanced to Dominant. The AI concentrates on exactly what you tell it to." },
  { icon:"📋", title:"6 question type options",     desc:"Mix theoretical, numerical, definition, application, MCQ, and experimental questions in any combination." },
  { icon:"🔄", title:"Grid and flip views",         desc:"Study in grid view to see all cards at once, or flip view for one-by-one review with previous/next navigation." },
  { icon:"✅", title:"Know it / Review it marking", desc:"Mark cards as known or flag for review. A pie chart tracks your progress across all three states." },
  { icon:"📥", title:"Download as PDF",             desc:"Export your full deck as a formatted PDF with questions and answers ready to print or share." },
];


/* ── Tools Dropdown ── */
function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const tools = [
    { href:"/flashcards", icon:"🃏", bg:"#eef0ff",              title:"AI Flashcards",    desc:"Generate decks from notes or PDFs" },
    { href:"/learn",      icon:"🔄", bg:"rgba(35,178,109,0.1)", title:"Learn Mode",       desc:"9 study modes including FSRS-5" },
    { href:"/notes",      icon:"📄", bg:"rgba(22,163,74,0.08)", title:"Notes Summarizer", desc:"Turn PDFs into structured notes" },
  ];
  return (
    <div className="dropdown-wrap" ref={ref}>
      <button className={`dropdown-trigger${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        Tools
        <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="dropdown-menu" onClick={() => setOpen(false)}>
          {tools.map(t => (
            <a key={t.href} href={t.href} className="dropdown-item">
              <div className="dropdown-item-icon" style={{ background:t.bg }}>{t.icon}</div>
              <div className="dropdown-item-text">
                <span className="dropdown-item-title">{t.title}</span>
                <span className="dropdown-item-desc">{t.desc}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser]         = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [difficulty, setDifficulty] = useState("medium");
  const [qtypes, setQtypes] = useState(["theoretical","definition"]);
  const [cardCount, setCardCount] = useState(20);

  useReveal();

  // Persist auth state across page refreshes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (cu) => {
      if (cu) {
        setUser({ name: cu.displayName || cu.email.split("@")[0], email: cu.email, uid: cu.uid, photoURL: cu.photoURL });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);

  const toggleType = id => setQtypes(p => p.includes(id) ? (p.length > 1 ? p.filter(x => x !== id) : p) : [...p, id]);

  return (
    <>
      <style>{css}</style>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); window.location.href = '/dashboard'; }} />}

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-logo" href="/"><img src="/forks-logo.png" alt="FORKSAI" style={{ height:24, width:"auto" }} />FORKSAI</a>
        <div className="nav-links">
          <ToolsDropdown />
          <a className="nav-link" href="/docs">Docs</a>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="user-pill">
                <div className="uav">{user.name[0].toUpperCase()}</div>
                <span>{user.name}</span>
              </div>
              <a href="/dashboard" style={{ padding:"9px 18px", borderRadius:12, background:"#4255ff", color:"white", fontSize:14, fontWeight:600, textDecoration:"none", boxShadow:"0 4px 14px rgba(66,85,255,0.3)" }}>
                Dashboard →
              </a>
            </div>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => setShowAuth(true)}>Log in</button>
              <button className="btn-primary" onClick={() => setShowAuth(true)}>Sign up free →</button>
            </>
          )}
          <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu-tools">Tools</div>
          <a href="/flashcards" className="tool-link">🃏 AI Flashcards</a>
          <a href="/learn" className="tool-link">🔄 Learn Mode</a>
          <a href="/notes" className="tool-link">📄 Notes Summarizer</a>
          <a href="/docs">Docs</a>
          {user ? (
            <a href="/dashboard"><button className="mobile-menu-cta">Go to Dashboard →</button></a>
          ) : (
            <button className="mobile-menu-cta" onClick={() => { setMobileOpen(false); setShowAuth(true); }}>Sign up free →</button>
          )}
        </div>
      )}

      {/* HERO */}
      <div className="page">
        <div className="hero">
          <div>
            <div className="hero-label">✦ AI Flashcards</div>
            <h1 className="hero-title">Name it. Configure it. <em>Get your deck.</em></h1>
            <p className="hero-sub">A guided 4-step flow takes you from a deck title to up to 100 AI-generated, exam-quality flashcards in under 30 seconds. Paste notes or upload a PDF. No manual card creation.</p>
            <div className="hero-btns">
              <button className="btn-hp" onClick={() => setShowAuth(true)}>Create your first deck →</button>
              <button className="btn-hs" onClick={() => document.getElementById("steps")?.scrollIntoView({ behavior:"smooth" })}>See how it works</button>
            </div>
            <div style={{ display:"flex", gap:20, marginTop:28, flexWrap:"wrap" }}>
              {["4-step guided flow","Up to 100 cards","6 question types","Smart Focus system"].map((t, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#6b7280" }}>
                  <span style={{ color:"#23b26d", fontWeight:700 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive step widget */}
          <div className="flow-widget">
            <div className="flow-steps">
              {["Title","Configure","Smart Focus","Material"].map((label, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }} onClick={() => setActiveStep(i)}>
                    <div className={`flow-dot ${i < activeStep ? "done" : i === activeStep ? "active" : "idle"}`}>
                      {i < activeStep ? "✓" : i + 1}
                    </div>
                    <span className={`flow-label${i === activeStep ? " active" : ""}`} style={{ fontSize:10, display:"none" }}>{label}</span>
                  </div>
                  {i < 3 && <div className="flow-line" style={{ background: i < activeStep ? "rgba(66,85,255,0.3)" : "rgba(0,0,0,0.07)" }} />}
                </div>
              ))}
            </div>

            <div className="flow-content">
              {activeStep === 0 && (
                <div>
                  <div className="step-badge">Step 1 of 4</div>
                  <div className="step-title">Name your deck</div>
                  <div className="step-desc">Give your deck a title. Type it or pick a suggestion.</div>
                  <div style={{ background:"white", borderRadius:10, padding:"10px 14px", border:"1.5px solid rgba(66,85,255,0.2)", fontSize:14, color:"#1a1d28", marginBottom:10 }}>
                    Cell Biology - Chapter 3
                    <span style={{ marginLeft:6, color:"#23b26d", fontWeight:700 }}>✓</span>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["Organic Chemistry","Contract Law","Calculus I","Macroeconomics"].map(t => (
                      <span key={t} style={{ padding:"4px 10px", borderRadius:100, background:"#f6f7fb", border:"1px solid rgba(0,0,0,0.08)", fontSize:11, color:"#6b7280", cursor:"pointer" }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <div className="step-badge">Step 2 of 4</div>
                  <div className="step-title">Configure</div>
                  <div className="step-desc">Set card count, difficulty and question types.</div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6 }}>CARD COUNT</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <input type="range" min={1} max={100} value={cardCount} onChange={e => setCardCount(Number(e.target.value))}
                        style={{ flex:1, accentColor:"#4255ff" }} />
                      <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color:"#4255ff", minWidth:28 }}>{cardCount}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6 }}>DIFFICULTY</div>
                  <div className="diff-pills" style={{ marginBottom:12 }}>
                    {["easy","medium","hard"].map(d => (
                      <div key={d} className={`diff-pill ${d}`} style={{ opacity: difficulty === d ? 1 : 0.4 }} onClick={() => setDifficulty(d)}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6 }}>QUESTION TYPES</div>
                  <div className="qtype-grid">
                    {["Theoretical","Numerical","Definition","Application","MCQ","Experimental"].map((t, i) => {
                      const id = t.toLowerCase();
                      return (
                        <div key={i} className={`qtype-chip ${qtypes.includes(id) ? "on" : "off"}`} onClick={() => toggleType(id)}>{t}</div>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <div className="step-badge">Step 3 of 4 - Beta</div>
                  <div className="step-title">Smart Focus</div>
                  <div className="step-desc">Add topics to focus on. Set intensity. Completely optional.</div>
                  <div className="tag-row">
                    {["Mitosis","Cell membrane","ATP synthesis"].map(t => (
                      <span key={t} className="focus-tag">{t} ×</span>
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6 }}>FOCUS INTENSITY</div>
                  <input type="range" min={1} max={4} defaultValue={2} style={{ width:"100%", accentColor:"#4255ff" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#9ca3af", marginTop:4 }}>
                    {["Balanced","Lean","Heavy","Dominant"].map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <div>
                  <div className="step-badge">Step 4 of 4</div>
                  <div className="step-title">Add your material</div>
                  <div className="step-desc">Paste notes (100+ words) or upload a PDF up to 5MB.</div>
                  <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                    <div style={{ padding:"6px 14px", borderRadius:100, background:"#4255ff", color:"white", fontSize:11, fontWeight:700 }}>📝 Paste notes</div>
                    <div style={{ padding:"6px 14px", borderRadius:100, background:"#f6f7fb", border:"1px solid rgba(0,0,0,0.08)", color:"#6b7280", fontSize:11, fontWeight:600 }}>📄 Upload PDF</div>
                  </div>
                  <div style={{ background:"rgba(66,85,255,0.04)", borderRadius:10, padding:12, fontSize:12, color:"#6b7280", border:"1px dashed rgba(66,85,255,0.2)", lineHeight:1.5, marginBottom:8 }}>
                    Chromosomes are thread-like structures found in the nucleus of eukaryotic cells. They consist of DNA and associated proteins...
                  </div>
                  <div style={{ fontSize:11, color:"#23b26d", fontWeight:600 }}>Word count: 147 / 100 minimum ✓</div>
                  <div className="word-bar"><div className="word-fill" style={{ width:"100%" }} /></div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {activeStep > 0 && <button onClick={() => setActiveStep(s => s - 1)} style={{ flex:1, padding:"9px", borderRadius:10, border:"1.5px solid rgba(0,0,0,0.08)", background:"transparent", fontSize:13, fontWeight:600, cursor:"pointer", color:"#6b7280" }}>← Back</button>}
              {activeStep < 3
                ? <button onClick={() => setActiveStep(s => s + 1)} style={{ flex:2, padding:"9px", borderRadius:10, background:"#4255ff", color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>Continue →</button>
                : <button onClick={() => setShowAuth(true)} style={{ flex:2, padding:"9px", borderRadius:10, background:"#4255ff", color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>Generate {cardCount} cards →</button>
              }
            </div>
          </div>
        </div>
      </div>

      {/* THE 4 STEPS */}
      <div id="steps" style={{ background:"white" }}>
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ The Flow</div>
            <h2 className="section-title">Four steps from nothing to a full deck.</h2>
            <p className="section-body">Every step is intentional. Each one feeds the next so the AI has everything it needs to generate exactly what you want.</p>
            <div className="steps-list">
              {STEPS.map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-card-num">{s.n}</div>
                  <div className="step-card-title">{s.title}</div>
                  <div className="step-card-desc">{s.desc}</div>
                  <div className="step-card-badge" style={{ background:s.bg, color:s.c }}>{s.badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION TYPES */}
      <div className="page">
        <div className="section fiv">
          <div className="section-label">✦ Question Types</div>
          <h2 className="section-title">Six types. Mix any combination.</h2>
          <p className="section-body">The AI generates the exact mix you configure. Theoretical for conceptual subjects, numerical for maths and science, MCQ for exam simulation. Select multiple or just one.</p>
          <div className="qtype-showcase">
            {QTYPES.map((q, i) => (
              <div key={i} className="qt-card">
                <div className="qt-icon">{q.icon}</div>
                <div className="qt-title">{q.title}</div>
                <div className="qt-desc">{q.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCREENSHOTS */}
      <div style={{ background:"white" }} id="screenshots">
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ Every Screen</div>
            <h2 className="section-title">The full product, start to finish.</h2>
            <p className="section-body">Every screen inside the AI Flashcards flow, from naming your deck through to reviewing and downloading your cards.</p>
            <div className="sc-grid">
              {SCREENSHOTS.map(([emoji, label], i) => (
                <div key={i} className="sc-cell">
                  <span className="sc-emoji">{emoji}</span>
                  <span className="sc-lbl">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS DEMO */}
      <div className="page">
        <div className="section fiv">
          <div style={{ display:"flex", gap:72, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div className="section-label">✦ Results</div>
              <h2 className="section-title">Grid view, flip view, quiz mode.</h2>
              <p className="section-body">Once generated, study in grid view (all cards visible) or one-by-one flip view. Enable quiz mode to mark each card as Known or Review, tracked live in a progress chart.</p>
              <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { icon:"📊", t:"Live progress pie chart", d:"Tracks Known, Review, and Unseen cards in real time as you study." },
                  { icon:"📥", t:"Download as PDF",         d:"Export the full deck - questions and answers - formatted and ready to print." },
                  { icon:"🔁", t:"Reset and rebuild",       d:"Start a new deck any time. Your last configuration is not saved between sessions." },
                ].map((f, i) => (
                  <div key={i} style={{ display:"flex", gap:12, padding:"14px 16px", borderRadius:14, background:"white", border:"1.5px solid rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize:20 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{f.t}</div>
                      <div style={{ fontSize:13, color:"#6b7280" }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div className="results-demo">
                <div className="rd-header">
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16 }}>Cell Biology</div>
                  <div className="rd-badge">20 cards · Medium</div>
                </div>
                <div style={{ display:"flex", gap:12, marginBottom:16, fontSize:12 }}>
                  <span style={{ color:"#23b26d", fontWeight:600 }}>✓ Known: 5</span>
                  <span style={{ color:"#ef4444", fontWeight:600 }}>× Review: 3</span>
                  <span style={{ color:"#9ca3af" }}>· Unseen: 12</span>
                </div>
                {[
                  { q:"What is the primary function of the mitochondria?",     a:"ATP synthesis via oxidative phosphorylation.",        s:"known" },
                  { q:"Explain the sodium-potassium pump mechanism.",          a:"3 Na+ out, 2 K+ in per ATP molecule consumed.",        s:"review" },
                  { q:"Define osmosis in the context of cell biology.",        a:null, s:"unseen" },
                ].map((c, i) => (
                  <div key={i} className="rd-card">
                    <div className="rd-q">{c.q}</div>
                    {c.a
                      ? <div className="rd-a">{c.a}</div>
                      : <div className="rd-a" style={{ fontStyle:"italic", color:"#d1d5db" }}>Tap to reveal answer</div>
                    }
                    <div style={{ marginTop:8 }}>
                      {c.s === "known"   && <span className="rd-mark-known">Known</span>}
                      {c.s === "review"  && <span className="rd-mark-review">Review later</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background:"white" }}>
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ Features</div>
            <h2 className="section-title">Everything built to make cards that stick.</h2>
            <div className="feat-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="feat-item">
                  <div className="feat-icon">{f.icon}</div>
                  <div>
                    <div className="feat-title">{f.title}</div>
                    <div className="feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cta-bar">
        <h2 className="cta-title">Build your first deck in under a minute.</h2>
        <p className="cta-sub">Free to start. No credit card. Just name it, configure it, and go.</p>
        <button className="btn-cta" onClick={() => setShowAuth(true)}>Get started free →</button>
      </div>

      <footer>
        <div className="ft-inner">
          <div className="ft-grid">
            <div>
              <div className="ft-logo">
                <img src="/forks-logo.png" alt="FORKSAI" style={{ height:20, width:"auto" }} />
                FORKSAI
              </div>
              <p className="ft-tagline">AI-powered flashcard generation. From PDF or notes to a full deck in under 30 seconds.</p>
            </div>
            <div>
              <div className="ft-col-h">Tools</div>
              <a href="/flashcards" className="ft-link">AI Flashcards</a>
              <a href="/learn" className="ft-link">Learn Mode</a>
              <a href="/notes" className="ft-link">Notes Summarizer</a>
            </div>
            <div>
              <div className="ft-col-h">Help</div>
              <a href="/docs" className="ft-link">Docs</a>
              <a href="/faq" className="ft-link">FAQ</a>
              <a href="/blog/flashcards" className="ft-link">Flashcard Guide</a>
              <a href="/blog/active-recall" className="ft-link">Active Recall</a>
            </div>
            <div>
              <div className="ft-col-h">Company</div>
              <a href="/privacy-policy" className="ft-link">Privacy</a>
              <a href="/terms" className="ft-link">Terms</a>
              <a href="/refund-policy" className="ft-link">Refund Policy</a>
            </div>
          </div>
          <div className="ft-bot">
            <span>© 2026 FORKSAI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
