"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";

export default function PlatformAdminPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setAccess("unavailable");
        return;
      }
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/login");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, username, full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error || profile?.role !== "admin") {
        setAccess("denied");
        return;
      }
      setName(profile.full_name || profile.username || user.email || "Administrator");
      setAccess("allowed");
    }
    checkAccess();
    return () => { active = false; };
  }, [router]);

  if (access !== "allowed") {
    return (
      <main className="admin-gate">
        <section className="admin-gate-card" aria-live="polite">
          <DashboardNavIcon name="admin" size={34} />
          <h1>{access === "checking" ? "Checking admin access" : access === "denied" ? "Admin access required" : "Admin dashboard unavailable"}</h1>
          <p>{access === "checking" ? "Please wait while we verify your account." : access === "denied" ? "This account does not have the Platform Admin role. Ask a project administrator to verify your role if you believe this is a mistake." : "Configure Supabase and sign in with an administrator account to use this dashboard."}</p>
          {access === "denied" && <button type="button" onClick={() => router.replace("/feed")}>Return to community feed</button>}
          {access === "unavailable" && <button type="button" onClick={() => router.replace("/login")}>Go to login</button>}
        </section>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="admin-layout">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}>
          <span className="brand-icon"><DashboardNavIcon name="admin" size={27} /></span>
          <span><strong>CyberSafe</strong><small>South Africa</small></span>
        </button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {DASHBOARD_NAV.map(([label, route, icon]) => (
            <button key={label} className={`side-link ${route === "/admin" ? "active" : ""}`} type="button" onClick={() => router.push(route)}>
              <DashboardNavIcon name={icon} size={24} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <section className="admin-content">
        <header className="admin-header">
          <div><p className="admin-eyebrow">Secure administration</p><h1>Platform Admin</h1><p>Manage learning, scam-awareness, and community content from one place.</p></div>
          <span className="admin-badge"><DashboardNavIcon name="admin" size={18} /> Admin access</span>
        </header>
        <section className="welcome-card">
          <p className="admin-eyebrow">Administrator workspace</p>
          <h2>Welcome, {name}</h2>
          <p>This area is restricted to signed-in accounts with the administrator role.</p>
        </section>
        <section className="admin-section">
          <h2>Content management</h2>
          <p className="section-intro">Choose an area to manage and review published content.</p>
          <div className="admin-cards">
            <article className="admin-card">
              <span className="card-icon"><DashboardNavIcon name="library" size={24} /></span>
              <p className="card-kicker">Scam Library</p>
              <h3>Guides and example media</h3>
              <p>Next: edit guide text, preview changes, and upload or replace example images in Supabase Storage.</p>
              <button type="button" onClick={() => router.push("/admin/scams")}>Manage scam guides <span aria-hidden="true">→</span></button>
            </article>
            <article className="admin-card">
              <span className="card-icon"><DashboardNavIcon name="learn" size={24} /></span>
              <p className="card-kicker">Learning Academy</p>
              <h3>Modules and quizzes</h3>
              <p>Create and edit learning modules, manage quiz questions, and control which modules learners can see.</p>
              <button type="button" onClick={() => router.push("/admin/learning")}>Manage modules and quizzes <span aria-hidden="true">→</span></button>
            </article>
            <article className="admin-card">
              <span className="card-icon"><DashboardNavIcon name="feed" size={24} /></span>
              <p className="card-kicker">Community Feed</p>
              <h3>Review community posts</h3>
              <p>Review pending incident reports, approve posts for the public feed, or remove content that should not remain visible.</p>
              <button type="button" onClick={() => router.push("/admin/community")}>Moderate community feed <span aria-hidden="true">→</span></button>
            </article>
          </div>
        </section>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .admin-layout { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .admin-layout .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; overflow-y: auto; padding: 22px; border-right: 1px solid #e2e9f2; background: #fff; }
  .admin-layout .brand { display: flex; align-items: center; gap: 11px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; }
  .admin-layout .brand-icon { display: grid; place-items: center; width: 49px; height: 49px; border-radius: 13px; background: #e6faff; color: #31c7e6; }
  .admin-layout .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 24px; letter-spacing: -1px; }
  .admin-layout .brand small { display: block; margin-top: 3px; color: #31c7e6; font-size: 13px; font-weight: 700; }
  .admin-layout .side-nav { display: grid; gap: 6px; margin-top: 30px; }
  .admin-layout .side-link { display: flex; align-items: center; gap: 13px; width: 100%; min-height: 46px; padding: 11px 13px; border: 0; border-radius: 12px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 16px; font-weight: 600; text-align: left; }
  .admin-layout .side-link:hover { background: #f3f8fb; }
  .admin-layout .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; }
  .admin-layout .side-link.active svg { color: #31c7e6; }
  .admin-layout .side-link svg { flex: 0 0 auto; }
  .admin-layout aside.sidebar > button.sidebar-logout { margin-top: 22px; }
  .admin-content { min-width: 0; padding: 42px clamp(22px, 4vw, 64px) 60px; }
  .admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 27px; border-bottom: 1px solid #dce5ef; }
  .admin-eyebrow, .card-kicker { margin: 0 0 8px; color: #20b6d8; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .admin-header h1 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: clamp(32px, 3.5vw, 46px); letter-spacing: -1.8px; }
  .admin-header > div > p:last-child { margin: 12px 0 0; color: #65738a; font-size: 17px; }
  .admin-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 13px; border: 1px solid #bdebf4; border-radius: 999px; background: #effbfe; color: #147d98; font-size: 13px; font-weight: 800; white-space: nowrap; }
  .welcome-card { margin-top: 28px; padding: 28px 32px; border-radius: 20px; background: linear-gradient(115deg, #101a35, #173b64 62%, #17657b); color: #fff; }
  .welcome-card .admin-eyebrow { color: #63d6ed; }
  .welcome-card h2 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: clamp(24px, 2.4vw, 34px); }
  .welcome-card p:last-child { margin: 9px 0 0; color: #d0dceb; font-size: 15px; }
  .admin-section { margin-top: 34px; }
  .admin-section h2 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 23px; }
  .section-intro { margin: 7px 0 0; color: #65738a; font-size: 14px; }
  .admin-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 18px; }
  .admin-card { min-width: 0; padding: 25px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 22px rgba(36, 56, 87, .035); }
  .card-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; background: #e6faff; color: #20b6d8; }
  .card-kicker { margin-top: 21px; margin-bottom: 6px; }
  .admin-card h3 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 20px; }
  .admin-card > p:not(.card-kicker) { min-height: 66px; margin: 10px 0 20px; color: #65738a; font-size: 14px; line-height: 1.55; }
  .admin-card button { display: inline-flex; align-items: center; gap: 8px; padding: 0; border: 0; background: transparent; color: #159eba; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
  .admin-gate { display: grid; place-items: center; min-height: 100vh; padding: 24px; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .admin-gate-card { width: min(100%, 500px); padding: 38px; border: 1px solid #dce5ef; border-radius: 20px; background: #fff; text-align: center; box-shadow: 0 14px 40px rgba(36, 56, 87, .08); }
  .admin-gate-card > svg { color: #20b6d8; }
  .admin-gate-card h1 { margin: 17px 0 9px; font-family: "Syne", Arial, sans-serif; font-size: 26px; }
  .admin-gate-card p { color: #65738a; font-size: 15px; line-height: 1.55; }
  .admin-gate-card button { margin-top: 23px; padding: 12px 17px; border: 0; border-radius: 11px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; }
  @media (max-width: 1000px) { .admin-layout { grid-template-columns: 270px minmax(0, 1fr); } .admin-cards { grid-template-columns: 1fr; } .admin-card > p:not(.card-kicker) { min-height: 0; } }
  @media (max-width: 850px) { .admin-layout { display: block; } .admin-layout .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #e2e9f2; } .admin-layout .brand { margin-bottom: 16px; } .admin-layout .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .admin-layout .side-link { width: auto; min-width: max-content; padding: 10px 13px; font-size: 14px; } .admin-layout aside.sidebar > button.sidebar-logout { display: none; } .admin-content { padding: 27px 18px 42px; } }
  @media (max-width: 600px) { .admin-content { padding: 22px 14px 35px; } .admin-header { flex-direction: column; } .welcome-card { padding: 23px; } .admin-card { padding: 21px; } }
`;
