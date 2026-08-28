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
  if (name === "warn") return <svg {...shared}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "doc") return <svg {...shared}><path d="M14 3v5h5" /><path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /></svg>;
  if (name === "medal") return <svg {...shared}><circle cx="12" cy="9" r="6" /><path d="m8.5 14 -1.5 7 5-3 5 3-1.5-7" /></svg>;
  if (name === "chat") return <svg {...shared}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.6-4.3A8.4 8.4 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" /></svg>;
  if (name === "chevron") return <svg {...shared}><path d="m9 6 6 6-6 6" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

const NOTIFICATIONS = [
  { id: 1, group: "Alerts", icon: "warn", tone: "danger", title: "CRITICAL WARNING: FNB OTP Scams Peak", time: "12 minutes ago", body: "Forensic units report a surge in automated OTP harvest lines calling Gauteng community members. Never share your 6-digit banking PIN.", unread: true },
  { id: 2, group: "Reports", icon: "doc", tone: "info", title: "Incident #CS-9028 Under Review", time: "2 hours ago", body: "Your submitted phishing claim has been successfully forwarded to the SAPS digital forensic division.", unread: true },
  { id: 3, group: "Learning", icon: "medal", tone: "success", title: "Security Badge Earned!", time: "Yesterday", body: "Congratulations! You completed \"Securing Your SA Banking Apps against OTP Scams\" module with 95% accuracy.", unread: true },
  { id: 4, group: "Community", icon: "chat", tone: "neutral", title: "Kgomotso Khumalo tagged you in Soweto", time: "2 days ago", body: "Kgomotso tagged you in a response warning local students of malicious internet café WiFi networks.", unread: false },
  { id: 5, group: "Alerts", icon: "warn", tone: "danger", title: "Capitec Security Advisory", time: "3 days ago", body: "Cape Town regional threat systems detected active spoofed SMS relays claiming random R250 rewards.", unread: false },
];

