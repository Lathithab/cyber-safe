"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "../components/DashboardNavIcon";
import C3saLogo from "../components/C3saLogo";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import PlatformSearch from "../components/PlatformSearch";
import { getModuleBadge } from "../../lib/moduleBadges";

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
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
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
      setIsPostsLoading(true);

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

      const { data: progressRows, error: progressError } = await supabase
        .from("user_progress")
        .select("module_id, quiz_score, completed_at, modules(title)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (progressError) {
        console.error("Could not load module badges:", progressError);
      } else {
        setEarnedBadges((progressRows || []).map((row) => {
          const moduleData = Array.isArray(row.modules) ? row.modules[0] : row.modules;
          return {
            ...getModuleBadge(moduleData),
            tone: "cyan",
            meta: `Unlocked ${new Date(row.completed_at).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`,
            moduleId: row.module_id,
          };
        }));
      }

      const { data: postRows, error: postsLoadError } = await supabase
        .from("posts")
        .select("id, description, image_url, issues, status, created_at, location")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (postsLoadError) {
        console.error("Could not load your community posts:", postsLoadError);
        setPostsError("We could not load your posts. Please try again later.");
      } else {
        setMyPosts(postRows || []);
      }
      setIsPostsLoading(false);
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
          <C3saLogo size={34} />
          <strong>CyberSafe</strong>
        </button>
        <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/profiles")} aria-label="User Profile">
          <DashboardNavIcon name="user" size={21} />
        </button>
      </header>

<aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><C3saLogo /><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/profiles" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}
        </nav>
        <LogoutButton />
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
            <PlatformSearch />
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
    </div>
  </section>
) : null}

        <div className="stat-grid">
          <div className="stat-card"><span>Security Badges</span><strong>{earnedBadges.length}</strong><small>Module completion badges earned</small></div>
          <div className="stat-card"><span>Incident Reports</span><strong>{myPosts.length}</strong><small>Submitted by you</small></div>
        </div>

        <section className="profile-tools" aria-labelledby="profile-tools-title">
          <div><h2 id="profile-tools-title">Your account</h2><p>Manage your notification preferences and account settings here.</p></div>
          <div className="profile-tool-links">
            <button type="button" onClick={() => router.push("/notification")}><span className="profile-tool-icon"><DashboardNavIcon name="bell" size={20} /></span><span><strong>Notifications</strong><small>Review alerts and update notification preferences</small></span><b aria-hidden="true">→</b></button>
            <button type="button" onClick={() => router.push("/settings")}><span className="profile-tool-icon"><DashboardNavIcon name="gear" size={20} /></span><span><strong>Settings</strong><small>Manage privacy, security, and accessibility options</small></span><b aria-hidden="true">→</b></button>
          </div>
        </section>

        <div className="tab-row" aria-label="Profile tabs">
          {TABS.map((item) => <button key={item} type="button" className={item === tab ? "selected" : ""} onClick={() => setTab(item)}>{item}</button>)}
        </div>

        {tab === "Earned Badges" && (
          <div className="badge-grid">
            {earnedBadges.length ? earnedBadges.map((badge) => (
              <article className={`badge-card tone-${badge.tone}`} key={badge.moduleId}>
                <span className="badge-icon"><Icon name={badge.icon} size={19} /></span>
                <h3>{badge.title}</h3>
                <p>{badge.body}</p>
                <small>{badge.meta}</small>
              </article>
            )) : <p className="empty-tab">Complete a learning module quiz with at least 60% to earn your first badge.</p>}
          </div>
        )}
        {tab === "My Posts" && (
          <section className="my-posts" aria-label="My community posts" aria-live="polite">
            {postsError ? <p className="empty-tab">{postsError}</p> : myPosts.length ? myPosts.map((post) => (
              <article className="my-post-card" key={post.id}>
                <div className="my-post-heading">
                  <div>
                    <strong>{post.issues?.length ? post.issues.join(" · ") : "Community post"}</strong>
                    <small>{new Date(post.created_at).toLocaleString("en-ZA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}</small>
                  </div>
                  <span className={`post-status status-${post.status}`}>
                    {post.status === "approved" ? "Published" : post.status === "removed" ? "Removed" : "Pending review"}
                  </span>
                </div>
                <p>{post.description}</p>
                {post.image_url && <img className="my-post-image" src={post.image_url} alt="Image attached to your community post" />}
                {post.location && <small className="my-post-location">{post.location}</small>}
              </article>
            )) : (
              <p className="empty-tab">
                {isPostsLoading ? "Loading your posts…" : "Your community posts will appear here after you submit them."}
              </p>
            )}
          </section>
        )}
        {tab !== "Earned Badges" && tab !== "My Posts" && <p className="empty-tab">Nothing to show here yet.</p>}
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .profile-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f7f4ef; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #fff; border-bottom: 1px solid #e4ddd4; }
        .mobile-topbar-menu, .mobile-topbar-bell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #536179; cursor: pointer; }
        .mobile-topbar-brand { display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: #00243A; cursor: pointer; font: inherit; padding: 0; }
        .mobile-topbar-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: #FDEAE0; color: #EB630F; }
        .mobile-topbar-brand strong { font-size: 15px; letter-spacing: -0.3px; }

        .bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; background: #fff; border-top: 1px solid #e4ddd4; padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -4px 16px rgba(0,0,0,.05); }
        .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 2px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }
        .bottom-nav-item.active { color: #EB630F; }
        .bottom-nav-item span { white-space: nowrap; }

        .nav-menu-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-end; background: rgba(0,36,58,.4); }
        .nav-menu-sheet { width: 100%; max-height: 70vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px)); }
        .nav-menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .nav-menu-header strong { font-size: 15px; }
        .nav-menu-close { border: 0; background: #f3eee8; color: #536179; border-radius: 999px; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }
        .nav-menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .nav-menu-item { display: flex; align-items: center; gap: 10px; padding: 13px 12px; border: 1px solid #eee8e0; border-radius: 10px; background: #fbf9f5; color: #26324a; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; }
        .nav-menu-icon { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border-radius: 8px; background: #FDEAE0; color: #EB630F; }

                .dashboard-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); padding-bottom: 78px; }

                .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #0d3557; background: #00243A; } .sidebar { display: none; }
        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .profile-dashboard { grid-template-columns: 230px minmax(0, 1fr); }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .dashboard-content { padding-top: 24px; padding-bottom: 36px; }
        }

        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 12px; background: rgba(235,99,15,.22); color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; letter-spacing: -0.6px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; }
        .side-nav { display: grid; gap: 7px; margin-top: 33px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 13px; border: 0; border-radius: 11px; background: transparent; color: rgba(255,255,255,.68); cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; } .side-link.active svg { color: #EB630F; }
        .side-divider { height: 1px; margin: 6px 3px; background: #e4ddd4; } .footer-links { display: grid; gap: 2px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 8px; padding: 7px 14px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: 18px; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; } .user-chip { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 12px; padding: 6px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f7f4ef; } .chip-avatar { display: grid; place-items: center; width: 27px; height: 27px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; font-size: 11px; } .user-chip strong { display: block; font-size: 11px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 30px 34px 45px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #e4ddd4; } .page-intro { min-width: 0; } h1, h2, h3, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; } .page-intro p { max-width: 720px; margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 11px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 8px; width: 245px; padding: 0 16px; border: 1px solid #e4ddd4; border-radius: 8px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 12px; } .help-button { border: 0; border-radius: 8px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .profile-card { display: flex; align-items: center; gap: 18px; margin-top: 28px; padding: 24px; border: 1px solid #e4ddd4; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .avatar { display: grid; place-items: center; width: 58px; height: 58px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-size: 19px; font-weight: 800; } .profile-info { flex: 1; min-width: 0; } .profile-info h2 { margin: 0; font-size: 19px; } .profile-info p { margin: 5px 0 0; color: #536179; font-size: 12px; } .profile-info small { color: #8996a8; font-size: 11px; } .edit-button { flex: 0 0 auto; padding: 10px 18px; border: 1px solid #e4ddd4; border-radius: 8px; background: #fff; color: #26324a; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
        .profile-actions { display: flex; align-items: center; gap: 10px; }

        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 22px; max-width: 420px; } .stat-card { padding: 18px; border: 1px solid #e4ddd4; border-radius: 10px; background: #fff; } .stat-card span { color: #65738a; font-size: 11px; font-weight: 700; } .stat-card strong { display: block; margin: 8px 0 6px; font-size: 20px; letter-spacing: -0.55px; } .stat-card small { color: #8996a8; font-size: 11px; }
        .profile-tools { display: grid; grid-template-columns: minmax(190px, .6fr) minmax(0, 1.4fr); gap: 18px; align-items: center; margin-top: 22px; padding: 20px; border: 1px solid #e4ddd4; border-radius: 12px; background: #fff; }
        .profile-tools h2 { margin: 0; color: #18223b; font-size: 17px; }
        .profile-tools p { margin: 6px 0 0; color: #66758d; font-size: 12px; line-height: 1.5; }
        .profile-tool-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .profile-tool-links button { display: flex; min-width: 0; align-items: center; gap: 11px; padding: 13px; border: 1px solid #e4ddd4; border-radius: 10px; background: #fff; color: #18223b; text-align: left; cursor: pointer; font: inherit; }
        .profile-tool-links button:hover { border-color: #EB630F; background: #fff8f1; }
        .profile-tool-icon { display: grid; width: 38px; height: 38px; flex: 0 0 auto; place-items: center; border-radius: 9px; background: #fff5eb; color: #C24F0C; }
        .profile-tool-links button > span:nth-child(2) { display: grid; gap: 4px; min-width: 0; }
        .profile-tool-links strong { font-size: 13px; }
        .profile-tool-links small { color: #66758d; font-size: 10px; line-height: 1.35; }
        .profile-tool-links b { margin-left: auto; color: #C24F0C; font-size: 18px; }

        .tab-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 24px 0 20px; border-bottom: 1px solid #e4ddd4; } .tab-row button { padding: 10px 5px; margin-right: 22px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; } .tab-row button.selected { border-color: #EB630F; color: #00243A; }

        .badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; } .badge-card { padding: 19px; border: 1px solid #e4ddd4; border-radius: 11px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .badge-icon { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 16px; border-radius: 8px; } .tone-cyan .badge-icon { background: #FDEAE0; color: #C24F0C; } .tone-amber .badge-icon { background: #fff4e0; color: #f5a524; } .tone-muted { opacity: .55; } .tone-muted .badge-icon { background: #eef1f6; color: #8996a8; } .badge-card h3 { margin: 0 0 8px; font-size: 13px; } .badge-card p { margin: 0; color: #65738a; font-size: 11px; line-height: 1.4; } .badge-card small { display: block; margin-top: 14px; color: #C24F0C; font-weight: 700; font-size: 11px; } .tone-muted small { color: #8996a8; }
        .my-posts { display: grid; gap: 14px; }
        .my-post-card { min-width: 0; padding: 20px; border: 1px solid #e4ddd4; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); }
        .my-post-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .my-post-heading > div { display: grid; gap: 5px; }
        .my-post-heading strong { color: #c24f0c; font-size: 12px; }
        .my-post-heading small, .my-post-location { color: #8996a8; font-size: 11px; }
        .post-status { flex: 0 0 auto; padding: 6px 9px; border-radius: 999px; font-size: 10px; font-weight: 800; }
        .status-pending { background: #fff4e0; color: #94630b; }
        .status-approved { background: #e8f4ec; color: #267145; }
        .status-removed { background: #fff0ef; color: #c94646; }
        .my-post-card > p { margin: 15px 0 0; color: #26324a; font-size: 13px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
        .my-post-image { display: block; max-width: min(100%, 560px); max-height: 420px; margin-top: 14px; border-radius: 9px; object-fit: contain; }
        .my-post-location { display: block; margin-top: 10px; }
        .empty-tab { padding: 32px; text-align: center; color: #65738a; font-size: 11px; border: 1px dashed #e4ddd4; border-radius: 10px; }

        @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .dashboard-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } .stat-grid { grid-template-columns: 1fr 1fr; } .badge-grid { grid-template-columns: 1fr 1fr; } .profile-tools { grid-template-columns: 1fr; } }
        @media (max-width: 850px) {   .sidebar { padding: 11px 8px; } .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 16px; height: 16px; } .side-divider, .footer-links,  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .dashboard-content { padding: 22px 14px 36px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 18px 11px 28px; } h1 { font-size: 23px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .profile-card { flex-direction: column; text-align: center; } .stat-grid, .badge-grid, .profile-tool-links { grid-template-columns: 1fr; } .profile-tools { padding: 15px; } }
      `}</style>
    </main>
  );
}
