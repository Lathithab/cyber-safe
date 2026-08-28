"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function ShieldIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EyeIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29v-3.1H1.27A12 12 0 0 0 0 12c0 1.93.46 3.76 1.27 5.39l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F35325" />
      <rect x="13" y="2" width="9" height="9" fill="#81BC06" />
      <rect x="2" y="13" width="9" height="9" fill="#05A6F0" />
      <rect x="13" y="13" width="9" height="9" fill="#FFBA08" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("sipho.ndlovu@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // UI-only for now: no auth backend is wired up yet.
    router.push("/");
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="hero-brand"><span className="hero-brand-icon"><ShieldIcon size={20} color="#fff" /></span><strong>CyberSafe SA</strong></div>

          <div className="hero-copy">
            <h1>Empowering South African Communities to Stay Safe Online.</h1>
            <p>Join CyberSafe SA, a cybersecurity awareness platform built specifically for students, schools, and local communities. Learn how to spot scams, report online incidents, and get instant emergency assistance.</p>
          </div>

          <div className="hero-trust">
            <small>Trusted by education departments &amp; local communities</small>
            <div className="trust-row"><span>SAPS Connected</span><span>SA Banks Alliance</span><span>EduNet</span></div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Enter your details below to secure your workspace.</p>

          <div className="mode-toggle">
            <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Log In</button>
            <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <div className="password-row"><label className="field-label" htmlFor="password">Password</label><button type="button" className="forgot">Forgot?</button></div>
            <div className="password-shell">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
              <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility"><EyeIcon /></button>
            </div>

            <button type="submit" className="submit-button">{mode === "login" ? "Sign In" : "Create Account"}</button>
          </form>

          <div className="divider"><span>or connect with</span></div>
          <div className="oauth-row">
            <button type="button" className="oauth-button"><GoogleIcon />Google</button>
            <button type="button" className="oauth-button"><MicrosoftIcon />Microsoft</button>
          </div>
          <p className="demo-note">This screen is a front-end preview only — no account is created or verified yet.</p>
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .login-page { min-height: 100vh; display: flex; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .login-hero {
          position: relative; width: 44%; min-height: 100vh; padding: 46px 44px; color: #fff; overflow: hidden;
          background-image: linear-gradient(180deg, rgba(10,20,35,.35), rgba(10,20,35,.82)), url("https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop");
          background-size: cover; background-position: center;
        }
        .hero-scrim { display: none; }
        .hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
        .hero-brand { display: flex; align-items: center; gap: 12px; } .hero-brand-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: rgba(49,199,230,.35); border: 1px solid rgba(255,255,255,.25); } .hero-brand strong { font-family: "Syne", Arial, sans-serif; font-size: 19px; letter-spacing: -.2px; }
        .hero-copy { margin-top: auto; padding-bottom: 34px; } .hero-copy h1 { margin: 0 0 18px; font-family: "Syne", Arial, sans-serif; font-size: clamp(28px, 3.1vw, 38px); line-height: 1.12; letter-spacing: -1.1px; } .hero-copy p { margin: 0; max-width: 460px; color: rgba(255,255,255,.88); font-size: 15.5px; line-height: 1.55; }
        .hero-trust small { display: block; margin-bottom: 12px; color: rgba(255,255,255,.72); font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; } .trust-row { display: flex; flex-wrap: wrap; gap: 18px; font-size: 14px; font-weight: 700; }

        .login-panel { flex: 1; display: grid; place-items: center; padding: 40px 24px; }
        .login-card { width: 100%; max-width: 420px; padding: 40px; border: 1px solid #dce5ef; border-radius: 22px; background: #fff; box-shadow: 0 20px 50px rgba(15, 30, 60, .08); }
        h2 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 28px; letter-spacing: -1px; } .subtitle { margin: 10px 0 24px; color: #65738a; font-size: 15px; }
        .mode-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 26px; padding: 5px; border-radius: 13px; background: #f1f4f9; } .mode-toggle button { padding: 11px; border: 0; border-radius: 10px; background: transparent; color: #65738a; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; } .mode-toggle button.selected { background: #fff; color: #121a32; box-shadow: 0 4px 10px rgba(15,30,60,.08); }
        .field-label { display: block; margin: 16px 0 8px; color: #26324a; font-size: 14px; font-weight: 700; }
        input { width: 100%; height: 52px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 13px; background: #f8fafc; color: #121a32; font: inherit; font-size: 15px; outline: none; } input:focus { border-color: #31c7e6; box-shadow: 0 0 0 3px rgba(49,199,230,.15); }
        .password-row { display: flex; align-items: center; justify-content: space-between; } .password-row .field-label { margin: 16px 0 8px; } .forgot { border: 0; background: transparent; color: #1f87e7; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; }
        .password-shell { position: relative; } .password-shell input { padding-right: 46px; } .toggle-visibility { position: absolute; top: 50%; right: 14px; transform: translateY(-50%); border: 0; background: transparent; color: #8996a8; cursor: pointer; }
        .submit-button { width: 100%; margin-top: 26px; padding: 15px; border: 0; border-radius: 13px; background: #31c7e6; color: #06263a; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; }
        .divider { position: relative; margin: 26px 0 18px; text-align: center; } .divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e9f2; } .divider span { position: relative; padding: 0 14px; background: #fff; color: #8996a8; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .oauth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; } .oauth-button { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border: 1px solid #dce5ef; border-radius: 13px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; }
        .demo-note { margin: 18px 0 0; color: #a4afbe; font-size: 12px; text-align: center; line-height: 1.4; }

        @media (max-width: 900px) { .login-hero { display: none; } .login-panel { padding: 30px 18px; } }
        @media (max-width: 480px) { .login-card { padding: 28px 22px; border-radius: 18px; } .oauth-row { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
