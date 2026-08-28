"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "shieldcheck") return <svg {...shared}><path d="M12 21s7-3.5 7-9V5l-7-3-7 3v7c0 5.5 7 9 7 9z" /><path d="m9 12 2 2 4-4" /></svg>;
  if (name === "medal") return <svg {...shared}><circle cx="12" cy="9" r="6" /><path d="m8.5 14 -1.5 7 5-3 5 3-1.5-7" /></svg>;
  if (name === "key") return <svg {...shared}><circle cx="8" cy="15" r="4" /><path d="m10.5 12.5 8-8M16 5l2 2M13 8l2 2" /></svg>;
  if (name === "users") return <svg {...shared}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="18" cy="9" r="2.8" /><path d="M15 20c.2-3 2-5 4.5-5.5" /></svg>;
  if (name === "heart") return <svg {...shared}><path d="M12 20s-7-4.4-9.5-9C1 7.5 3 4 6.5 4c2 0 3.5 1.2 5.5 3.5C14 5.2 15.5 4 17.5 4 21 4 23 7.5 21.5 11 19 15.6 12 20 12 20z" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

const BADGES = [
  { title: "Anti-Phishing Shield", icon: "shieldcheck", tone: "cyan", body: "Identified 5 consecutive bank billing scams successfully.", meta: "Unlocked 12 Feb 2026" },
  { title: "SAPS Threat Liaison", icon: "medal", tone: "amber", body: "Securely logged an active financial scam to the central unit.", meta: "Unlocked 04 Mar 2026" },
  { title: "Password Elite", icon: "key", tone: "cyan", body: "Secured all critical personal domains with approved 2FA keys.", meta: "Unlocked 18 Apr 2026" },
  { title: "Community Sentry", icon: "users", tone: "cyan", body: "Warned Orlando community of spoofed WhatsApp refund chains.", meta: "Unlocked 02 May 2026" },
  { title: "Youth Mentor Badge", icon: "heart", tone: "muted", body: "Host 3 school workshops using official platform assets.", meta: "In progress — 1 remaining" },
];

