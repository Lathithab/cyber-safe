"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  if (name === "shield") return <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none"><path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" /><ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" fill="currentColor" stroke="none" /></svg>;
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
function getInitials(name, username) {
  return (name || username || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState("Earned Badges");
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const links = DASHBOARD_NAV;
  const [menuOpen, setMenuOpen] = useState(false);
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = links.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = links.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured || !supabase) {
        setErrorMessage("Supabase is not configured.");
        setIsLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, full_name, role, created_at")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Could not load profile:", error);
        setErrorMessage("We could not load your profile.");
      } else {
        setProfile(data);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);


  return (
    <main className="profile-dashboard">
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
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/profiles" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}
        </nav>
        <LogoutButton />
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {primaryNav.map(([label, route, icon]) => (
          <button key={label} type="button" className={`bottom-nav-item ${route === "/profiles" ? "active" : ""}`} onClick={() => router.push(route)}>
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
            <div className="title-row"><h1>My Security Profile</h1></div>
            <p>Manage your South African digital safety profile, track badges, and monitor community incident metrics.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={18} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

       {isLoading ? (
  <section className="profile-card">
    <div className="profile-info">
      <p>Loading your profile...</p>
    </div>
  </section>
) : errorMessage ? (
  <section className="profile-card">
    <div className="profile-info">
      <p>{errorMessage}</p>
    </div>
  </section>
) : profile ? (
  <section className="profile-card">
    <div className="avatar" aria-hidden="true">
      {getInitials(profile.full_name, profile.username)}
    </div>

    <div className="profile-info">
      <h2>{profile.full_name || profile.username}</h2>
      <p>@{profile.username} · {profile.role}</p>
      <small>
        {profile.email} · Joined{" "}
        {new Date(profile.created_at).toLocaleDateString("en-ZA", {
          month: "short",
          year: "numeric",
        })}
      </small>
    </div>

    <div className="profile-actions">
      <button
        type="button"
        className="edit-button"
        onClick={() => router.push("/settings")}
      >
        Edit Profile
      </button>
      <LogoutButton className="profile-logout-button" label="Logout" />
    </div>
  </section>
) : null}

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
                <span className="badge-icon"><Icon name={badge.icon} size={19} /></span>
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
        .profile-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #fff; border-bottom: 1px solid #e2e9f2; }
        .mobile-topbar-menu, .mobile-topbar-bell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #536179; cursor: pointer; }
        .mobile-topbar-brand { display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: #00243A; cursor: pointer; font: inherit; padding: 0; }
        .mobile-topbar-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: #FDEAE0; color: #EB630F; }
        .mobile-topbar-brand strong { font-size: 15px; letter-spacing: -0.3px; }

        .bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; background: #fff; border-top: 1px solid #e2e9f2; padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -4px 16px rgba(0,0,0,.05); }
        .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 2px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }
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

                .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #e2e9f2; background: #fff; } .sidebar { display: none; }
        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .profile-dashboard { grid-template-columns: 230px minmax(0, 1fr); }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .dashboard-content { padding-top: 24px; padding-bottom: 36px; }
        }

        .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #00243A; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 9px; background: #FDEAE0; color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; letter-spacing: -0.55px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; }
        .side-nav { display: grid; gap: 7px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 14px; border: 0; border-radius: 8px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link.active { background: #FDEAE0; color: #00243A; font-weight: 800; } .side-link.active svg { color: #EB630F; }
        .side-divider { height: 1px; margin: 6px 3px; background: #e2e9f2; } .footer-links { display: grid; gap: 2px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 8px; padding: 7px 14px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: 18px; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; } .user-chip { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 12px; padding: 6px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 27px; height: 27px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; font-size: 11px; } .user-chip strong { display: block; font-size: 11px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 30px 34px 45px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } h1, h2, h3, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; } .page-intro p { max-width: 720px; margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 11px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 8px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 12px; } .help-button { border: 0; border-radius: 8px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .profile-card { display: flex; align-items: center; gap: 18px; margin-top: 28px; padding: 24px; border: 1px solid #dce5ef; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .avatar { display: grid; place-items: center; width: 58px; height: 58px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-size: 19px; font-weight: 800; } .profile-info { flex: 1; min-width: 0; } .profile-info h2 { margin: 0; font-size: 19px; } .profile-info p { margin: 5px 0 0; color: #536179; font-size: 12px; } .profile-info small { color: #8996a8; font-size: 11px; } .edit-button { flex: 0 0 auto; padding: 10px 18px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
        .profile-actions { display: flex; align-items: center; gap: 10px; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 22px; } .stat-card { padding: 18px; border: 1px solid #dce5ef; border-radius: 10px; background: #fff; } .stat-card span { color: #65738a; font-size: 11px; font-weight: 700; } .stat-card strong { display: block; margin: 8px 0 6px; font-size: 20px; letter-spacing: -0.55px; } .stat-card small { color: #8996a8; font-size: 11px; }

        .tab-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 24px 0 20px; border-bottom: 1px solid #dce5ef; } .tab-row button { padding: 10px 5px; margin-right: 22px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; } .tab-row button.selected { border-color: #EB630F; color: #00243A; }

        .badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; } .badge-card { padding: 19px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .badge-icon { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 16px; border-radius: 8px; } .tone-cyan .badge-icon { background: #FDEAE0; color: #C24F0C; } .tone-amber .badge-icon { background: #fff4e0; color: #f5a524; } .tone-muted { opacity: .55; } .tone-muted .badge-icon { background: #eef1f6; color: #8996a8; } .badge-card h3 { margin: 0 0 8px; font-size: 13px; } .badge-card p { margin: 0; color: #65738a; font-size: 11px; line-height: 1.4; } .badge-card small { display: block; margin-top: 14px; color: #C24F0C; font-weight: 700; font-size: 11px; } .tone-muted small { color: #8996a8; }
        .empty-tab { padding: 32px; text-align: center; color: #65738a; font-size: 11px; border: 1px dashed #dce5ef; border-radius: 10px; }

        @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .dashboard-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } .stat-grid { grid-template-columns: 1fr 1fr; } .badge-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 850px) {   .sidebar { padding: 11px 8px; } .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 16px; height: 16px; } .side-divider, .footer-links,  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .dashboard-content { padding: 22px 14px 36px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 18px 11px 28px; } h1 { font-size: 23px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .profile-card { flex-direction: column; text-align: center; } .stat-grid, .badge-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
