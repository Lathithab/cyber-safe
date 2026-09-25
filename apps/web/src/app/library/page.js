"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const scams = [
  { id: "whatsapp", category: "WhatsApp", title: "WhatsApp verification-code scam", summary: "A scammer asks for the six-digit code sent to your phone, then takes over your WhatsApp account.", signs: ["They say the code was sent by mistake.", "They pressure you to send it quickly.", "The request comes from a known contact whose account may be compromised."], action: "Never share a WhatsApp verification code. Enable two-step verification and warn your contacts if you shared one." },
  { id: "bank", category: "Banking", title: "Fake bank SMS or phishing link", summary: "A message claims there is a payment, account block, or security problem and asks you to tap a link.", signs: ["The link is shortened or does not match your bank's official website.", "It asks for a PIN, password, card details, or OTP.", "It creates urgency around a surprising payment or threat."], action: "Do not use the link. Open your official banking app or call the number on the back of your card." },
  { id: "sim", category: "SIM swap", title: "SIM-swap fraud", summary: "Your number unexpectedly loses service while scammers try to receive banking one-time passwords.", signs: ["Your phone suddenly has no signal.", "You receive an unexpected SIM-swap notification.", "Your banking details change unexpectedly."], action: "Call your mobile network from another phone immediately, then contact your bank." },
  { id: "job", category: "Job scams", title: "Job offer that asks for a fee", summary: "A supposed recruiter offers work, then asks for payment for training, equipment, or placement.", signs: ["The salary is unusually high for little information.", "They ask for money before you start work.", "The sender uses a free email address rather than the company domain."], action: "Do not pay or share ID documents. Verify the vacancy on the employer's official website." },
  { id: "market", category: "Marketplace", title: "Fake proof-of-payment", summary: "A buyer sends a convincing payment confirmation and pressures you to release goods before funds clear.", signs: ["They insist on courier collection immediately.", "The payment email or screenshot looks unusual.", "Your banking app does not show cleared funds."], action: "Release goods only after cleared funds appear in your own banking app." },
  { id: "otp", category: "Banking", title: "One-time password (OTP) request", summary: "Someone claiming to be from your bank asks for the code sent to your phone to approve or stop a transaction.", signs: ["They ask for an OTP, PIN, or banking-app approval.", "They create panic about fraud or a blocked account.", "They ask you to read the code aloud or enter it on a link."], action: "Your bank will not ask you to disclose an OTP. End the call, then contact the bank using its official number." },
  { id: "delivery", category: "Phishing", title: "Fake parcel or delivery notification", summary: "A text or email says a parcel is delayed and asks you to pay a small fee or confirm delivery details.", signs: ["You were not expecting a parcel.", "The link does not match the courier's official website.", "A small payment is requested to collect card details."], action: "Do not open the link. Track parcels only through the courier's official app or website." },
  { id: "sars", category: "Phishing", title: "Fake SARS refund or tax notice", summary: "A message claims you are due a tax refund or owe money and directs you to a website or attachment.", signs: ["The message uses a strange email address or shortened link.", "It asks for banking credentials or an upfront payment.", "The language is urgent or contains unusual errors."], action: "Do not use the message link. Sign in through the official SARS eFiling service or contact SARS directly." },
  { id: "remote", category: "Tech support", title: "Remote-access or tech-support scam", summary: "A caller says your phone or computer has a virus and asks you to install an app so they can fix it.", signs: ["The contact was unexpected.", "They ask you to install remote-control software.", "They request banking details, passwords, or a payment to clean your device."], action: "Hang up and uninstall any remote-access app you installed. Change passwords from a safe device and contact your bank if details were shared." },
  { id: "loan", category: "Financial scams", title: "Advance-fee loan scam", summary: "A lender promises an easy loan but asks for an administration, insurance, or release fee before paying out.", signs: ["Approval is guaranteed with no affordability checks.", "You must pay before receiving the loan.", "The lender cannot be verified through official channels."], action: "Do not pay a fee or share banking credentials. Verify financial service providers before applying." },
  { id: "charity", category: "Impersonation", title: "Charity or disaster-relief impersonation", summary: "Fraudsters use a real charity's name after an emergency and ask for donations through personal accounts or links.", signs: ["The request is sent by an unfamiliar account.", "They insist on payment to a personal number or wallet.", "The campaign cannot be found on the charity's official channels."], action: "Donate only through a verified charity website or established official account." },
  { id: "boss", category: "Impersonation", title: "Boss or family emergency impersonation", summary: "A scammer pretends to be your manager or a relative on a new number and asks for urgent money or vouchers.", signs: ["They say their phone is broken or they cannot talk.", "They demand secrecy and urgency.", "The request is out of character or asks for gift cards."], action: "Verify through a known phone number or in person before taking any action. Do not share vouchers or transfer funds." },
];

