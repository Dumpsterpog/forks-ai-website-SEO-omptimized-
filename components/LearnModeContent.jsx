"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";


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
  .dropdown-wrap { position:relative; }
  .dropdown-trigger { font-size:14px; font-weight:500; color:#1a1d28; padding:8px 14px; border-radius:10px; cursor:pointer; transition:background 0.2s,color 0.2s; border:none; background:transparent; display:flex; align-items:center; gap:5px; font-family:'DM Sans',sans-serif; }
  .dropdown-trigger:hover,.dropdown-trigger.open { background:#eef0ff; color:#4255ff; }
  .dropdown-chevron { transition:transform 0.2s; }
  .dropdown-trigger.open .dropdown-chevron { transform:rotate(180deg); }
  .dropdown-menu { position:absolute; top:calc(100% + 8px); left:50%; transform:translateX(-50%); background:white; border-radius:16px; padding:6px; min-width:220px; box-shadow:0 12px 40px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06); z-index:200; animation:dropIn 0.15s ease; }
  @keyframes dropIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .dropdown-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background 0.15s; text-decoration:none; }
  .dropdown-item:hover { background:#f5f6ff; }
  .dropdown-item-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .dropdown-item-text { display:flex; flex-direction:column; }
  .dropdown-item-title { font-size:13px; font-weight:600; color:#1a1d28; }
  .dropdown-item-desc  { font-size:11px; color:#9ca3af; margin-top:1px; }
  .btn-ghost { padding:9px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:transparent; border:1.5px solid rgba(66,85,255,0.25); color:#4255ff; font-family:'DM Sans',sans-serif; }
  .btn-ghost:hover { background:#eef0ff; }
  .btn-primary { padding:10px 22px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:#4255ff; color:white; border:none; box-shadow:0 4px 14px rgba(66,85,255,0.3); font-family:'DM Sans',sans-serif; }
  .btn-primary:hover { background:#2d3de0; transform:translateY(-1px); }

  .page { max-width:1200px; margin:0 auto; }
  .section { padding:96px 48px; }
  .section-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#4255ff; margin-bottom:16px; }
  .section-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; letter-spacing:-1.5px; line-height:1.1; }
  .section-body { font-size:16px; color:#6b7280; line-height:1.65; max-width:520px; margin-top:14px; }

  /* HERO */
  .hero { padding:140px 48px 80px; display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
  .hero-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#23b26d; margin-bottom:16px; }
  .hero-title { font-family:'Sora',sans-serif; font-size:clamp(36px,5vw,60px); font-weight:800; letter-spacing:-2px; line-height:1.06; margin-bottom:20px; }
  .hero-title em { color:#23b26d; font-style:normal; }
  .hero-sub { font-size:17px; color:#6b7280; line-height:1.65; margin-bottom:28px; }
  .btn-hg { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; background:#23b26d; color:white; border:none; box-shadow:0 8px 24px rgba(35,178,109,0.35); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hg:hover { background:#1a9158; transform:translateY(-2px); }
  .btn-hs { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:600; cursor:pointer; background:white; color:#1a1d28; border:1.5px solid rgba(0,0,0,0.1); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hs:hover { background:#f9f9f9; }

  /* MODE SELECTOR WIDGET */
  .mode-widget { background:white; border-radius:24px; padding:28px; box-shadow:0 12px 40px rgba(35,178,109,0.12); border:1.5px solid rgba(35,178,109,0.12); }
  .cat-tabs { display:flex; gap:0; border-radius:100px; border:1.5px solid rgba(0,0,0,0.08); overflow:hidden; width:fit-content; margin-bottom:20px; }
  .cat-tab { padding:7px 18px; font-size:12px; font-weight:700; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  .cat-tab.classic { background:#f6f7fb; color:#6b7280; }
  .cat-tab.classic.on { background:#1a1d28; color:white; }
  .cat-tab.ai { background:#f6f7fb; color:#6b7280; }
  .cat-tab.ai.on { background:#23b26d; color:white; }
  .modes-grid-w { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .mode-item { display:flex; align-items:flex-start; gap:10px; padding:12px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.07); cursor:pointer; transition:all 0.15s; background:white; }
  .mode-item:hover,.mode-item.active { border-color:rgba(35,178,109,0.3); background:rgba(35,178,109,0.04); }
  .mode-item.ai-mode:hover,.mode-item.ai-mode.active { border-color:rgba(35,178,109,0.4); background:rgba(35,178,109,0.06); }
  .mode-icon-box { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; background:#f6f7fb; }
  .mode-item.active .mode-icon-box { background:rgba(35,178,109,0.1); }
  .mode-name { font-size:12px; font-weight:700; color:#1a1d28; margin-bottom:2px; }
  .mode-desc-s { font-size:10px; color:#9ca3af; }
  .premium-tag { display:inline-block; padding:2px 6px; border-radius:100px; font-size:9px; font-weight:800; background:rgba(35,178,109,0.1); color:#23b26d; border:1px solid rgba(35,178,109,0.2); margin-left:4px; }
  .locked-overlay { display:flex; align-items:center; gap:4px; font-size:10px; color:#9ca3af; margin-top:2px; }

  /* SECTION BACKGROUNDS */
  .bg-white { background:white; }

  /* CLASSIC/AI CARDS */
  .modes-section-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:32px; }
  .mode-card { background:white; border-radius:20px; padding:24px; border:1.5px solid rgba(0,0,0,0.06); transition:all 0.2s; }
  .mode-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(35,178,109,0.1); border-color:rgba(35,178,109,0.2); }
  .mode-card.premium { border-color:rgba(35,178,109,0.15); background:linear-gradient(135deg,rgba(35,178,109,0.03) 0%,white 100%); }
  .mc-icon { font-size:28px; margin-bottom:14px; }
  .mc-title { font-family:'Sora',sans-serif; font-size:17px; font-weight:700; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .mc-badge { padding:2px 8px; border-radius:100px; font-size:10px; font-weight:700; }
  .mc-desc { font-size:13px; color:#6b7280; line-height:1.55; }

  /* SCREENSHOT GRID */
  .sc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:40px; }
  .sc-cell { aspect-ratio:16/10; border-radius:14px; border:2px dashed rgba(35,178,109,0.2); background:white; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; cursor:pointer; transition:all 0.2s; }
  .sc-cell:hover { border-color:#23b26d; background:rgba(35,178,109,0.03); transform:translateY(-2px); box-shadow:0 8px 24px rgba(35,178,109,0.1); }
  .sc-emoji { font-size:26px; }
  .sc-lbl { font-size:10px; font-weight:600; color:#9ca3af; text-align:center; padding:0 6px; }

  /* FEAT */
  .feat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:32px; }
  .feat-item { display:flex; gap:14px; align-items:flex-start; padding:18px; border-radius:14px; background:white; border:1.5px solid rgba(0,0,0,0.06); }
  .feat-icon { width:40px; height:40px; border-radius:12px; background:rgba(35,178,109,0.08); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .feat-title { font-size:14px; font-weight:700; margin-bottom:4px; }
  .feat-desc { font-size:13px; color:#6b7280; line-height:1.5; }

  /* FSRS EXPLAINER */
  .fsrs-card { background:white; border-radius:20px; padding:28px; border:1.5px solid rgba(0,0,0,0.06); }
  .fsrs-row { display:flex; gap:12px; align-items:center; padding:"10px 0"; }
  .fsrs-num { width:28px; height:28px; border-radius:50%; background:#eef0ff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#4255ff; flex-shrink:0; }
  .interval-bar { display:flex; gap:6px; align-items:center; margin-top:16px; }
  .interval-pip { height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:white; }

  /* CTA */
  .cta-bar { background:linear-gradient(135deg,#23b26d,#16a34a); padding:80px 48px; text-align:center; }
  .cta-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; color:white; letter-spacing:-1.5px; margin-bottom:14px; }
  .cta-sub { font-size:16px; color:rgba(255,255,255,0.75); margin-bottom:32px; }
  .btn-cta { padding:14px 32px; border-radius:14px; font-size:16px; font-weight:700; background:white; color:#23b26d; border:none; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.15); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
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
  .inp:focus { border-color:#23b26d; box-shadow:0 0 0 3px rgba(35,178,109,0.1); }
  .modal-divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
  .modal-divider::before,.modal-divider::after { content:''; flex:1; height:1px; background:rgba(0,0,0,0.08); }
  .modal-divider span { font-size:12px; color:#6b7280; }
  .btn-google { width:100%; padding:12px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.1); background:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-google:hover { background:#f9f9f9; }
  .modal-submit { width:100%; padding:13px; border-radius:12px; background:#23b26d; color:white; border:none; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; margin-top:4px; }
  .modal-submit:hover { background:#1a9158; }
  .modal-toggle { text-align:center; margin-top:14px; font-size:13px; color:#6b7280; }
  .modal-toggle button { background:none; border:none; color:#23b26d; font-weight:700; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; }
  .user-pill { display:flex; align-items:center; gap:8px; padding:6px 14px; border-radius:100px; background:rgba(35,178,109,0.08); border:1px solid rgba(35,178,109,0.2); cursor:pointer; font-size:13px; font-weight:600; color:#23b26d; }
  .uav { width:24px; height:24px; border-radius:50%; background:#23b26d; color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }

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
    .mode-widget { padding:20px; }
    .modes-grid-w { grid-template-columns:1fr; }
    .section { padding:56px 20px; }
    .section-title { font-size:clamp(24px,6vw,36px); letter-spacing:-1px; }
    .modes-section-grid { grid-template-columns:1fr 1fr; gap:12px; }
    .sc-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .feat-grid { grid-template-columns:1fr; }
    .fsrs-card { padding:20px; }
    .cta-bar { padding:56px 20px; }
    .cta-title { font-size:clamp(26px,6vw,36px); letter-spacing:-1px; }
    footer { padding:48px 20px 24px; }
    .ft-grid { grid-template-columns:1fr 1fr; gap:24px; padding-bottom:32px; }
    .modal-box { padding:28px 20px; }
    .split,.split.rev { flex-direction:column; gap:32px; }
  }
  @media (max-width:480px) {
    .hero-title { font-size:30px; }
    .modes-section-grid { grid-template-columns:1fr; }
    .sc-grid { grid-template-columns:1fr 1fr; }
    .ft-grid { grid-template-columns:1fr; }
    .cat-tabs { width:100%; }
    .cat-tab { flex:1; text-align:center; }
    .interval-bar { flex-wrap:wrap; gap:4px; }
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
      provider.setCustomParameters({ prompt: "select_account" });
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

/* ── Data pulled directly from dashboard CATEGORIES ── */
const CLASSIC_MODES = [
  { icon:"🔄", title:"Flip Cards",        desc:"Classic front-to-back card review. Self-paced and effective for vocabulary, definitions, and quick recall.",        badge:null },
  { icon:"⚡", title:"Swipe Cards",        desc:"Swipe left or right to mark cards. Fast-paced recall designed to build speed and instinctive memory retrieval.",     badge:null },
  { icon:"⏱️", title:"Memory Sprint",      desc:"Timed pressure mode. A countdown clock is added to each card to simulate exam conditions and sharpen focus.",       badge:null },
  { icon:"📅", title:"Spaced Repetition",  desc:"FSRS-5 algorithm scheduling. Cards you know are shown less. Cards you struggle with come back sooner and more often.", badge:"FSRS-5" },
  { icon:"🎯", title:"Weak Spot Trainer",  desc:"Automatically drills the cards you have previously flagged as hard or unknown. No setup needed.",                    badge:null },
  { icon:"🍅", title:"Pomodoro",           desc:"Built-in Pomodoro timer tied to your study sessions. Work in focused blocks with automatic break reminders.",        badge:null },
];

const AI_MODES = [
  { icon:"🧠", title:"AI Revision",    desc:"An adaptive AI tutor that adjusts the difficulty of questions based on how you're performing in real time. Premium only.",    premium:true },
  { icon:"🏆", title:"Exam Simulator", desc:"Generates a full mock exam from your deck, with timing, scoring, and a breakdown of which areas need more work. Premium.",   premium:true },
  { icon:"🤖", title:"Explain Back",   desc:"Feynman technique. The AI asks you to explain a concept in plain language, then evaluates the quality of your answer. Premium.", premium:true },
];

const SCREENSHOTS = [
  ["🃏","Flip Cards mode"],     ["⚡","Swipe Cards view"],     ["⏱️","Memory Sprint timer"],  ["📅","Spaced Repetition"],
  ["🎯","Weak Spot Trainer"],   ["🍅","Pomodoro timer"],       ["🧠","AI Revision session"],   ["🏆","Exam Simulator"],
  ["🤖","Explain Back (Feynman)"],["📊","Session stats"],      ["🏅","Streak tracker"],        ["📈","Progress over time"],
  ["🔔","Review reminders"],    ["🔀","Shuffle deck"],         ["🌗","Focus mode"],            ["📱","Mobile view"],
];

const FEATURES = [
  { icon:"📅", title:"FSRS-5 spaced repetition",    desc:"The most advanced open-source spaced repetition algorithm. Cards scheduled at optimal intervals based on how you rate each one." },
  { icon:"🎯", title:"Weak Spot Trainer",          desc:"Automatically collects every card you flag and drills them until you mark them as known." },
  { icon:"⏱️", title:"Timed pressure modes",       desc:"Memory Sprint and Pomodoro both add time pressure to simulate exam conditions while you study." },
  { icon:"🧠", title:"Adaptive AI (Premium)",      desc:"AI Revision adjusts difficulty in real time based on your performance across the session." },
  { icon:"🔄", title:"6 Classic modes, 3 AI modes", desc:"Nine total study modes across two categories. Pick by mood, by subject, or by how much time you have." },
  { icon:"📊", title:"Session analytics",          desc:"Every session tracks accuracy, cards reviewed, time spent, and streak consistency." },
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

export default function LearnModePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser]         = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState("classic");
  const [activeMode, setActiveMode] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const displayModes = activeCat === "classic" ? CLASSIC_MODES : AI_MODES;

  return (
    <>
      <style>{css}</style>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); goToDashboard(); }} />}

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
            <div className="hero-label">✦ Learn Mode</div>
            <h1 className="hero-title">Nine ways to <em>study a deck.</em></h1>
            <p className="hero-sub">Six classic modes and three AI-powered modes, all built around active recall. Pick by how much time you have or how close the exam is. Switch between modes any time.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:28 }}>
              <button className="btn-hg" onClick={() => setShowAuth(true)}>Start a session →</button>
              <button className="btn-hs" onClick={() => document.getElementById("modes")?.scrollIntoView({ behavior:"smooth" })}>See all modes</button>
            </div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {["6 classic modes","3 AI modes (Premium)","FSRS-5 spaced repetition","Pomodoro timer built in"].map((t, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#6b7280" }}>
                  <span style={{ color:"#23b26d", fontWeight:700 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>

          {/* Mode selector widget */}
          <div className="mode-widget">
            <div style={{ fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:12 }}>Pick a study mode</div>
            <div className="cat-tabs">
              <button className={`cat-tab classic${activeCat === "classic" ? " on" : ""}`} onClick={() => { setActiveCat("classic"); setActiveMode(0); }}>Classic</button>
              <button className={`cat-tab ai${activeCat === "ai" ? " on" : ""}`} onClick={() => { setActiveCat("ai"); setActiveMode(0); }}>AI Premium</button>
            </div>
            <div className="modes-grid-w">
              {displayModes.map((m, i) => (
                <div key={i} className={`mode-item${i === activeMode ? " active" : ""}${m.premium ? " ai-mode" : ""}`} onClick={() => setActiveMode(i)}>
                  <div className="mode-icon-box">{m.icon}</div>
                  <div>
                    <div className="mode-name">
                      {m.title}
                      {m.badge && <span className="premium-tag">{m.badge}</span>}
                      {m.premium && <span className="premium-tag">Premium</span>}
                    </div>
                    <div className="mode-desc-s">{m.desc.split(".")[0]}.</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, background:"#f6f7fb", borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color:"#1a1d28" }}>
                {displayModes[activeMode]?.icon} {displayModes[activeMode]?.title}
              </div>
              <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.6 }}>
                {displayModes[activeMode]?.desc}
              </div>
              {displayModes[activeMode]?.premium && (
                <div style={{ marginTop:10, padding:"6px 12px", borderRadius:100, background:"rgba(35,178,109,0.1)", color:"#23b26d", fontSize:11, fontWeight:700, display:"inline-block" }}>
                  Requires Premium
                </div>
              )}
            </div>
            <button style={{ width:"100%", marginTop:14, padding:"11px", borderRadius:12, background:"#23b26d", color:"white", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }} onClick={() => setShowAuth(true)}>
              Start {displayModes[activeMode]?.title} →
            </button>
          </div>
        </div>
      </div>

      {/* CLASSIC MODES */}
      <div id="modes" className="bg-white">
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ Classic Modes</div>
            <h2 className="section-title">Six modes. Zero setup. Free for everyone.</h2>
            <p className="section-body">Pick any deck you've already created and launch it in any of the six classic modes. No extra configuration needed.</p>
            <div className="modes-section-grid">
              {CLASSIC_MODES.map((m, i) => (
                <div key={i} className="mode-card">
                  <div className="mc-icon">{m.icon}</div>
                  <div className="mc-title">
                    {m.title}
                    {m.badge && <span className="mc-badge" style={{ background:"#eef0ff", color:"#4255ff" }}>{m.badge}</span>}
                  </div>
                  <div className="mc-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FSRS EXPLAINER */}
      <div className="page">
        <div className="section fiv">
          <div style={{ display:"flex", gap:72, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div className="section-label">✦ Spaced Repetition</div>
              <h2 className="section-title">FSRS-5. The algorithm that actually works.</h2>
              <p className="section-body">FORKSAI uses FSRS-5 — the most advanced open-source spaced repetition algorithm available. Cards are scheduled at mathematically optimal intervals based on how well you know each one.</p>
              <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  "Review a card and rate it Easy, Medium, or Hard",
                  "Easy cards are pushed further into the future",
                  "Hard cards come back after just 1 day",
                  "Your deck shrinks over time as cards move to long intervals",
                ].map((t, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div className="fsrs-num">{i+1}</div>
                    <div style={{ fontSize:14, color:"#1a1d28", paddingTop:4, lineHeight:1.5 }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div className="fsrs-card">
                <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Review interval visualized</div>
                {[
                  { label:"New card",     intervals:["Day 1","Day 3","Day 7","Day 17","Day 40"], color:"#ef4444" },
                  { label:"Getting there",intervals:["Day 1","Day 4","Day 12","Day 30"],         color:"#f59e0b" },
                  { label:"Mastered",     intervals:["Day 1","Day 7","Day 30","Day 90"],         color:"#23b26d" },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>{row.label}</div>
                    <div className="interval-bar">
                      {row.intervals.map((label, j) => (
                        <div key={j} className="interval-pip" style={{ flex: j + 1, background: row.color, opacity: 0.3 + j * 0.18, fontSize:9, padding:"0 4px", overflow:"hidden", whiteSpace:"nowrap" }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:8, fontStyle:"italic" }}>Intervals grow as your rating improves.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI MODES */}
      <div className="bg-white">
        <div className="page">
          <div className="section fiv">
            <div className="section-label" style={{ color:"#23b26d" }}>✦ AI Modes</div>
            <h2 className="section-title">Three premium modes powered by AI.</h2>
            <p className="section-body">These go beyond flashcards. The AI adapts, generates exam papers, and evaluates your explanations. Premium only.</p>
            <div className="modes-section-grid">
              {AI_MODES.map((m, i) => (
                <div key={i} className="mode-card premium">
                  <div className="mc-icon">{m.icon}</div>
                  <div className="mc-title">
                    {m.title}
                    <span className="mc-badge" style={{ background:"rgba(35,178,109,0.1)", color:"#23b26d" }}>Premium</span>
                  </div>
                  <div className="mc-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SCREENSHOTS */}
      <div id="screenshots" className="page">
        <div className="section fiv">
          <div className="section-label">✦ Every Screen</div>
          <h2 className="section-title">All nine modes, all screens.</h2>
          <p className="section-body">Every state inside Learn Mode, from launching a session to reviewing your final score and streak.</p>
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

      {/* FEATURES */}
      <div className="bg-white">
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ Features</div>
            <h2 className="section-title">Everything built around how memory actually forms.</h2>
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
        <h2 className="cta-title">Pick a mode and start your first session.</h2>
        <p className="cta-sub">All six classic modes are free. No credit card needed.</p>
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
              <p className="ft-tagline">Nine study modes built around active recall. Classic and AI-powered, all in one place.</p>
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
              <a href="/blog/spaced-repetition" className="ft-link">Spaced Repetition</a>
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