const TABS = ["All", "Alerts", "Community", "Learning", "Reports"];

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Alerts");
  const [read, setRead] = useState({});
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({ alerts: true, reports: true, learning: true });
  const [draftPrefs, setDraftPrefs] = useState(prefs);
  const links = DASHBOARD_NAV;

  const prefKeyByGroup = { Alerts: "alerts", Reports: "reports", Learning: "learning" };
  const enabledNotifications = NOTIFICATIONS.filter((item) => {
    const key = prefKeyByGroup[item.group];
    return !key || prefs[key];
  });
  const visible = enabledNotifications.filter((item) => tab === "All" || item.group === tab);
  const unreadCount = enabledNotifications.filter((item) => item.unread && !read[item.id]).length;
  const counts = { All: enabledNotifications.length, Alerts: 0, Community: 0, Learning: 0, Reports: 0 };
  enabledNotifications.forEach((item) => { counts[item.group] += 1; });

  function openPreferences() {
    setDraftPrefs(prefs);
    setPrefsOpen(true);
  }

  function savePreferences() {
    setPrefs(draftPrefs);
    setPrefsOpen(false);
  }

  return (
    <main className="notif-dashboard">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/notification" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
        </nav>
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Notification Center</h1><span>{unreadCount} Unread Alerts</span></div>
            <p>View threat advisories, emergency escalation reports, and community support metrics.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={22} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

        <div className="tab-row">
          <div className="tabs" aria-label="Notification filters">
            {TABS.map((item) => <button key={item} type="button" className={item === tab ? "selected" : ""} onClick={() => setTab(item)}>{item}<span>{counts[item]}</span></button>)}
          </div>
          <button type="button" className="mark-read" onClick={() => setRead(Object.fromEntries(NOTIFICATIONS.map((item) => [item.id, true])))}>Mark all as read</button>
          <button type="button" className="configure" onClick={openPreferences}>Configure Preferences</button>
        </div>

        <div className="notif-list">
          {visible.map((item) => (
            <button key={item.id} type="button" className={`notif-card tone-${item.tone} ${item.unread && !read[item.id] ? "unread" : ""}`} onClick={() => setRead((current) => ({ ...current, [item.id]: true }))}>
              <span className={`notif-icon icon-${item.tone}`}><Icon name={item.icon} size={20} /></span>
              <span className="notif-body">
                <span className="notif-title-row"><strong>{item.title}</strong><small>{item.time}</small></span>
                <p>{item.body}</p>
              </span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
          {!visible.length && <p className="empty-state">No notifications in this category yet.</p>}
        </div>
      </section>

      {prefsOpen && (
        <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setPrefsOpen(false); }}>
          <div className="modal-card">
            <h3>Notification Preferences</h3>
            <p className="modal-sub">Choose which categories you&apos;d like to be notified about.</p>

            <label className="pref-row">
              <input type="checkbox" checked={draftPrefs.alerts} onChange={(event) => setDraftPrefs((current) => ({ ...current, alerts: event.target.checked }))} />
              <span>Threat Alerts<small>Admin-issued warnings and advisories</small></span>
            </label>
            <label className="pref-row">
              <input type="checkbox" checked={draftPrefs.reports} onChange={(event) => setDraftPrefs((current) => ({ ...current, reports: event.target.checked }))} />
              <span>Report Feedback<small>Updates on incidents you&apos;ve filed</small></span>
            </label>
            <label className="pref-row">
              <input type="checkbox" checked={draftPrefs.learning} onChange={(event) => setDraftPrefs((current) => ({ ...current, learning: event.target.checked }))} />
              <span>Learning Updates<small>Badges earned and course progress</small></span>
            </label>

            <div className="modal-actions">
              <button type="button" className="modal-btn-secondary" onClick={() => setPrefsOpen(false)}>Cancel</button>
              <button type="button" className="modal-btn-primary" onClick={savePreferences}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        .notif-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .side-divider { height: 1px; margin: 8px 4px; background: #e2e9f2; } .footer-links { display: grid; gap: 3px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 10px; padding: 9px 17px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: 18px; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; } .user-chip { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 12px; padding: 8px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-weight: 800; font-size: 13px; } .user-chip strong { display: block; font-size: 13px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } .title-row { display: flex; align-items: center; gap: 12px; } h1, strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(32px, 3.4vw, 44px); letter-spacing: -2px; } .title-row span { padding: 7px 14px; border-radius: 999px; background: #e0f8fc; color: #2fc4e4; font-size: 13px; font-weight: 800; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 10px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 15px; } .help-button { border: 0; border-radius: 14px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .tab-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 26px; flex-wrap: wrap; } .tabs { display: flex; flex-wrap: wrap; gap: 8px; } .tabs button { display: flex; align-items: center; gap: 8px; padding: 10px 15px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; } .tabs button span { padding: 2px 7px; border-radius: 999px; background: #eef2f7; color: #536179; font-size: 11px; } .tabs button.selected { border-color: #121a32; background: #121a32; color: #fff; } .tabs button.selected span { background: #31c7e6; color: #06263a; } .mark-read, .configure { border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; } .mark-read { color: #20b6d8; } .configure { color: #8996a8; margin-left: 16px; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal-card { background: #fff; border-radius: 18px; padding: 26px; width: 100%; max-width: 380px; box-shadow: 0 20px 50px rgba(0,0,0,.2); }
        .modal-card h3 { margin: 0 0 4px; font-size: 18px; } .modal-sub { margin: 0 0 18px; color: #65738a; font-size: 13px; }
        .pref-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-top: 1px solid #eef2f7; cursor: pointer; } .pref-row:first-of-type { border-top: none; }
        .pref-row input { margin-top: 3px; width: 16px; height: 16px; accent-color: #31c7e6; flex-shrink: 0; }
        .pref-row span { font-size: 14px; font-weight: 700; color: #26324a; display: flex; flex-direction: column; gap: 3px; }
        .pref-row small { font-size: 12px; font-weight: 400; color: #8996a8; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .modal-btn-secondary { border: 1px solid #dce5ef; background: #fff; color: #536179; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-family: inherit; }
        .modal-btn-primary { border: 0; background: #31c7e6; color: #102039; font-size: 13px; font-weight: 800; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-family: inherit; }

        .notif-list { display: grid; gap: 14px; margin-top: 22px; } .notif-card { display: flex; align-items: flex-start; gap: 16px; width: 100%; padding: 22px; border: 1px solid #dce5ef; border-radius: 16px; background: #fff; cursor: pointer; font: inherit; text-align: left; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .notif-card.unread { border-color: #31c7e6; } .notif-icon { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border-radius: 13px; } .icon-danger { background: #fdecec; color: #d92d20; } .icon-info { background: #e6faff; color: #20b6d8; } .icon-success { background: #e7f9f0; color: #16bf89; } .icon-neutral { background: #f1f0fb; color: #6a63d8; } .notif-body { flex: 1; min-width: 0; } .notif-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; } .notif-title-row strong { font-size: 16px; } .notif-title-row small { flex: 0 0 auto; color: #8996a8; font-size: 12px; } .notif-body p { margin: 8px 0 0; color: #65738a; font-size: 14px; line-height: 1.45; } .notif-card svg:last-child { flex: 0 0 auto; margin-top: 10px; color: #c2cbd8; } .empty-state { padding: 30px; text-align: center; color: #65738a; font-size: 14px; }

        @media (max-width: 1180px) { .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } }
        @media (max-width: 850px) { .notif-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .side-divider, .footer-links, .emergency-card { display: none; } .dashboard-content { padding: 27px 18px 45px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 30px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .tab-row { flex-direction: column; align-items: flex-start; } .notif-card { flex-direction: column; } .notif-card svg:last-child { display: none; } }
      `}</style>
    </main>
  );
}
