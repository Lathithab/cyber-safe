"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
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

  return (
    <main className="settings-dashboard">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/settings" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
        </nav>
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Profile Settings</h1></div>
            <p>Configure privacy permissions, emergency SMS notification preferences, and platform accessibility tools.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={22} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
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
        .settings-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .side-divider { height: 1px; margin: 8px 4px; background: #e2e9f2; } .footer-links { display: grid; gap: 3px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 10px; padding: 9px 17px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: 18px; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; } .user-chip { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 12px; padding: 8px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-weight: 800; font-size: 13px; } .user-chip strong { display: block; font-size: 13px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } h1, h2, strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(32px, 3.4vw, 44px); letter-spacing: -2px; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 10px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 15px; } .help-button { border: 0; border-radius: 14px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .content-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr); gap: 26px; margin-top: 28px; align-items: start; }
        .main-col, .side-col { display: grid; gap: 22px; }
        .settings-card { padding: 28px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .settings-card h2 { margin: 0 0 18px; font-size: 20px; }
        .row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 0; border-top: 1px solid #eef2f7; } .row:first-of-type { border-top: 0; padding-top: 0; } .row strong { display: block; font-size: 15px; font-weight: 700; } .row small { display: block; margin-top: 5px; color: #8996a8; font-size: 13px; line-height: 1.4; max-width: 380px; }
        .modify { flex: 0 0 auto; padding: 10px 18px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; }
        .value-pill { padding: 6px 13px; border-radius: 999px; background: #e0f8fc; color: #20b6d8; font-size: 13px; font-weight: 800; }
        .toggle { position: relative; flex: 0 0 auto; width: 50px; height: 28px; } .toggle input { position: absolute; opacity: 0; } .toggle i { position: absolute; inset: 0; border-radius: 999px; background: #cfd8e3; transition: background .15s; } .toggle i::after { content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: transform .15s; } .toggle input:checked + i { background: #31c7e6; } .toggle input:checked + i::after { transform: translateX(22px); }

        .popia-card { padding: 26px; border-radius: 18px; background: #e5f9fd; } .popia-card h2 { margin: 0 0 12px; font-size: 18px; } .popia-card p { margin: 0 0 16px; color: #4a6572; font-size: 14px; line-height: 1.5; } .popia-link { border: 0; background: transparent; color: #0e7490; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; padding: 0; }

        @media (max-width: 1180px) { .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 850px) { .settings-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .side-divider, .footer-links, .emergency-card { display: none; } .dashboard-content { padding: 27px 18px 45px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 30px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .row { flex-direction: column; align-items: flex-start; gap: 10px; } .modify { align-self: flex-start; } }
      `}</style>
    </main>
  );
}
