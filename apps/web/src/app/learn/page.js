"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const FILTERS = ["All modules", "Banking", "Social engineering", "School resources"];
function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") {
    return (
      <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none">
        <path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" />
        <ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" />
      </svg>
    );
  }
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;

  return null;
}
function ShieldIcon() {
  return <span className="shield-icon" aria-hidden="true">✓</span>;
}

export default function LearnPage() {
  const router = useRouter();
  const [databaseModules, setDatabaseModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    async function loadDatabaseModules() {
      if (!isSupabaseConfigured) {
        setLoadError("Learning modules are not available until Supabase is configured.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("published", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Could not load modules:", error);
        setLoadError("We could not load the learning modules. Please try again shortly.");
      } else {
        setDatabaseModules(data || []);
      }

      setIsLoading(false);
    }

    loadDatabaseModules();
  }, []);
  const [activeFilter, setActiveFilter] = useState("All modules");
  const links = DASHBOARD_NAV;
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = DASHBOARD_NAV.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = DASHBOARD_NAV.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));
  const visibleModules = activeFilter === "All modules"
    ? databaseModules
    : databaseModules.filter((module) => module.category === activeFilter);
  return <main className="learn-dashboard">
    <header className="mobile-topbar">
      <button className="mobile-topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" size={21} /></button>
      <button className="mobile-topbar-brand" type="button" onClick={() => router.push("/feed")}><span className="mobile-topbar-icon"><Icon name="shield" size={18} /></span><strong>CyberSafe</strong></button>
      <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/notification")} aria-label="Notifications"><DashboardNavIcon name="bell" size={21} /></button>
    </header>
    <aside className="sidebar"><button className="brand" onClick={() => router.push("/feed")} type="button"><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button><nav className="side-nav">{links.map(([label, route, icon]) => <button key={label} type="button" className={`side-link ${route === "/learn" ? "active" : ""}`} onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} />{label}</button>)}</nav><LogoutButton /><button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><DashboardNavIcon name="help" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button></aside>
    <nav className="bottom-nav" aria-label="Primary navigation">
      {primaryNav.map(([label, route, icon]) => (
        <button key={label} type="button" className={`bottom-nav-item ${route === "/learn" ? "active" : ""}`} onClick={() => router.push(route)}>
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
    <section className="learn-content"><header><p>CyberSafe academy</p><h1>Interactive Safety Academy</h1><span>Practical courses built to tackle local South African digital threats.</span></header><section className="hero"><div><b>FEATURED CURRICULUM</b><h2>Securing your SA Banking Apps against OTP Scams</h2><p>Learn how social engineers steal one-time passwords and banking login details - and the rules of immediate secure-bank escalation.</p><button type="button">Start free module</button><small>30 mins · Practical quiz included</small></div><i><Icon name="shield" size={100} /></i></section><section className="module-row"><h2>Start learning</h2><span>Short, practical and local</span></section><div className="filters" aria-label="Learning module filters">{FILTERS.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "selected" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="module-grid">
  {isLoading && <p className="module-status">Loading learning modules…</p>}
  {!isLoading && loadError && <p className="module-status error">{loadError}</p>}
  {!isLoading && !loadError && !visibleModules.length && <p className="module-status">No modules are available in this category yet.</p>}
  {visibleModules.map((module) => (
    <article key={module.id}>
      <small>{module.difficulty}</small>

      <h2>{module.title}</h2>

      <p>{module.description}</p>

      <footer>
        <span>{module.estimated_minutes} min</span>

        <button
          type="button"
          onClick={() => router.push(`/learn/${module.id}`)}
        >
          Open module →
        </button>
      </footer>
    </article>
  ))}
</div></section><style>{`
    * { box-sizing:border-box; } .learn-dashboard { min-height:100vh; display:grid; grid-template-columns: minmax(0,1fr); background:#f6f9fd; color:#00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } .sidebar { position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:24px 22px; border-right:1px solid #e2e9f2; background: #00243A; } .sidebar { display: none; }    .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #00243A; border-bottom: 2px solid #EB630F; }
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
    .brand { display:flex; align-items:center; gap:13px; border:0; padding:0; background:transparent; color: #fff; cursor:pointer; text-align:left; } .brand-icon { display:grid; place-items:center; width:41px; height:41px; border-radius:12px; background: rgba(235,99,15,.22); color:#EB630F; } .brand strong,h1,h2 { font-family: inherit; } .brand strong { display:block; font-size:20px; letter-spacing:-0.6px; } .brand small { display:block; margin-top:4px; color:#EB630F; font-size:12px; font-weight:700; } .side-nav { display:grid; gap:7px; margin-top:33px; } .side-link { display:flex; align-items:center; gap:13px; width:100%; padding:11px 13px; border:0; border-radius:11px; background:transparent; color: rgba(255,255,255,.68); cursor:pointer; font:inherit; font-size:14px; font-weight:600; text-align:left; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight:800; } .side-link.active svg { color:#EB630F; } .emergency-card { display:flex; align-items:flex-start; gap:10px; margin-top:auto; padding:16px; border:2px solid #ff5a5f; border-radius:16px; background:#fff4f4; color:#ff5158; cursor:pointer; font:inherit; text-align:left; } .emergency-icon { flex:0 0 auto; } .emergency-card strong,.emergency-card small,.emergency-card b { display:block; } .emergency-card strong { font-size:13px; } .emergency-card small { margin:10px 0 5px; color:#536179; font-size:10px; line-height:1.4; } .emergency-card b { color:#ff5158; font-size:11px; }
    .learn-content { padding: calc(18px + 52px + env(safe-area-inset-top, 0px)) 16px 78px; } header { padding-bottom:20px; border-bottom:1px solid #dce5ef; } header p { margin:0 0 6px; color:#EB630F; font-size:10.5px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; } h1 { margin:0; font-size:26px; letter-spacing:-0.9px; } header span { display:block; margin-top:10px; color:#5b6980; font-size:13.5px; } .hero { display:flex; flex-direction:column; align-items:flex-start; gap:18px; min-height:0; margin-top:18px; padding:24px 20px; overflow:hidden; border-radius:16px; background:linear-gradient(115deg,#00243A,#0e3556 55%,#0f5065); color:#fff; } .hero div { max-width:790px; } .hero b { display:inline-block; padding:6px 10px; border-radius:6px; background:#EB630F; color:#00243A; font-size:11px; } .hero h2 { margin:16px 0 10px; font-size:20px; letter-spacing:-0.5px; } .hero p { margin:0; max-width:760px; color:#c7d3e6; font-size:13.5px; line-height:1.5; } .hero button { margin-top:16px; padding:12px 18px; border:0; border-radius:10px; background:#EB630F; color:#00243A; cursor:pointer; font:inherit; font-weight:800; font-size:13px; } .hero small { display:block; margin-top:10px; font-size:11px; font-weight:700; } .hero i { display:none; }
    .module-row { display:flex; flex-direction:column; gap:3px; margin:24px 0 14px; } .module-row h2 { margin:0; font-size:18px; } .module-row span { color:#65738a; font-size:12px; } .filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; } .filters button { padding:9px 13px; border:1px solid #dce5ef; border-radius:9px; background:#fff; color:#536179; cursor:pointer; font:inherit; font-size:12px; font-weight:800; } .filters button.selected { border-color:#EB630F; background:#FDEAE0; color:#C24F0C; } .module-status { margin:0 0 16px; color:#65738a; font-size:12.5px; } .module-status.error { color:#c23d48; } .module-grid { display:grid; grid-template-columns: 1fr; gap:14px; } article { min-height:0; padding:18px; border:1px solid #dce5ef; border-radius:14px; background:#fff; } article small { color:#EB630F; font-size:10.5px; font-weight:800; text-transform:uppercase; } article h2 { margin:10px 0 7px; font-size:16px; } article p { margin:0; color:#65738a; font-size:13px; line-height:1.5; } article footer { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:16px; } article footer span { color:#65738a; font-size:12px; } article footer button { border:0; background:transparent; color:#C24F0C; cursor:pointer; font:inherit; font-size:12.5px; font-weight:800; }
    @media(min-width:851px){.learn-content{padding:30px 34px 45px}.hero{flex-direction:row;align-items:center;justify-content:space-between;min-height:260px;padding:40px 48px}.hero h2{font-size:clamp(24px,3vw,34px)}.hero i{display:grid;place-items:center;width:150px;height:150px;flex:0 0 auto;border:1px solid rgba(255,255,255,.22);border-radius:50%;color:#F0A06B}.module-grid{grid-template-columns:repeat(3,1fr)}}
    @media(min-width:1181px){.learn-dashboard{grid-template-columns:270px minmax(0,1fr)}}

    @media (min-width: 851px) {
      .sidebar { display: flex; }
      .learn-dashboard { grid-template-columns: 230px minmax(0,1fr); }
      .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
      .learn-content { padding-top: 24px; }
    }
    `}</style></main>;
}