const categories = ["All", ...new Set(scams.map((item) => item.category))];

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  if (name === "shield") return <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none"><path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" /><ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" fill="currentColor" stroke="none" /></svg>;
  if (name === "home") return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "book") return <svg {...shared}><path d="M4 19a2 2 0 0 1 2-2h14" /><path d="M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>;
  if (name === "alert") return <svg {...shared}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "chat") return <svg {...shared}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.6-4.3A8.4 8.4 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

function Sidebar({ router }) {
  const links = DASHBOARD_NAV;
  return <aside className="sidebar"><button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={22} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button><nav className="side-nav" aria-label="Dashboard navigation">{links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/library" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}</nav><button className="emergency-card" type="button" onClick={() => router.push("/help")}><Icon name="phone" size={18} /><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button></aside>;
}

export default function ScamLibraryPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = DASHBOARD_NAV.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = DASHBOARD_NAV.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const results = useMemo(() => scams.filter((scam) => {
    const searchable = `${scam.title} ${scam.summary} ${scam.signs.join(" ")}`.toLowerCase();
    return (category === "All" || scam.category === category) && (!query.trim() || searchable.includes(query.trim().toLowerCase()));
  }), [query, category]);

  return <main className="library-dashboard">
    <header className="mobile-topbar">
      <button className="mobile-topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" size={21} /></button>
      <button className="mobile-topbar-brand" type="button" onClick={() => router.push("/feed")}><span className="mobile-topbar-icon"><Icon name="shield" size={18} /></span><strong>CyberSafe</strong></button>
      <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/notification")} aria-label="Notifications"><DashboardNavIcon name="bell" size={21} /></button>
    </header>
    <Sidebar router={router} />
    <nav className="bottom-nav" aria-label="Primary navigation">
      {primaryNav.map(([label, route, icon]) => (
        <button key={label} type="button" className={`bottom-nav-item ${route === "/library" ? "active" : ""}`} onClick={() => router.push(route)}>
          <DashboardNavIcon name={icon} size={21} />
          <span>{label.replace("Community ", "").replace(" Security", "").replace(" Incident", "").replace(" AI", "")}</span>
        </button>
      ))}
    </nav>
    {menuOpen && (
      <div className="nav-menu-overlay" onClick={() => setMenuOpen(false)}>
        <div className="nav-menu-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="nav-menu-header"><strong>More</strong><button type="button" className="nav-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={18} /></button></div>
          <div className="nav-menu-grid">
            {menuNav.map(([label, route, icon]) => (
              <button key={label} type="button" className="nav-menu-item" onClick={() => { setMenuOpen(false); router.push(route); }}>
                <span className="nav-menu-icon"><DashboardNavIcon name={icon} size={20} /></span>{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    <section className="library-content">
    <header className="library-header"><div><p className="eyebrow">CyberSafe reference centre</p><h1>Scam Library</h1><p>Recognise common South African scams, understand the warning signs, and take the right next step.</p></div><button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button></header>
    <section className="safety-banner"><span><Icon name="phone" size={22} /></span><div><strong>Are you being scammed right now?</strong><p>Stop responding, do not send money or codes, and call your bank immediately if account details may be at risk.</p></div><button type="button" onClick={() => router.push("/help")}>Open helpline hub</button></section>
    <section className="library-tools"><label className="search"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a scam, message or warning sign..." aria-label="Search scam library" /></label><div className="categories">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div></section>
    <div className="result-row"><span>{results.length} {results.length === 1 ? "scam guide" : "scam guides"}</span><span>Choose a guide to see what to do</span></div>
    <section className="scam-list">{results.map((scam) => { const open = selected === scam.id; return <article className="scam-card" key={scam.id}><button className="scam-title" type="button" aria-expanded={open} onClick={() => setSelected(open ? null : scam.id)}><span><small>{scam.category}</small><strong>{scam.title}</strong></span><b>{open ? "−" : "+"}</b></button><p>{scam.summary}</p>{open && <div className="scam-detail"><div><h2>Warning signs</h2><ul>{scam.signs.map((sign) => <li key={sign}>{sign}</li>)}</ul></div><div><h2>What to do</h2><p>{scam.action}</p></div></div>}</article>; })}</section>
    {!results.length && <p className="empty">No scam guide matches that search. Try a broader term or use the Helpline Hub for urgent support.</p>}
  </section><style>{`
    * { box-sizing: border-box; } .library-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #00243A; border-bottom: 2px solid #EB630F; }
        .mobile-topbar-menu, .mobile-topbar-bell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #fff; cursor: pointer; }
        .mobile-topbar-brand { display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: #fff; cursor: pointer; font: inherit; padding: 0; }
        .mobile-topbar-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(235,99,15,.22); color: #EB630F; }
        .mobile-topbar-brand strong { font-size: 15px; letter-spacing: -0.3px; }
        .bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; background: #00243A; border-top: 2px solid #EB630F; padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -4px 16px rgba(0,0,0,.25); }
        .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 2px; border: 0; background: transparent; color: rgba(255,255,255,.6); cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }
        .bottom-nav-item.active { color: #EB630F; }
        .bottom-nav-item span { white-space: nowrap; }
        .nav-menu-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-end; background: rgba(0,36,58,.4); }
        .nav-menu-sheet { width: 100%; max-height: 70vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px)); }
        .nav-menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .nav-menu-header strong { font-size: 15px; }
        .nav-menu-close { border: 0; background: #f1f4f9; color: #536179; border-radius: 999px; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }
        .nav-menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .nav-menu-item { display: flex; align-items: center; gap: 10px; padding: 13px 12px; border: 1px solid #eef2f7; border-radius: 10px; background: #f8fafc; color: #26324a; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; }
        .nav-menu-icon { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border-radius: 8px; background: #FDEAE0; color: #EB630F; }
                .library-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); padding-bottom: 78px; }
         .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #e2e9f2; background: #00243A; overflow: hidden; } .sidebar { display: none; }
        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .library-dashboard { grid-template-columns: 230px minmax(0, 1fr); } .side-link { font-size: 12px; padding: 10px 12px; gap: 10px; } .brand strong { font-size: 16px; } .brand small { font-size: 11px; }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .library-content { padding-top: 24px; padding-bottom: 36px; }
        }
 .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 9px; background: rgba(235,99,15,.22); color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; line-height: 1; letter-spacing: -0.55px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; } .side-nav { display: grid; gap: 7px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 14px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.68); cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; } .side-link.active svg { color: #EB630F; } .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: auto; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; }
    .library-content { min-width: 0; padding: 30px 34px 45px; } .library-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .eyebrow { margin: 0 0 7px; color: #C24F0C; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } h1, h2, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; line-height: 1; } .library-header p:last-child { max-width: 780px; margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; } .help-button { min-height: 50px; padding: 0 23px; border: 0; border-radius: 8px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; white-space: nowrap; }
    .safety-banner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; margin-top: 28px; padding: 18px 21px; border: 1px solid #ffc1c3; border-left: 5px solid #ff5a5f; border-radius: 11px; background: #fff4f4; } .safety-banner > span { display: grid; place-items: center; width: 39px; height: 39px; border-radius: 50%; background: #fff; color: #ff5158; } .safety-banner strong { font-size: 14px; } .safety-banner p { margin: 5px 0 0; color: #65738a; font-size: 11px; line-height: 1.4; } .safety-banner button { padding: 9px 12px; border: 0; border-radius: 7px; background: #ff5158; color: #fff; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; white-space: nowrap; }
    .library-tools { display: grid; grid-template-columns: minmax(280px, .8fr) 1.2fr; gap: 19px; margin-top: 30px; } .search { display: flex; align-items: center; gap: 9px; padding: 0 17px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #536179; } .search input { width: 100%; height: 54px; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 12px; } .categories { display: flex; align-items: center; gap: 7px; overflow-x: auto; } .categories button { flex: 0 0 auto; padding: 9px 11px; border: 1px solid #dce5ef; border-radius: 7px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; } .categories button.selected { border-color: #EB630F; background: #FDEAE0; color: #C24F0C; }
    .result-row { display: flex; justify-content: space-between; gap: 12px; margin: 19px 2px 10px; color: #66758b; font-size: 11px; } .result-row span:first-child { color: #26324a; font-weight: 800; } .scam-list { display: grid; gap: 10px; } .scam-card { padding: 18px 20px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; } .scam-title { display: flex; align-items: flex-start; justify-content: space-between; width: 100%; padding: 0; border: 0; background: transparent; color: #00243A; cursor: pointer; text-align: left; } .scam-title small, .scam-title strong { display: block; } .scam-title small { margin-bottom: 6px; color: #C24F0C; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; } .scam-title strong { font-size: 16px; } .scam-title b { color: #EB630F; font-size: 21px; line-height: .8; } .scam-card > p { max-width: 850px; margin: 8px 0 0; color: #65738a; font-size: 12px; line-height: 1.45; } .scam-detail { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e6edf3; } .scam-detail h2 { margin: 0 0 9px; font-size: 12px; } .scam-detail ul { display: grid; gap: 6px; margin: 0; padding-left: 19px; color: #65738a; font-size: 11px; line-height: 1.4; } .scam-detail p { margin: 0; color: #293950; font-size: 11px; font-weight: 600; line-height: 1.45; } .empty { margin: 28px 0; color: #65738a; text-align: center; }
    @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .library-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } .library-tools { grid-template-columns: 1fr; gap: 12px; } } @media (max-width: 850px) { .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-link svg { width: 16px; height: 16px; }  .sidebar { padding: 11px 8px; } .brand { margin-bottom: 16px; justify-content: center; } .brand strong { font-size: 18px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 19px; }  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .library-content { padding: 22px 14px 36px; } } @media (max-width: 600px) { .library-content { padding: 18px 11px 28px; } h1 { font-size: 27px; } .library-header { flex-direction: column; } .safety-banner { grid-template-columns: auto 1fr; padding: 15px; } .safety-banner button { grid-column: 1 / -1; } .scam-card { padding: 15px 14px; } .scam-title strong { font-size: 14px; } .scam-detail { grid-template-columns: 1fr; gap: 14px; } .result-row { flex-direction: column; gap: 3px; } }
  
    @media (min-width: 851px) {
      .side-link { font-size: 12px !important; padding: 10px 12px !important; gap: 10px !important; min-width: 0; overflow: hidden; }
      .side-link span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; display: block; } .side-link svg { flex-shrink: 0; }
      .brand strong { font-size: 16px !important; }
      .brand small { font-size: 11px !important; }
    }
`}</style></main>;
}