"use client";

import { useRouter } from "next/navigation";

const actions = [
  { title: "I need help now", text: "Call your bank, report fraud, or find support nearby.", route: "/help", tone: "urgent", icon: "!" },
  { title: "Check a suspicious message", text: "Learn the warning signs before you reply, click, or pay.", route: "/library", tone: "primary", icon: "?" },
  { title: "Report a scam", text: "Share what happened and help others spot the same trick.", route: "/postReport", tone: "neutral", icon: "+" },
];

const navItems = [
  { label: "Home", route: "/", icon: "home" },
  { label: "Feed", route: "/feed", icon: "feed" },
  { label: "Post", route: "/postReport", icon: "post" },
  { label: "Library", route: "/library", icon: "library" },
  { label: "Help", route: "/help", icon: "help" },
];

function NavIcon({ icon }) {
  if (icon === "home") return <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" />;
  if (icon === "feed") return <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>;
  if (icon === "library") return <><path d="M4 19a2 2 0 012-2h14" /><path d="M6 3h14v18H6a2 2 0 01-2-2V5a2 2 0 012-2z" /></>;
  if (icon === "help") return <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" /><path d="M4.9 4.9l4 4M15.1 15.1l4 4M19.1 4.9l-4 4M8.9 15.1l-4 4" /></>;
  return <path d="M12 5v14M5 12h14" />;
}

export default function Home() {
  const router = useRouter();

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="brand-mark" aria-hidden="true">CS</div>
        <p className="eyebrow">Cyber safety for everyday life</p>
        <h1>Pause. Check. Stay safe.</h1>
        <p className="hero-copy">CyberSafe gives you clear next steps when something online does not feel right.</p>
      </section>

      <section className="safety-banner" aria-label="Immediate safety guidance">
        <strong>Money moving right now?</strong>
        <span>Call your bank immediately. Do not share a PIN, password, or OTP.</span>
      </section>

      <section className="action-list" aria-label="Choose an action">
        {actions.map((action) => (
          <button className={`action-card action-${action.tone}`} key={action.title} onClick={() => router.push(action.route)} type="button">
            <span className="action-icon" aria-hidden="true">{action.icon}</span>
            <span className="action-content">
              <span className="action-title">{action.title}</span>
              <span className="action-text">{action.text}</span>
            </span>
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </section>

      <section className="tip-card">
        <p className="tip-label">Today’s safety tip</p>
        <p>Real banks will not ask you to share your one-time password by phone, SMS, or WhatsApp.</p>
      </section>

      <p className="disclaimer">CyberSafe is for awareness and guidance, not emergency protection. Use a safe, private device where possible.</p>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button className={`nav-button ${item.route === "/" ? "active" : ""}`} key={item.label} onClick={() => router.push(item.route)} type="button">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <NavIcon icon={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        * { box-sizing: border-box; }
        .home-page { min-height: 100vh; max-width: 500px; margin: 0 auto; padding: 0 15px 104px; background: #f5f7fa; color: #0e1b24; font-family: Arial, sans-serif; }
        .hero-section { margin: 0 -15px 22px; padding: 22px 20px 28px; border-bottom-right-radius: 20px; border-bottom-left-radius: 20px; background: #30c9e8; color: #fff; }
        .brand-mark { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: 22px; border-radius: 13px; background: rgba(255,255,255,.2); color: #fff; font-weight: 800; letter-spacing: -1px; }
        .eyebrow, .tip-label { margin: 0 0 8px; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        h1 { margin: 0; font-size: clamp(35px, 9vw, 48px); line-height: 1.03; letter-spacing: -1.8px; }
        .hero-copy { max-width: 425px; margin: 16px 0 0; color: #fff; font-size: 17px; line-height: 1.5; }
        .safety-banner { display: grid; gap: 5px; margin-bottom: 18px; padding: 15px 16px; border: 1px solid #f3c0c0; border-left: 4px solid #d92d20; border-radius: 14px; background: #fdecec; color: #b42318; font-size: 14px; line-height: 1.4; }
        .action-list { display: grid; gap: 12px; }
        .action-card { display: flex; align-items: center; width: 100%; min-height: 104px; padding: 17px; border: 1px solid #dbe3e9; border-radius: 14px; background: #fff; color: inherit; cursor: pointer; text-align: left; transition: transform .15s, box-shadow .15s; }
        .action-card:hover, .action-card:focus-visible { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 36, 45, .11); }
        .action-card:focus-visible { outline: 3px solid #55cce5; outline-offset: 2px; }
        .action-icon { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; margin-right: 14px; border-radius: 12px; background: #e7f8fb; color: #30aeca; font-size: 22px; font-weight: 800; }
        .action-urgent { border-color: #f3c0c0; } .action-urgent .action-icon { background: #fdecec; color: #d92d20; } .action-primary { border-color: #a7e6f2; background: #fff; }
        .action-content { display: grid; gap: 4px; flex: 1; } .action-title { font-size: 17px; font-weight: 800; } .action-text { color: #5b6b75; font-size: 14px; line-height: 1.35; } .arrow { color: #30c9e8; font-size: 23px; }
        .tip-card { margin-top: 24px; padding: 18px; border: 1px solid #dbe3e9; border-radius: 14px; background: #fff; color: #0e1b24; } .tip-card .tip-label { color: #30aeca; } .tip-card p:last-child { margin: 0; font-size: 16px; line-height: 1.5; }
        .disclaimer { margin: 22px 5px 0; color: #8a99a3; font-size: 12px; line-height: 1.5; text-align: center; }
        .bottom-nav { position: fixed; z-index: 20; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-around; max-width: 500px; margin: 0 auto; padding: 12px 0 calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #ddd; background: #fff; }
        .nav-button { display: flex; flex: 1; flex-direction: column; align-items: center; gap: 4px; border: 0; background: transparent; color: #666; cursor: pointer; font: inherit; font-size: 12px; font-weight: 600; }
        .nav-button svg { width: 20px; height: 20px; } .nav-button.active { color: #30c9e8; } .nav-button:focus-visible { outline: 3px solid #55cce5; outline-offset: -2px; }
      `}</style>
    </main>
  );
}
