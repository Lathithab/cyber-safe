"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const FILTERS = ["All modules", "Banking", "Social engineering", "School resources"];
function Icon({ name, size = 22 }) {
  if (name === "shield") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

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
  const links = [["Home Feed", "/", "home"], ["Learn Security", "/learn", "learn"], ["Scam Library", "/library", "library"], ["Report Incident", "/postReport", "report"], ["Get Help", "/help", "help"], ["CyberBot AI", "/cyberbot", "chat"]];
  const visibleModules = activeFilter === "All modules"
    ? databaseModules
    : databaseModules.filter((module) => module.category === activeFilter);
  return <main className="learn-dashboard"><aside className="sidebar"><button className="brand" onClick={() => router.push("/")} type="button"><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button><nav className="side-nav">{links.map(([label, route, icon]) => <button key={label} type="button" className={`side-link ${route === "/learn" ? "active" : ""}`} onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} />{label}</button>)}</nav><button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><DashboardNavIcon name="help" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button></aside><section className="learn-content"><header><p>CyberSafe academy</p><h1>Interactive Safety Academy</h1><span>Practical courses built to tackle local South African digital threats.</span></header><section className="hero"><div><b>FEATURED CURRICULUM</b><h2>Securing your SA Banking Apps against OTP Scams</h2><p>Learn how social engineers steal one-time passwords and banking login details - and the rules of immediate secure-bank escalation.</p><button type="button">Start free module</button><small>30 mins · Practical quiz included</small></div><i><Icon name="shield" size={100} /></i></section><section className="module-row"><h2>Start learning</h2><span>Short, practical and local</span></section><div className="filters" aria-label="Learning module filters">{FILTERS.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "selected" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="module-grid">
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
    * { box-sizing:border-box; } .learn-dashboard { min-height:100vh; display:grid; grid-template-columns:300px minmax(0,1fr); background:#f6f9fd; color:#121a32; font-family:"DM Sans",Arial,sans-serif; } .sidebar { position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:30px 28px; border-right:1px solid #e2e9f2; background:#fff; } .brand { display:flex; align-items:center; gap:13px; border:0; padding:0; background:transparent; color:#121a32; cursor:pointer; text-align:left; } .brand-icon { display:grid; place-items:center; width:52px; height:52px; border-radius:15px; background:#e6faff; color:#31c7e6; } .brand strong,h1,h2 { font-family:"Syne",Arial,sans-serif; } .brand strong { display:block; font-size:26px; letter-spacing:-1px; } .brand small { display:block; margin-top:5px; color:#31c7e6; font-size:15px; font-weight:700; } .side-nav { display:grid; gap:9px; margin-top:42px; } .side-link { display:flex; align-items:center; gap:16px; width:100%; padding:14px 17px; border:0; border-radius:14px; background:transparent; color:#536179; cursor:pointer; font:inherit; font-size:18px; font-weight:600; text-align:left; } .side-link.active { background:#e5f9fd; color:#121a32; font-weight:800; } .side-link.active svg { color:#31c7e6; } .emergency-card { display:flex; align-items:flex-start; gap:13px; margin-top:auto; padding:20px; border:2px solid #ff5a5f; border-radius:20px; background:#fff4f4; color:#ff5158; cursor:pointer; font:inherit; text-align:left; } .emergency-icon { flex:0 0 auto; } .emergency-card strong,.emergency-card small,.emergency-card b { display:block; } .emergency-card strong { font-family:"Syne",Arial,sans-serif; font-size:17px; } .emergency-card small { margin:13px 0 7px; color:#536179; font-size:13px; line-height:1.4; } .emergency-card b { color:#ff5158; font-size:14px; }
    .learn-content { padding:38px 42px 56px; } header { padding-bottom:26px; border-bottom:1px solid #dce5ef; } header p { margin:0 0 7px; color:#2fc4e4; font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; } h1 { margin:0; font-size:clamp(32px,3.4vw,44px); letter-spacing:-2px; } header span { display:block; margin-top:13px; color:#5b6980; font-size:18px; } .hero { display:flex; align-items:center; justify-content:space-between; gap:30px; min-height:300px; margin-top:30px; padding:46px 55px; overflow:hidden; border-radius:24px; background:linear-gradient(115deg,#101a35,#172d53 55%,#17657b); color:#fff; } .hero div { max-width:790px; } .hero b { display:inline-block; padding:8px 13px; border-radius:6px; background:#31c7e6; color:#102039; font-size:13px; } .hero h2 { margin:24px 0 14px; font-size:clamp(27px,3vw,42px); letter-spacing:-1.5px; } .hero p { margin:0; max-width:760px; color:#c7d3e6; font-size:17px; line-height:1.45; } .hero button { margin-top:25px; padding:15px 22px; border:0; border-radius:13px; background:#31c7e6; color:#102039; cursor:pointer; font:inherit; font-weight:800; } .hero small { margin-left:17px; font-size:14px; font-weight:700; } .hero i { display:grid; place-items:center; width:180px; height:180px; flex:0 0 auto; border:1px solid rgba(255,255,255,.22); border-radius:50%; color:#56d8ef; }
    .module-row { display:flex; align-items:center; justify-content:space-between; margin:34px 0 17px; } .module-row h2 { margin:0; font-size:24px; } .module-row span { color:#65738a; font-size:14px; } .filters { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; } .filters button { padding:11px 16px; border:1px solid #dce5ef; border-radius:11px; background:#fff; color:#536179; cursor:pointer; font:inherit; font-size:14px; font-weight:800; } .filters button.selected { border-color:#31c7e6; background:#e6faff; color:#20b6d8; } .module-status { margin:0 0 18px; color:#65738a; font-size:14px; } .module-status.error { color:#c23d48; } .module-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; } article { min-height:220px; padding:24px; border:1px solid #dce5ef; border-radius:18px; background:#fff; } article small { color:#2fc4e4; font-size:12px; font-weight:800; text-transform:uppercase; } article h2 { margin:13px 0 9px; font-size:20px; } article p { margin:0; color:#65738a; font-size:14px; line-height:1.45; } article footer { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:22px; } article footer span { color:#65738a; font-size:13px; } article footer button { border:0; background:transparent; color:#20b6d8; cursor:pointer; font:inherit; font-size:13px; font-weight:800; }
    @media(max-width:1180px){.learn-dashboard{grid-template-columns:270px minmax(0,1fr)}.learn-content{padding:34px 30px}.hero{padding:36px}.module-grid{grid-template-columns:1fr 1fr}}@media(max-width:850px){.learn-dashboard{display:block}.sidebar{position:static;height:auto;padding:18px;border-right:0;border-bottom:1px solid #dce5ef}.brand{margin-bottom:16px}.side-nav{display:flex;gap:7px;overflow-x:auto;margin:0}.side-link{width:auto;min-width:max-content;padding:10px 13px;font-size:14px}.emergency-card{display:none}.learn-content{padding:27px 18px}.module-grid{grid-template-columns:1fr}}@media(max-width:600px){.learn-content{padding:22px 14px}.hero{min-height:0;padding:28px 22px}.hero i{display:none}.hero small{display:block;margin:15px 0 0}.module-row{align-items:flex-start;flex-direction:column;gap:5px}}
  `}</style></main>;
}
