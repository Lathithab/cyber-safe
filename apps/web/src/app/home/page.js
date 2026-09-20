"use client";

import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../lib/useRequireAuth";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

function Icon({ name, size = 24 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "alert") return <svg {...shared}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "flag") return <svg {...shared}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V3" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

const ACTIONS = [
  { title: "I need help now", description: "Reach national emergency lines, bank fraud hotlines, and SAPS contacts.", cta: "Open Helpline Hub", route: "/help", icon: "phone" },
  { title: "Check a suspicious message", description: "Search the Scam Library for warning signs and what to do next.", cta: "Open Scam Library", route: "/library", icon: "search" },
  { title: "Report a scam", description: "Submit an incident report with details and optional evidence.", cta: "Report Incident", route: "/postReport", icon: "flag" },
];

export default function HomePage() {
  const router = useRouter();
  const { loading } = useRequireAuth();
  const links = DASHBOARD_NAV;

  if (loading) return null;

  return (
    <main className="home-dashboard">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/home" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
        </nav>
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Welcome back</h1></div>
            <p>Your next step is one tap away. Choose what you need right now.</p>
          </div>
        </header>

        <div className="safety-banner">
          <span className="banner-icon"><Icon name="alert" size={24} /></span>
          <p>If money is moving right now or an account may be compromised, call your bank immediately. Never share a PIN, password, or one-time password with anyone.</p>
        </div>

        <div className="action-grid">
          {ACTIONS.map((action) => (
            <article className="action-card" key={action.route}>
              <span className="action-icon"><Icon name={action.icon} size={22} /></span>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
              <button type="button" onClick={() => router.push(action.route)}>{action.cta} <b>&rarr;</b></button>
            </article>
          ))}
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .home-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; overflow-y: auto; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: auto; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; }

        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro h1, .page-intro strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; font-size: clamp(30px, 3.4vw, 42px); letter-spacing: -2px; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }

        .safety-banner { display: flex; align-items: flex-start; gap: 14px; margin-top: 26px; padding: 20px 22px; border: 1px solid #ffd9a8; border-radius: 16px; background: #fff8ec; color: #7a4b00; } .banner-icon { flex: 0 0 auto; color: #b76c00; } .safety-banner p { margin: 0; font-size: 15px; line-height: 1.5; }

        .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 26px; }
        .action-card { padding: 26px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); display: flex; flex-direction: column; }
        .action-icon { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: 14px; border-radius: 13px; background: #e6faff; color: #20b6d8; }
        .action-card h2 { margin: 0 0 8px; font-family: "Syne", Arial, sans-serif; font-size: 20px; letter-spacing: -.5px; }
        .action-card p { margin: 0; color: #65738a; font-size: 14.5px; line-height: 1.45; flex: 1; }
        .action-card button { margin-top: 18px; border: 0; border-radius: 12px; padding: 13px 18px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 14.5px; font-weight: 800; text-align: left; }
        .action-card button b { margin-left: 6px; }

        @media (max-width: 1180px) { .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } }
        @media (max-width: 850px) { .home-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .emergency-card { display: none; } .dashboard-content { padding: 27px 18px 45px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 27px; } }
      `}</style>
    </main>
  );
}