const TABS = ["Earned Badges", "My Posts", "Enrolled Courses", "Incident History"];

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState("Earned Badges");
  const links = [["Home Feed", "/", "home"], ["Community Feed", "/feed", "feed"], ["Learn Security", "/learn", "learn"], ["Scam Library", "/library", "library"], ["Report Incident", "/postReport", "report"], ["Get Help", "/help", "help"], ["CyberBot AI", "/cyberbot", "chat"], ["Explore / Nearby", "/explore", "explore"], ["Notifications", "/notifications", "bell"]];
  const secondaryLinks = [["User Profile", "/profile", "user"], ["Settings", "/settings", "gear"]];
  const footerLinks = [["Educator Hub", "/educator-hub", "grad"], ["Platform Admin", "/platform-admin", "lock"]];

  return (
    <main className="profile-dashboard">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/profile" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
          <div className="side-divider" />
          {secondaryLinks.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/profile" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
        </nav>
        <div className="footer-links">{footerLinks.map(([label, route, icon]) => <button key={label} className="footer-link" type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={18} />{label}</button>)}</div>
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button><button className="user-chip" type="button" onClick={() => router.push("/login")}><span className="chip-avatar">SN</span><span><strong>Sipho Ndlovu</strong><small>Gauteng Community</small></span></button>
      </aside>

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>My Security Profile</h1></div>
            <p>Manage your South African digital safety profile, track badges, and monitor community incident metrics.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={22} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

        <section className="profile-card">
          <div className="avatar" aria-hidden="true">SN</div>
          <div className="profile-info">
            <h2>Sipho Ndlovu</h2>
            <p>Community Safety Advocate · Gauteng East</p>
            <small>Johannesburg, SA · Joined Jan 2026</small>
          </div>
          <button type="button" className="edit-button" onClick={() => router.push("/settings")}>Edit Profile</button>
        </section>

        <div className="stat-grid">
          <div className="stat-card"><span>Security Badges</span><strong>4 / 6</strong><small>Elite Guard Level</small></div>
          <div className="stat-card"><span>Incident Reports</span><strong>3 Active</strong><small>2 SAPS Escalated</small></div>
          <div className="stat-card"><span>Safety Tips Shared</span><strong>18 Posts</strong><small>124 Helpful votes</small></div>
          <div className="stat-card"><span>Security Score</span><strong>920 XP</strong><small>Top 5% Gauteng</small></div>
        </div>

        <div className="tab-row" aria-label="Profile tabs">
          {TABS.map((item) => <button key={item} type="button" className={item === tab ? "selected" : ""} onClick={() => setTab(item)}>{item}</button>)}
        </div>

        {tab === "Earned Badges" && (
          <div className="badge-grid">
            {BADGES.map((badge) => (
              <article className={`badge-card tone-${badge.tone}`} key={badge.title}>
                <span className="badge-icon"><Icon name={badge.icon} size={24} /></span>
                <h3>{badge.title}</h3>
                <p>{badge.body}</p>
                <small>{badge.meta}</small>
              </article>
            ))}
          </div>
        )}
        {tab !== "Earned Badges" && <p className="empty-tab">Nothing to show here yet.</p>}
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .profile-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .side-divider { height: 1px; margin: 8px 4px; background: #e2e9f2; } .footer-links { display: grid; gap: 3px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 10px; padding: 9px 17px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: 18px; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; } .user-chip { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 12px; padding: 8px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-weight: 800; font-size: 13px; } .user-chip strong { display: block; font-size: 13px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } h1, h2, h3, strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(32px, 3.4vw, 44px); letter-spacing: -2px; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 10px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 15px; } .help-button { border: 0; border-radius: 14px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .profile-card { display: flex; align-items: center; gap: 22px; margin-top: 28px; padding: 30px; border: 1px solid #dce5ef; border-radius: 20px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .avatar { display: grid; place-items: center; width: 74px; height: 74px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-size: 24px; font-weight: 800; } .profile-info { flex: 1; min-width: 0; } .profile-info h2 { margin: 0; font-size: 24px; } .profile-info p { margin: 6px 0 0; color: #536179; font-size: 15px; } .profile-info small { color: #8996a8; font-size: 13px; } .edit-button { flex: 0 0 auto; padding: 13px 22px; border: 1px solid #dce5ef; border-radius: 13px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 15px; font-weight: 800; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 22px; } .stat-card { padding: 22px; border: 1px solid #dce5ef; border-radius: 16px; background: #fff; } .stat-card span { color: #65738a; font-size: 13px; font-weight: 700; } .stat-card strong { display: block; margin: 10px 0 6px; font-size: 26px; letter-spacing: -1px; } .stat-card small { color: #8996a8; font-size: 12px; }

        .tab-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 30px 0 20px; border-bottom: 1px solid #dce5ef; } .tab-row button { padding: 12px 6px; margin-right: 22px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 15px; font-weight: 700; } .tab-row button.selected { border-color: #31c7e6; color: #121a32; }

        .badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; } .badge-card { padding: 24px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .badge-icon { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: 16px; border-radius: 13px; } .tone-cyan .badge-icon { background: #e6faff; color: #20b6d8; } .tone-amber .badge-icon { background: #fff4e0; color: #f5a524; } .tone-muted { opacity: .55; } .tone-muted .badge-icon { background: #eef1f6; color: #8996a8; } .badge-card h3 { margin: 0 0 8px; font-size: 17px; } .badge-card p { margin: 0; color: #65738a; font-size: 14px; line-height: 1.4; } .badge-card small { display: block; margin-top: 14px; color: #20b6d8; font-weight: 700; font-size: 12px; } .tone-muted small { color: #8996a8; }
        .empty-tab { padding: 40px; text-align: center; color: #65738a; font-size: 14px; border: 1px dashed #dce5ef; border-radius: 16px; }

        @media (max-width: 1180px) { .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } .stat-grid { grid-template-columns: 1fr 1fr; } .badge-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 850px) { .profile-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .side-divider, .footer-links, .emergency-card { display: none; } .dashboard-content { padding: 27px 18px 45px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 30px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .profile-card { flex-direction: column; text-align: center; } .stat-grid, .badge-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

