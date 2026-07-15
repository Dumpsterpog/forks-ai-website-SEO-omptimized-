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
  .btn-ghost { padding:9px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:transparent; border:1.5px solid rgba(22,163,74,0.3); color:#16a34a; font-family:'DM Sans',sans-serif; }
  .btn-ghost:hover { background:#f0fdf4; }
  .btn-primary { padding:10px 22px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; background:#16a34a; color:white; border:none; box-shadow:0 4px 14px rgba(22,163,74,0.3); font-family:'DM Sans',sans-serif; }
  .btn-primary:hover { background:#15803d; transform:translateY(-1px); }

  .page { max-width:1200px; margin:0 auto; }
  .section { padding:96px 48px; }
  .section-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#16a34a; margin-bottom:16px; }
  .section-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; letter-spacing:-1.5px; line-height:1.1; }
  .section-body { font-size:16px; color:#6b7280; line-height:1.65; max-width:520px; margin-top:14px; }

  /* HERO */
  .hero { padding:140px 48px 80px; display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
  .hero-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#16a34a; margin-bottom:16px; }
  .hero-title { font-family:'Sora',sans-serif; font-size:clamp(36px,5vw,60px); font-weight:800; letter-spacing:-2px; line-height:1.06; margin-bottom:20px; }
  .hero-title em { color:#16a34a; font-style:normal; }
  .hero-sub { font-size:17px; color:#6b7280; line-height:1.65; margin-bottom:28px; }
  .btn-hg { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; background:#16a34a; color:white; border:none; box-shadow:0 8px 24px rgba(22,163,74,0.3); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hg:hover { background:#15803d; transform:translateY(-2px); }
  .btn-hs { padding:14px 30px; border-radius:14px; font-size:16px; font-weight:600; cursor:pointer; background:white; color:#1a1d28; border:1.5px solid rgba(0,0,0,0.1); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-hs:hover { background:#f9f9f9; }

  /* NOTES WIDGET */
  .notes-widget { background:white; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(22,163,74,0.12); border:1.5px solid rgba(22,163,74,0.12); }
  .nw-bar { display:flex; align-items:center; gap:8px; padding:10px 16px; background:#f8fffe; border-bottom:1px solid rgba(22,163,74,0.1); }
  .mac-dot { width:10px; height:10px; border-radius:50%; }
  .nw-title-bar { flex:1; font-size:12px; font-weight:600; color:#6b7280; }
  .nw-badge { background:rgba(22,163,74,0.1); color:#16a34a; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; }
  .nw-body { padding:20px; }
  .step-indicator { display:flex; align-items:center; gap:0; margin-bottom:18px; }
  .si-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; }
  .si-line { flex:1; height:2px; margin:0 4px; }
  .nw-config-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
  .nw-config-item { padding:10px; border-radius:10px; border:1.5px solid; cursor:pointer; transition:all 0.15s; }
  .nw-config-item.on  { border-color:rgba(22,163,74,0.3); background:rgba(22,163,74,0.05); }
  .nw-config-item.off { border-color:rgba(0,0,0,0.07); background:white; }
  .nci-title { font-size:11px; font-weight:700; color:#1a1d28; margin-bottom:2px; }
  .nci-desc  { font-size:10px; color:#9ca3af; }
  .nw-toggle { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:10px; border:1.5px solid rgba(0,0,0,0.07); margin-bottom:8px; cursor:pointer; }
  .nw-toggle.on { border-color:rgba(22,163,74,0.25); background:rgba(22,163,74,0.04); }
  .toggle-track { width:28px; height:14px; border-radius:7px; position:relative; transition:background 0.2s; flex-shrink:0; }
  .toggle-thumb { width:10px; height:10px; border-radius:50%; background:white; position:absolute; top:2px; transition:left 0.2s; }
  .upload-zone { border:2px dashed rgba(22,163,74,0.25); border-radius:12px; padding:28px; text-align:center; cursor:pointer; transition:all 0.2s; }
  .upload-zone:hover { border-color:#16a34a; background:rgba(22,163,74,0.03); }
  .editor-preview { background:#f8fffe; border-radius:10px; padding:14px; font-size:12px; line-height:1.7; color:#1a1d28; border:1px solid rgba(22,163,74,0.12); }
  .ep-toolbar { display:flex; gap:6px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(0,0,0,0.06); flex-wrap:wrap; }
  .ep-btn { padding:"3px 6px"; border-radius:5px; background:#f6f7fb; border:1px solid rgba(0,0,0,0.07); font-size:10px; font-weight:700; cursor:pointer; }

  /* STEPS FLOW */
  .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:40px; }
  .step-card { background:white; border-radius:20px; padding:24px; border:1.5px solid rgba(0,0,0,0.06); }
  .sc-num { font-family:'Sora',sans-serif; font-size:32px; font-weight:800; color:#f0fdf4; margin-bottom:10px; }
  .sc-title { font-family:'Sora',sans-serif; font-size:16px; font-weight:700; margin-bottom:6px; }
  .sc-desc { font-size:13px; color:#6b7280; line-height:1.55; }

  /* NOTE STYLES SHOWCASE */
  .styles-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:32px; }
  .style-card { background:white; border-radius:20px; padding:24px; border:1.5px solid rgba(0,0,0,0.06); transition:all 0.2s; }
  .style-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(22,163,74,0.1); border-color:rgba(22,163,74,0.2); }
  .style-icon { font-size:24px; margin-bottom:12px; }
  .style-title { font-family:'Sora',sans-serif; font-size:16px; font-weight:700; margin-bottom:6px; }
  .style-desc { font-size:13px; color:#6b7280; line-height:1.55; }

  /* EDITOR FEATURE */
  .editor-demo { background:white; border-radius:20px; overflow:hidden; border:1.5px solid rgba(22,163,74,0.12); }
  .ed-toolbar { display:flex; gap:6px; padding:10px 16px; background:#f8fffe; border-bottom:1px solid rgba(22,163,74,0.1); flex-wrap:wrap; align-items:center; }
  .ed-btn { padding:4px 8px; border-radius:6px; background:#f6f7fb; border:1px solid rgba(0,0,0,0.07); font-size:11px; font-weight:700; color:#1a1d28; cursor:pointer; }
  .ed-sep { width:1px; height:18px; background:rgba(0,0,0,0.08); margin:0 2px; }
  .ed-body { padding:24px 28px; min-height:200px; }
  .ed-h2 { font-family:'Sora',sans-serif; font-size:18px; font-weight:700; margin-bottom:10px; }
  .ed-h3 { font-family:'Sora',sans-serif; font-size:14px; font-weight:700; margin-bottom:6px; color:"#374151"; }
  .ed-p { font-size:13px; color:#4b5563; line-height:1.7; margin-bottom:10px; }
  .ed-ul { margin:0 0 10px 18px; }
  .ed-li { font-size:13px; color:#4b5563; line-height:1.7; margin-bottom:3px; }
  .ed-kw-row { display:flex; gap:6px; flex-wrap:wrap; margin-top:14px; }
  .ed-kw { padding:4px 10px; border-radius:100px; background:rgba(22,163,74,0.08); color:#16a34a; font-size:11px; font-weight:600; border:1px solid rgba(22,163,74,0.15); }

  /* SCREENSHOT GRID */
  .sc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:40px; }
  .sc-cell { aspect-ratio:16/10; border-radius:14px; border:2px dashed rgba(22,163,74,0.2); background:white; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; cursor:pointer; transition:all 0.2s; }
  .sc-cell:hover { border-color:#16a34a; background:#f0fdf4; transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,163,74,0.08); }
  .sc-emoji { font-size:26px; }
  .sc-lbl { font-size:10px; font-weight:600; color:#9ca3af; text-align:center; padding:0 6px; }

  /* FEAT */
  .feat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:32px; }
  .feat-item { display:flex; gap:14px; align-items:flex-start; padding:18px; border-radius:14px; background:white; border:1.5px solid rgba(0,0,0,0.06); }
  .feat-icon { width:40px; height:40px; border-radius:12px; background:rgba(22,163,74,0.08); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .feat-title { font-size:14px; font-weight:700; margin-bottom:4px; }
  .feat-desc { font-size:13px; color:#6b7280; line-height:1.5; }

  /* CTA */
  .cta-bar { background:linear-gradient(135deg,#16a34a,#059669); padding:80px 48px; text-align:center; }
  .cta-title { font-family:'Sora',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; color:white; letter-spacing:-1.5px; margin-bottom:14px; }
  .cta-sub { font-size:16px; color:rgba(255,255,255,0.75); margin-bottom:32px; }
  .btn-cta { padding:14px 32px; border-radius:14px; font-size:16px; font-weight:700; background:white; color:#16a34a; border:none; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.15); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
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
  .inp:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.1); }
  .modal-divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
  .modal-divider::before,.modal-divider::after { content:''; flex:1; height:1px; background:rgba(0,0,0,0.08); }
  .modal-divider span { font-size:12px; color:#6b7280; }
  .btn-google { width:100%; padding:12px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.1); background:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .btn-google:hover { background:#f9f9f9; }
  .modal-submit { width:100%; padding:13px; border-radius:12px; background:#16a34a; color:white; border:none; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; margin-top:4px; }
  .modal-submit:hover { background:#15803d; }
  .modal-toggle { text-align:center; margin-top:14px; font-size:13px; color:#6b7280; }
  .modal-toggle button { background:none; border:none; color:#16a34a; font-weight:700; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; }
  .user-pill { display:flex; align-items:center; gap:8px; padding:6px 14px; border-radius:100px; background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.2); cursor:pointer; font-size:13px; font-weight:600; color:#16a34a; }
  .uav { width:24px; height:24px; border-radius:50%; background:#16a34a; color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }

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
    .notes-widget { border-radius:18px; }
    .nw-config-grid { grid-template-columns:1fr; }
    .section { padding:56px 20px; }
    .section-title { font-size:clamp(24px,6vw,36px); letter-spacing:-1px; }
    .steps-grid { grid-template-columns:1fr; }
    .styles-grid { grid-template-columns:1fr 1fr; gap:12px; }
    .output-types { grid-template-columns:1fr; }
    .sc-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .feat-grid { grid-template-columns:1fr; }
    .before-after { grid-template-columns:1fr; }
    .editor-demo .ed-toolbar { gap:3px; }
    .cta-bar { padding:56px 20px; }
    .cta-title { font-size:clamp(26px,6vw,36px); letter-spacing:-1px; }
    footer { padding:48px 20px 24px; }
    .ft-grid { grid-template-columns:1fr 1fr; gap:24px; padding-bottom:32px; }
    .modal-box { padding:28px 20px; }
    .split,.split.rev { flex-direction:column; gap:32px; }
  }
  @media (max-width:480px) {
    .hero-title { font-size:30px; }
    .styles-grid { grid-template-columns:1fr; }
    .sc-grid { grid-template-columns:1fr 1fr; }
    .ft-grid { grid-template-columns:1fr; }
    .nw-tabs { overflow-x:auto; }
    .nw-tab { white-space:nowrap; }
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

/* ── Data from actual PDFToNotes.jsx ── */
const NOTE_STYLES = [
  { icon:"📋", title:"Structured",  desc:"Bullet points, headings, and numbered sections. Clean and scannable for most subjects." },
  { icon:"📐", title:"Cornell",     desc:"Classic Cornell format: cues on the left, notes in the main area, summary at the bottom." },
  { icon:"📖", title:"Narrative",   desc:"Written in prose form, reads like a polished summary. Good for humanities and law." },
  { icon:"#️⃣", title:"Outline",     desc:"Hierarchical indented outline. Best for dense content with many sub-topics." },
];

const DETAIL_LEVELS = [
  { icon:"⚡", label:"Concise",  desc:"Short, punchy. Key points only. Best for last-minute review or subjects you mostly know.", c:"#4ade80" },
  { icon:"⚖️", label:"Balanced", desc:"The default. Enough context to understand each point without being overwhelming.", c:"#16a34a" },
  { icon:"📚", label:"Detailed", desc:"Full explanations, examples, and elaboration. Best for building deep understanding from scratch.", c:"#60a5fa" },
];

const FOCUS_OPTIONS = [
  { icon:"🌐", title:"Everything",    desc:"All content extracted evenly with no priority given to any section." },
  { icon:"💡", title:"Key Concepts",  desc:"Focus on the central ideas, definitions, and main arguments in the document." },
  { icon:"🔬", title:"Examples",      desc:"Pull out case studies, worked examples, and illustrations of concepts." },
  { icon:"📊", title:"Data & Stats",  desc:"Focus on figures, statistics, percentages, and quantitative information." },
];

const SCREENSHOTS = [
  ["✏️","Name your document"], ["📋","Note style picker"],   ["⚖️","Detail level"],       ["🌐","Content focus"],
  ["🔘","Summary toggle"],     ["🔑","Keywords toggle"],     ["📤","Upload PDF view"],    ["⚡","AI processing"],
  ["✍️","Rich text editor"],   ["🔠","Font family picker"],  ["📏","Font size control"],  ["💾","Save notes"],
  ["📥","Export as txt"],      ["🔁","New document"],        ["🌗","Full screen mode"],   ["📱","Mobile editor"],
];

const FEATURES = [
  { icon:"📋", title:"4 note styles",             desc:"Structured bullet points, Cornell format, narrative prose, or hierarchical outline. Pick what suits the subject." },
  { icon:"⚖️", title:"3 detail levels",           desc:"Concise for quick review, Balanced for most cases, Detailed for deep understanding. Set before uploading." },
  { icon:"🌐", title:"Content focus options",     desc:"Focus on everything, key concepts only, worked examples, or data and statistics." },
  { icon:"✍️", title:"Built-in rich text editor", desc:"Bold, italic, underline, H2/H3 headings, alignment, ordered and unordered lists, and a font/size picker." },
  { icon:"💾", title:"Auto-save to your account", desc:"Notes save to your account automatically. Re-open and edit any document from your dashboard." },
  { icon:"📥", title:"Export as text",            desc:"Download your notes as a .txt file ready to paste into any document or share with your study group." },
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

export default function NotesSummarizerPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser]         = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeStyle, setActiveStyle] = useState(0);
  const [activeDetail, setActiveDetail] = useState(1);
  const [activeFocus, setActiveFocus] = useState(0);
  const [includeSum, setIncludeSum] = useState(true);
  const [includeKw, setIncludeKw]   = useState(true);

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
            <div className="hero-label">✦ Notes Summarizer</div>
            <h1 className="hero-title">Upload your PDF. Get <em>structured notes</em> in seconds.</h1>
            <p className="hero-sub">A 3-step flow turns any PDF into properly formatted notes. Choose your style, detail level, and focus area. Then edit in a built-in rich text editor and save it to your account.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:28 }}>
              <button className="btn-hg" onClick={() => setShowAuth(true)}>Summarize a PDF →</button>
              <button className="btn-hs" onClick={() => document.getElementById("styles")?.scrollIntoView({ behavior:"smooth" })}>See all options</button>
            </div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {["4 note styles","3 detail levels","Content focus options","Rich text editor"].map((t, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#6b7280" }}>
                  <span style={{ color:"#16a34a", fontWeight:700 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive widget */}
          <div className="notes-widget">
            <div className="nw-bar">
              <div className="mac-dot" style={{ background:"#ff5f57" }} />
              <div className="mac-dot" style={{ background:"#ffbd2e" }} />
              <div className="mac-dot" style={{ background:"#28ca41" }} />
              <span className="nw-title-bar" style={{ marginLeft:6 }}>Notes Summarizer</span>
              <div className="nw-badge">Step {activeStep + 1} of 3</div>
            </div>
            <div className="nw-body">
              {/* step indicator */}
              <div className="step-indicator" style={{ marginBottom:16 }}>
                {["Title","Configure","Upload"].map((label, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
                    <div className="si-dot" style={{ background: i < activeStep ? "#16a34a" : i === activeStep ? "rgba(22,163,74,0.12)" : "#f6f7fb", border: `1px solid ${i <= activeStep ? "rgba(22,163,74,0.4)" : "rgba(0,0,0,0.08)"}`, color: i < activeStep ? "white" : i === activeStep ? "#16a34a" : "#9ca3af", cursor:"pointer" }} onClick={() => setActiveStep(i)}>
                      {i < activeStep ? "✓" : i + 1}
                    </div>
                    {i < 2 && <div className="si-line" style={{ background: i < activeStep ? "rgba(22,163,74,0.3)" : "rgba(0,0,0,0.07)" }} />}
                  </div>
                ))}
              </div>

              {activeStep === 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", marginBottom:6, letterSpacing:1 }}>DOCUMENT TITLE</div>
                  <div style={{ background:"white", borderRadius:10, padding:"10px 14px", border:"1.5px solid rgba(22,163,74,0.25)", fontSize:14, color:"#1a1d28", marginBottom:12 }}>
                    Organic Chemistry - Unit 4
                    <span style={{ marginLeft:6, color:"#16a34a", fontWeight:700 }}>✓</span>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["Cell Biology Lec 3","Contract Law","Macroeconomics","Calculus II"].map(t => (
                      <span key={t} style={{ padding:"4px 10px", borderRadius:100, background:"#f6f7fb", border:"1px solid rgba(0,0,0,0.08)", fontSize:11, color:"#6b7280", cursor:"pointer" }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", marginBottom:8, letterSpacing:1 }}>NOTE STYLE</div>
                  <div className="nw-config-grid" style={{ marginBottom:12 }}>
                    {NOTE_STYLES.map((s, i) => (
                      <div key={i} className={`nw-config-item ${activeStyle === i ? "on" : "off"}`} onClick={() => setActiveStyle(i)}>
                        <div className="nci-title">{s.icon} {s.title}</div>
                        <div className="nci-desc">{s.desc.split(".")[0]}.</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", marginBottom:6, letterSpacing:1 }}>DETAIL LEVEL</div>
                  <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                    {DETAIL_LEVELS.map((d, i) => (
                      <div key={i} onClick={() => setActiveDetail(i)} style={{ flex:1, padding:"8px 6px", borderRadius:10, border:`1.5px solid ${activeDetail === i ? d.c + "60" : "rgba(0,0,0,0.07)"}`, background: activeDetail === i ? d.c + "12" : "white", cursor:"pointer", textAlign:"center" }}>
                        <div style={{ fontSize:11, fontWeight:700, color: activeDetail === i ? d.c : "#9ca3af" }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`nw-toggle${includeSum ? " on" : ""}`} onClick={() => setIncludeSum(p => !p)}>
                    <span style={{ fontSize:12, fontWeight:500, color: includeSum ? "#1a1d28" : "#9ca3af" }}>Include summary section</span>
                    <div className="toggle-track" style={{ background: includeSum ? "#16a34a" : "rgba(0,0,0,0.1)" }}>
                      <div className="toggle-thumb" style={{ left: includeSum ? "16px" : "2px" }} />
                    </div>
                  </div>
                  <div className={`nw-toggle${includeKw ? " on" : ""}`} onClick={() => setIncludeKw(p => !p)}>
                    <span style={{ fontSize:12, fontWeight:500, color: includeKw ? "#1a1d28" : "#9ca3af" }}>Include key terms list</span>
                    <div className="toggle-track" style={{ background: includeKw ? "#16a34a" : "rgba(0,0,0,0.1)" }}>
                      <div className="toggle-thumb" style={{ left: includeKw ? "16px" : "2px" }} />
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div>
                  <div className="upload-zone">
                    <div style={{ fontSize:28, marginBottom:8 }}>📄</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#1a1d28", marginBottom:4 }}>Drop your PDF here</div>
                    <div style={{ fontSize:12, color:"#9ca3af" }}>Up to 20MB. Text-based PDFs work best.</div>
                  </div>
                  <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.15)", fontSize:12, color:"#16a34a", fontWeight:600 }}>
                    Configured: {NOTE_STYLES[activeStyle].title} · {DETAIL_LEVELS[activeDetail].label} · {includeSum ? "With summary" : "No summary"} · {includeKw ? "With key terms" : "No key terms"}
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                {activeStep > 0 && <button onClick={() => setActiveStep(s => s - 1)} style={{ flex:1, padding:"9px", borderRadius:10, border:"1.5px solid rgba(0,0,0,0.08)", background:"transparent", fontSize:13, fontWeight:600, cursor:"pointer", color:"#6b7280", fontFamily:"'DM Sans',sans-serif" }}>← Back</button>}
                {activeStep < 2
                  ? <button onClick={() => setActiveStep(s => s + 1)} style={{ flex:2, padding:"9px", borderRadius:10, background:"#16a34a", color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Continue →</button>
                  : <button onClick={() => setShowAuth(true)} style={{ flex:2, padding:"9px", borderRadius:10, background:"#16a34a", color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Generate notes →</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 STEPS */}
      <div style={{ background:"white" }}>
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ How It Works</div>
            <h2 className="section-title">Three steps from PDF to editable notes.</h2>
            <p className="section-body">Every step configures something real. The AI uses your exact settings to shape the output before it ever reads your file.</p>
            <div className="steps-grid">
              {[
                { n:"01", title:"Name your document", desc:"Start with a title. Type it in or pick from suggestions. This becomes the title heading inside your generated notes." },
                { n:"02", title:"Configure the output", desc:"Pick a note style (Structured, Cornell, Narrative, Outline), a detail level, a content focus, and whether to include a summary section and key terms list." },
                { n:"03", title:"Upload and generate", desc:"Upload your PDF (up to 20MB). The AI reads your file and generates notes in the exact format you configured. Results appear in the editor in seconds." },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="sc-num">{s.n}</div>
                  <div className="sc-title">{s.title}</div>
                  <div className="sc-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NOTE STYLES */}
      <div id="styles" className="page">
        <div className="section fiv">
          <div className="section-label">✦ Note Styles</div>
          <h2 className="section-title">Four formats. One upload.</h2>
          <p className="section-body">The same PDF generates completely different output depending on which style you choose. Pick the format that matches how you already study.</p>
          <div className="styles-grid">
            {NOTE_STYLES.map((s, i) => (
              <div key={i} className="style-card">
                <div className="style-icon">{s.icon}</div>
                <div className="style-title">{s.title}</div>
                <div className="style-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDITOR SECTION */}
      <div style={{ background:"white" }}>
        <div className="page">
          <div className="section fiv">
            <div style={{ display:"flex", gap:72, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div className="section-label">✦ The Editor</div>
                <h2 className="section-title">Your notes, fully editable.</h2>
                <p className="section-body">The output opens inside a full rich-text editor. Bold headings, restructure sections, change fonts, add bullet lists, and fix anything the AI got wrong. Then save to your account or export as a text file.</p>
                <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { t:"Bold, italic, underline",          d:"Standard formatting across any selected text." },
                    { t:"H2 and H3 headings",               d:"Structure long notes with proper heading hierarchy." },
                    { t:"Font family and size picker",       d:"DM Sans, DM Serif, or Courier New. Sizes from 10pt to 32pt." },
                    { t:"Ordered and unordered lists",       d:"Add bullets or numbered lists anywhere in the document." },
                    { t:"Full screen mode",                  d:"Expand the editor to fill the entire viewport for deep focus sessions." },
                    { t:"Save shortcut (Cmd/Ctrl + S)",      d:"Saves directly to your account. An unsaved banner appears until saved." },
                  ].map((f, i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ color:"#16a34a", fontWeight:700, fontSize:14, marginTop:1 }}>✓</span>
                      <div>
                        <span style={{ fontSize:14, fontWeight:700, color:"#1a1d28" }}>{f.t}</span>
                        <span style={{ fontSize:13, color:"#6b7280" }}> - {f.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div className="editor-demo">
                  <div className="ed-toolbar">
                    {["B","I","U"].map(b => <div key={b} className="ed-btn">{b}</div>)}
                    <div className="ed-sep" />
                    {["H2","H3","¶"].map(b => <div key={b} className="ed-btn">{b}</div>)}
                    <div className="ed-sep" />
                    {["≡","⊞"].map(b => <div key={b} className="ed-btn">{b}</div>)}
                    <div className="ed-sep" />
                    <div className="ed-btn" style={{ minWidth:90, fontSize:10 }}>DM Sans ▾</div>
                    <div className="ed-btn">14 ±</div>
                    <div className="ed-sep" />
                    <div className="ed-btn">⛶</div>
                    <span style={{ marginLeft:"auto", fontSize:10, color:"#9ca3af" }}>⌘S to save</span>
                  </div>
                  <div className="ed-body">
                    <div className="ed-h2">Chromosomes and Cell Division</div>
                    <div className="ed-p">Chromosomes are thread-like structures located inside the nucleus of eukaryotic cells. Each chromosome consists of a single DNA molecule tightly coiled around histone proteins.</div>
                    <div className="ed-h3">Key Structures</div>
                    <ul className="ed-ul">
                      <li className="ed-li">Centromere: connects sister chromatids during division</li>
                      <li className="ed-li">Telomere: protective cap at each chromosome end</li>
                      <li className="ed-li">Chromatid: one half of a duplicated chromosome</li>
                    </ul>
                    <div className="ed-kw-row">
                      {["Chromosome","Centromere","Telomere","Histone","Mitosis"].map(k => <span key={k} className="ed-kw">{k}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCREENSHOTS */}
      <div id="screenshots" className="page">
        <div className="section fiv">
          <div className="section-label">✦ Every Screen</div>
          <h2 className="section-title">The full product, start to finish.</h2>
          <p className="section-body">Every screen inside the Notes Summarizer flow, from naming your document through to editing and exporting your final notes.</p>
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
      <div style={{ background:"white" }}>
        <div className="page">
          <div className="section fiv">
            <div className="section-label">✦ Features</div>
            <h2 className="section-title">Everything built to save you time.</h2>
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
        <h2 className="cta-title">Turn your next PDF into study notes right now.</h2>
        <p className="cta-sub">Upload your first PDF and see exactly what comes out. Premium required to generate.</p>
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
              <p className="ft-tagline">Upload a PDF, pick your style, and get structured editable notes in seconds.</p>
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
              <a href="/blog/notes-maker" className="ft-link">AI Notes Guide</a>
              <a href="/blog/study-schedule" className="ft-link">Study Schedules</a>
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
