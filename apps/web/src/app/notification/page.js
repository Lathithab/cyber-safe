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
  const [menuOpen, setMenuOpen] = useState(false);
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = links.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = links.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));


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
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/notification" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}
        </nav>
        <LogoutButton />
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={18} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {primaryNav.map(([label, route, icon]) => (
          <button key={label} type="button" className={`bottom-nav-item ${route === "/notification" ? "active" : ""}`} onClick={() => router.push(route)}>
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
            <div className="title-row"><h1>Notification Center</h1><span>{unreadCount} Unread Alerts</span></div>
            <p>View threat advisories, emergency escalation reports, and community support metrics.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={18} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
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
              <span className={`notif-icon icon-${item.tone}`}><Icon name={item.icon} size={16} /></span>
              <span className="notif-body">
                <span className="notif-title-row"><strong>{item.title}</strong><small>{item.time}</small></span>
                <p>{item.body}</p>
              </span>
              <Icon name="chevron" size={14} />
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
        .notif-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

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

        .sidebar { display: none; }
        .dashboard-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); padding-bottom: 78px; }

        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .notif-dashboard { grid-template-columns: 230px minmax(0, 1fr); } .side-link { font-size: 12px; padding: 10px 12px; gap: 10px; } .brand strong { font-size: 16px; } .brand small { font-size: 11px; }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .dashboard-content { padding-top: 24px; padding-bottom: 36px; }
        }
        .sidebar { position: sticky; top: 0; height: 100vh; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #e2e9f2; background: #00243A; }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 9px; background: rgba(235,99,15,.22); color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; letter-spacing: -0.55px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; }
        .side-nav { display: grid; gap: 7px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 14px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.68); cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; } .side-link.active svg { color: #EB630F; }
        .side-divider { height: 1px; margin: 6px 3px; background: #e2e9f2; } .footer-links { display: grid; gap: 2px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 8px; padding: 7px 14px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: 18px; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; } .user-chip { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 12px; padding: 6px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 27px; height: 27px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; font-size: 11px; } .user-chip strong { display: block; font-size: 11px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 30px 34px 45px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } .title-row { display: flex; align-items: center; gap: 10px; } h1, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; } .title-row span { padding: 6px 11px; border-radius: 999px; background: #FCE0D0; color: #C24F0C; font-size: 11px; font-weight: 800; } .page-intro p { max-width: 720px; margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 11px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 8px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 12px; } .help-button { border: 0; border-radius: 8px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .tab-row { display: flex; align-items: center; justify-content: space-between; gap: 13px; margin-top: 26px; flex-wrap: wrap; } .tabs { display: flex; flex-wrap: wrap; gap: 6px; } .tabs button { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid #dce5ef; border-radius: 7px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; } .tabs button span { padding: 2px 6px; border-radius: 999px; background: #eef2f7; color: #536179; font-size: 11px; } .tabs button.selected { border-color: #00243A; background: #00243A; color: #fff; } .tabs button.selected span { background: #EB630F; color: #00243A; } .mark-read, .configure { border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; } .mark-read { color: #C24F0C; } .configure { color: #8996a8; margin-left: 16px; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
        .modal-card { background: #fff; border-radius: 11px; padding: 21px; width: 100%; max-width: 380px; box-shadow: 0 20px 50px rgba(0,0,0,.2); }
        .modal-card h3 { margin: 0 0 4px; font-size: 14px; } .modal-sub { margin: 0 0 18px; color: #65738a; font-size: 11px; }
        .pref-row { display: flex; align-items: flex-start; gap: 8px; padding: 10px 0; border-top: 1px solid #eef2f7; cursor: pointer; } .pref-row:first-of-type { border-top: none; }
        .pref-row input { margin-top: 3px; width: 16px; height: 16px; accent-color: #EB630F; flex-shrink: 0; }
        .pref-row span { font-size: 11px; font-weight: 700; color: #26324a; display: flex; flex-direction: column; gap: 2px; }
        .pref-row small { font-size: 11px; font-weight: 400; color: #8996a8; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
        .modal-btn-secondary { border: 1px solid #dce5ef; background: #fff; color: #536179; font-size: 11px; font-weight: 700; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-family: inherit; }
        .modal-btn-primary { border: 0; background: #EB630F; color: #00243A; font-size: 11px; font-weight: 800; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-family: inherit; }

        .notif-list { display: grid; gap: 11px; margin-top: 22px; } .notif-card { display: flex; align-items: flex-start; gap: 13px; width: 100%; padding: 18px; border: 1px solid #dce5ef; border-radius: 10px; background: #fff; cursor: pointer; font: inherit; text-align: left; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .notif-card.unread { border-color: #EB630F; } .notif-icon { display: grid; place-items: center; width: 33px; height: 33px; flex: 0 0 auto; border-radius: 8px; } .icon-danger { background: #fdecec; color: #d92d20; } .icon-info { background: #FDEAE0; color: #C24F0C; } .icon-success { background: #e7f9f0; color: #16bf89; } .icon-neutral { background: #f1f0fb; color: #6a63d8; } .notif-body { flex: 1; min-width: 0; } .notif-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; } .notif-title-row strong { font-size: 12px; } .notif-title-row small { flex: 0 0 auto; color: #8996a8; font-size: 11px; } .notif-body p { margin: 6px 0 0; color: #65738a; font-size: 11px; line-height: 1.45; } .notif-card svg:last-child { flex: 0 0 auto; margin-top: 10px; color: #c2cbd8; } .empty-state { padding: 24px; text-align: center; color: #65738a; font-size: 11px; }

        @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .dashboard-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } }
        @media (max-width: 850px) {   .sidebar { padding: 11px 8px; } .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 16px; height: 16px; } .side-divider, .footer-links,  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .dashboard-content { padding: 22px 14px 36px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 18px 11px 28px; } h1 { font-size: 23px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .tab-row { flex-direction: column; align-items: flex-start; } .notif-card { flex-direction: column; } .notif-card svg:last-child { display: none; } }
    
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
