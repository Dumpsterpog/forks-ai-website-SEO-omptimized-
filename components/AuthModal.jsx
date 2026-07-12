"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { Eye, EyeOff, Loader2, X } from "lucide-react";

/* ── Firebase error mapper ── */
const getAuthErrorMessage = (error) => {
  switch (error?.code || "") {
    case "auth/user-not-found":         return "No account found with this email.";
    case "auth/wrong-password":         return "Incorrect password.";
    case "auth/invalid-email":          return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
    case "auth/account-exists-with-different-credential":
                                        return "This account uses Google sign-in. Try Google or use 'Forgot password'.";
    case "auth/email-already-in-use":   return "An account with this email already exists.";
    case "auth/weak-password":          return "Password is too weak - minimum 8 characters.";
    case "auth/too-many-requests":      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":   return "Google sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default:                            return "Something went wrong. Please try again.";
  }
};

/* ── Password strength ── */
const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Weak",   width: "33%",  color: "bg-red-500" };
  if (score === 2) return { label: "Fair",   width: "66%",  color: "bg-yellow-400" };
  return              { label: "Strong", width: "100%", color: "bg-[#5CB85C]" };
};

export default function AuthModal({ auth, onClose, onSuccess }) {
  const provider = new GoogleAuthProvider();

  const [mode,            setMode]            = useState("login");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [info,            setInfo]            = useState("");
  const [showResend,      setShowResend]      = useState(false);

  const strength = getStrength(password);

  /* ESC + Enter */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter")  submit();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, email, password, confirmPassword, loading]);

  /* Prevent body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const clearMessages = () => { setError(""); setInfo(""); setShowResend(false); };

  /* ── Submit ── */
  const submit = async () => {
    if (loading) return;
    clearMessages();

    if (!email || !password) { setError("Please enter your email and password."); return; }
    if (mode === "register") {
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      if (strength.label === "Weak")    { setError("Please choose a stronger password."); return; }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!cred.user.emailVerified) {
          await signOut(auth);
          setError("Please verify your email before logging in.");
          setShowResend(true);
          return;
        }
        onSuccess();
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setInfo("Verification email sent. Check your inbox before logging in.");
        setMode("login");
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend verification ── */
  const resendVerification = async () => {
    if (!email || !password) { setError("Enter your email and password to resend."); return; }
    setLoading(true); clearMessages();
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setInfo("Verification email resent. Check your inbox.");
      setShowResend(false);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google ── */
  const google = async () => {
    if (loading) return;
    setLoading(true); clearMessages();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password ── */
  const forgotPassword = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setLoading(true); clearMessages();
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white text-sm text-[#111] placeholder-[#999] focus:outline-none focus:border-[#F0D44A] transition-all";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-full max-w-sm bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] overflow-hidden"
        >
          <div className="p-7">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-1">FORKSAI</p>
                <h2 className="font-serif font-black text-2xl text-[#111]">
                  {mode === "login" ? "Welcome back." : "Create account."}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border-2 border-black text-[#555] hover:bg-bg transition-colors mt-1 shadow-[2px_2px_0_#111]"
              >
                <X size={14} />
              </button>
            </div>

            {/* Legacy notice */}
            {mode === "login" && (
              <div className="mb-5 px-4 py-3 rounded-xl border-2 border-black bg-bg">
                <p className="text-[11px] text-[#555] leading-relaxed">
                  Account from before Jan 3, 2026? Use <span className="font-bold text-[#111]">Forgot password</span> or <span className="font-bold text-[#111]">Google sign-in</span>.
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >

                {/* Google */}
                <button
                  onClick={google}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border-2 border-black bg-white text-sm font-bold text-[#111] shadow-[3px_3px_0_#111] hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-black/10" />
                  <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold">or</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                {/* Email */}
                <input
                  autoFocus
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                />

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password strength (register only) */}
                {mode === "register" && password && (
                  <div className="px-1">
                    <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden border border-black/10">
                      <div className={`h-full transition-all duration-300 rounded-full ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="text-[10px] text-[#555] mt-1">
                      Strength: <span className={`font-bold ${strength.label === "Strong" ? "text-green" : strength.label === "Fair" ? "text-yellow-600" : "text-red-500"}`}>{strength.label}</span>
                    </p>
                  </div>
                )}

                {/* Confirm password (register only) */}
                {mode === "register" && (
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                )}

                {/* Error / info messages */}
                {error && (
                  <p className="text-xs text-red-600 px-1 leading-relaxed font-medium">{error}</p>
                )}
                {info && (
                  <p className="text-xs text-green px-1 leading-relaxed font-medium">{info}</p>
                )}

                {/* Resend verification */}
                {showResend && (
                  <button
                    onClick={resendVerification}
                    disabled={loading}
                    className="text-xs text-[#555] hover:text-[#111] transition-colors px-1 underline underline-offset-4 font-medium"
                  >
                    Resend verification email
                  </button>
                )}

                {/* Submit */}
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-black text-[#111] text-sm font-black shadow-[3px_3px_0_#111] hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                  style={{ background: "#F0D44A" }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {mode === "login" ? "Log in" : "Create account"}
                </button>

                {/* Forgot password */}
                {mode === "login" && (
                  <button
                    onClick={forgotPassword}
                    disabled={loading}
                    className="w-full text-center text-xs text-[#555] hover:text-[#111] transition-colors pt-1 underline underline-offset-4 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Switch mode */}
            <p className="text-xs text-center mt-6 text-[#555]">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { clearMessages(); setMode(mode === "login" ? "register" : "login"); }}
                className="text-[#111] font-bold hover:underline underline-offset-4 transition-colors"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
