"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  if (name === "shield") return <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none"><path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" /><ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" fill="currentColor" stroke="none" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <i />
    </label>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [twoFA, setTwoFA] = useState(true);
  const [smsAdvisories, setSmsAdvisories] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const links = DASHBOARD_NAV;
  const [menuOpen, setMenuOpen] = useState(false);
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = links.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = links.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));


  return (
    <main className="settings-dashboard">
            <header className="mobile-topbar">
        <button className="mobile-topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={21} />
        </button>
        <button className="mobile-topbar-brand" type="button" onClick={() => router.push("/feed")}>
          <span className="mobile-topbar-icon"><Icon name="shield" size={18} /></span>
          <strong>CyberSafe</strong>
        </button>
        <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/notification")} aria-label="Notifications">
          <DashboardNavIcon name="bell" size={21} />
        </button>
      </header>

<aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={22} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/settings" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}
        </nav>
        <LogoutButton />
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={18} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {primaryNav.map(([label, route, icon]) => (
          <button key={label} type="button" className={`bottom-nav-item ${route === "/settings" ? "active" : ""}`} onClick={() => router.push(route)}>
            <DashboardNavIcon name={icon} size={21} />
            <span>{label.replace("Community ", "").replace(" Security", "").replace(" Incident", "").replace(" AI", "")}</span>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div className="nav-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-menu-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="nav-menu-header">
              <strong>More</strong>
              <button type="button" className="nav-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={18} /></button>
            </div>
            <div className="nav-menu-grid">
              {menuNav.map(([label, route, icon]) => (
                <button key={label} type="button" className="nav-menu-item" onClick={() => { setMenuOpen(false); router.push(route); }}>
                  <span className="nav-menu-icon"><DashboardNavIcon name={icon} size={20} /></span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Profile Settings</h1></div>
            <p>Configure privacy permissions, emergency SMS notification preferences, and platform accessibility tools.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={18} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

        <div className="content-grid">
          <div className="main-col">
            <section className="settings-card">
              <h2>Account Settings</h2>
              <div className="row"><div><strong>Email Address</strong><small>sipho.ndlovu@gmail.com</small></div><button type="button" className="modify">Modify</button></div>
              <div className="row"><div><strong>Security Password</strong><small>Last updated 4 months ago</small></div><button type="button" className="modify">Modify</button></div>
              <div className="row"><div><strong>Two-Factor Authentication (2FA)</strong><small>Secure verification using an authenticator app.</small></div><Toggle checked={twoFA} onChange={() => setTwoFA((v) => !v)} label="Two-factor authentication" /></div>
            </section>

            <section className="settings-card">
              <h2>Threat Notification Settings</h2>
              <div className="row"><div><strong>SMS Scam Advisories</strong><small>Direct, region-locked SMS warnings from the SAPS alliance.</small></div><Toggle checked={smsAdvisories} onChange={() => setSmsAdvisories((v) => !v)} label="SMS scam advisories" /></div>
              <div className="row"><div><strong>Email Learning Reminders</strong><small>Get updates when new Academy badges are available.</small></div><Toggle checked={emailReminders} onChange={() => setEmailReminders((v) => !v)} label="Email learning reminders" /></div>
              <div className="row"><div><strong>Push Incident Alerts</strong><small>Instant system updates about local outages or billing fraud.</small></div><Toggle checked={pushAlerts} onChange={() => setPushAlerts((v) => !v)} label="Push incident alerts" /></div>
            </section>

            <section className="settings-card">
              <h2>Language &amp; Translation Preferences</h2>
              <div className="row"><div><strong>Primary Language Selection</strong><small>Choose active dialect: English, Afrikaans, Zulu, Xhosa, Sotho.</small></div><button type="button" className="modify">Modify</button></div>
            </section>
          </div>

          <aside className="side-col">
            <section className="settings-card">
              <h2>Accessibility Settings</h2>
              <div className="row"><div><strong>Text Scaling Size</strong></div><span className="value-pill">Standard (100%)</span></div>
              <div className="row"><div><strong>High Contrast Mode</strong></div><Toggle checked={highContrast} onChange={() => setHighContrast((v) => !v)} label="High contrast mode" /></div>
              <div className="row"><div><strong>Screen Reader Support</strong></div><Toggle checked={screenReader} onChange={() => setScreenReader((v) => !v)} label="Screen reader support" /></div>
            </section>

            <section className="popia-card">
              <h2>POPIA Compliance Hub</h2>
              <p>Under South Africa's Protection of Personal Information Act, you maintain full control of your threat reports and user logs. Request data deletion instantly at any time.</p>
              <button type="button" className="popia-link">Request POPIA Data Extract →</button>
            </section>
          </aside>
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .settings-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

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

                .dashboard-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); padding-bottom: 78px; }

                .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #e2e9f2; background: #00243A; overflow: hidden; } .sidebar { display: none; }
        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .settings-dashboard { grid-template-columns: 230px minmax(0, 1fr); } .side-link { font-size: 12px; padding: 10px 12px; gap: 10px; } .brand strong { font-size: 16px; } .brand small { font-size: 11px; }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .dashboard-content { padding-top: 24px; padding-bottom: 36px; }
        }

        .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 9px; background: rgba(235,99,15,.22); color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; letter-spacing: -0.55px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; }
        .side-nav { display: grid; gap: 7px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 14px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.68); cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; } .side-link.active svg { color: #EB630F; }
        .side-divider { height: 1px; margin: 6px 3px; background: #e2e9f2; } .footer-links { display: grid; gap: 2px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 8px; padding: 7px 14px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: 18px; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; } .user-chip { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 12px; padding: 6px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 27px; height: 27px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; font-size: 11px; } .user-chip strong { display: block; font-size: 11px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 30px 34px 45px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } h1, h2, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; } .page-intro p { max-width: 720px; margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 11px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 8px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 12px; } .help-button { border: 0; border-radius: 8px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .content-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr); gap: 21px; margin-top: 28px; align-items: start; }
        .main-col, .side-col { display: grid; gap: 18px; }
        .settings-card { padding: 22px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .settings-card h2 { margin: 0 0 18px; font-size: 16px; }
        .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 0; border-top: 1px solid #eef2f7; } .row:first-of-type { border-top: 0; padding-top: 0; } .row strong { display: block; font-size: 12px; font-weight: 700; } .row small { display: block; margin-top: 5px; color: #8996a8; font-size: 11px; line-height: 1.4; max-width: 380px; }
        .modify { flex: 0 0 auto; padding: 8px 14px; border: 1px solid #dce5ef; border-radius: 7px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; }
        .value-pill { padding: 5px 10px; border-radius: 999px; background: #FCE0D0; color: #C24F0C; font-size: 11px; font-weight: 800; }
        .toggle { position: relative; flex: 0 0 auto; width: 39px; height: 22px; } .toggle input { position: absolute; opacity: 0; } .toggle i { position: absolute; inset: 0; border-radius: 999px; background: #cfd8e3; transition: background .15s; } .toggle i::after { content: ""; position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #fff; transition: transform .15s; } .toggle input:checked + i { background: #EB630F; } .toggle input:checked + i::after { transform: translateX(22px); }

        .popia-card { padding: 21px; border-radius: 11px; background: #FDEAE0; } .popia-card h2 { margin: 0 0 12px; font-size: 14px; } .popia-card p { margin: 0 0 16px; color: #4a6572; font-size: 11px; line-height: 1.5; } .popia-link { border: 0; background: transparent; color: #C24F0C; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; padding: 0; }

        @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .dashboard-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 850px) {   .sidebar { padding: 11px 8px; } .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 16px; height: 16px; } .side-divider, .footer-links,  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .dashboard-content { padding: 22px 14px 36px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 18px 11px 28px; } h1 { font-size: 23px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .row { flex-direction: column; align-items: flex-start; gap: 8px; } .modify { align-self: flex-start; } }
    
    @media (min-width: 851px) {
      .side-link { font-size: 12px !important; padding: 10px 12px !important; gap: 10px !important; min-width: 0; overflow: hidden; }
      .side-link span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; display: block; } .side-link svg { flex-shrink: 0; }
      .brand strong { font-size: 16px !important; }
      .brand small { font-size: 11px !important; }
    }
  `}</style>
    </main>
  );
}
