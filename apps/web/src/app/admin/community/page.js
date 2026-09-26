"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";
import DashboardNavIcon from "../../components/DashboardNavIcon";
import LogoutButton from "../../components/LogoutButton";
import { DASHBOARD_NAV } from "../../components/dashboardNav";

const FILTERS = ["all", "pending", "approved", "removed"];

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminCommunityPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const [adminId, setAdminId] = useState("");
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPosts = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setErrorMessage("");
    let query = supabase
      .from("posts")
      .select("id, display_name, description, location, issues, image_url, status, created_at, moderated_at")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);

    const { data, error } = await query;
    if (error) {
      console.error("Could not load community posts for moderation:", error);
      setErrorMessage("Could not load posts. Confirm the community moderation migration has been applied.");
      setIsLoading(false);
      return;
    }
    setPosts(data || []);
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    let active = true;
    async function verifyAdmin() {
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
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (!error && profile?.role === "admin") {
        setAdminId(user.id);
        setAccess("allowed");
      } else {
        setAccess("denied");
      }
    }
    verifyAdmin();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (access === "allowed") loadPosts();
  }, [access, loadPosts]);

  async function setPostStatus(post, status) {
    const action = status === "approved" ? "approve" : status === "removed" ? "remove" : "return to pending review";
    if (status === "removed" && !window.confirm("Remove this post from the public feed? It will remain in the database for moderation records.")) return;
    setUpdatingId(post.id);
    setErrorMessage("");
    setSuccessMessage("");
    const { error } = await supabase
      .from("posts")
      .update({ status, moderated_at: new Date().toISOString(), moderated_by: adminId })
      .eq("id", post.id);

    if (error) {
      console.error("Could not update post moderation status:", error);
      setErrorMessage(`Could not ${action} this post. Confirm the admin moderation RLS policy is installed.`);
      setUpdatingId("");
      return;
    }
    setSuccessMessage(`Post ${status === "approved" ? "approved" : status === "removed" ? "removed from the feed" : "returned to pending review"}.`);
    setUpdatingId("");
    await loadPosts();
  }

  if (access !== "allowed") {
    return (
      <main className="moderation-gate">
        <section className="moderation-gate-card" aria-live="polite">
          <DashboardNavIcon name="admin" size={34} />
          <h1>{access === "checking" ? "Checking admin access" : access === "denied" ? "Admin access required" : "Admin dashboard unavailable"}</h1>
          <p>{access === "checking" ? "Please wait while we verify your account." : access === "denied" ? "This account does not have the Platform Admin role." : "Configure Supabase and sign in with an administrator account to moderate posts."}</p>
          {access === "denied" && <button type="button" onClick={() => router.replace("/feed")}>Return to community feed</button>}
        </section>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="moderation-layout">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}>
          <span className="brand-icon"><DashboardNavIcon name="admin" size={27} /></span>
          <span><strong>CyberSafe</strong><small>South Africa</small></span>
        </button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {DASHBOARD_NAV.map(([label, route, icon]) => (
            <button key={label} className="side-link" type="button" onClick={() => router.push(route)}>
              <DashboardNavIcon name={icon} size={24} /><span>{label}</span>
            </button>
          ))}
          <button className="side-link active" type="button" onClick={() => router.push("/admin")}>
            <DashboardNavIcon name="admin" size={24} /><span>Platform Admin</span>
          </button>
        </nav>
        <LogoutButton />
      </aside>

      <section className="moderation-content">
        <header className="moderation-header">
          <button className="back-link" type="button" onClick={() => router.push("/admin")}>← Platform Admin</button>
          <p className="eyebrow">Community safety</p>
          <h1>Feed moderation</h1>
          <p>Review Supabase posts, approve appropriate reports for the public feed, or remove posts that should not remain visible.</p>
        </header>

        <div className="moderation-note"><DashboardNavIcon name="admin" size={20} /><span>New database-backed feed posts and incident reports are held for review. Removed posts are hidden from the public feed and retained in the database.</span></div>

        <div className="toolbar">
          <div className="filters" role="group" aria-label="Filter posts by status">
            {FILTERS.map((status) => <button key={status} type="button" className={filter === status ? "filter active" : "filter"} onClick={() => setFilter(status)}>{status[0].toUpperCase() + status.slice(1)}{status === filter && <span className="sr-only"> selected</span>}</button>)}
          </div>
          <button className="refresh-button" type="button" onClick={loadPosts} disabled={isLoading}>{isLoading ? "Refreshing…" : "Refresh"}</button>
        </div>

        {errorMessage && <p className="feedback error" role="alert">{errorMessage}</p>}
        {successMessage && <p className="feedback success" role="status">{successMessage}</p>}
        {isLoading && <p className="empty-state">Loading posts…</p>}
        {!isLoading && !errorMessage && posts.length === 0 && <p className="empty-state">No {filter === "all" ? "posts" : `${filter} posts`} to show.</p>}

        <section className="post-list" aria-label="Community posts">
          {!isLoading && posts.map((post) => (
            <article className="moderation-card" key={post.id}>
              <div className="post-topline">
                <span className={`status status-${post.status}`}>{post.status}</span>
                <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
              </div>
              <h2>{post.display_name || "Anonymous"}{post.location ? <span> · {post.location}</span> : null}</h2>
              {post.issues?.length > 0 && <div className="tags">{post.issues.map((issue) => <span key={issue}>{issue}</span>)}</div>}
              <p className="post-description">{post.description}</p>
              {post.image_url && <a className="image-link" href={post.image_url} target="_blank" rel="noreferrer">View attached evidence ↗</a>}
              {post.moderated_at && <p className="moderated-at">Last action: {formatDate(post.moderated_at)}</p>}
              <div className="post-actions">
                {post.status !== "approved" && <button type="button" className="approve-button" disabled={updatingId === post.id} onClick={() => setPostStatus(post, "approved")}>{updatingId === post.id ? "Saving…" : "Approve"}</button>}
                {post.status !== "removed" && <button type="button" className="remove-button" disabled={updatingId === post.id} onClick={() => setPostStatus(post, "removed")}>Remove from feed</button>}
                {post.status !== "pending" && <button type="button" className="return-button" disabled={updatingId === post.id} onClick={() => setPostStatus(post, "pending")}>Return to pending</button>}
              </div>
            </article>
          ))}
        </section>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .moderation-layout { min-height: 100vh; display: grid; grid-template-columns: 280px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .moderation-layout .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; overflow-y: auto; padding: 22px; border-right: 1px solid #e2e9f2; background: #fff; }
  .moderation-layout .brand { display: flex; align-items: center; gap: 11px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; }
  .moderation-layout .brand-icon { display: grid; place-items: center; width: 49px; height: 49px; border-radius: 13px; background: #e6faff; color: #31c7e6; }
  .moderation-layout .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 24px; letter-spacing: -1px; }
  .moderation-layout .brand small { display: block; margin-top: 3px; color: #31c7e6; font-size: 13px; font-weight: 700; }
  .moderation-layout .side-nav { display: grid; gap: 6px; margin-top: 30px; }
  .moderation-layout .side-link { display: flex; align-items: center; gap: 13px; width: 100%; min-height: 46px; padding: 11px 13px; border: 0; border-radius: 12px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 15px; font-weight: 600; text-align: left; }
  .moderation-layout .side-link:hover, .moderation-layout .side-link.active { background: #e5f9fd; color: #121a32; }
  .moderation-layout .side-link.active svg { color: #31c7e6; }
  .moderation-layout .sidebar .sidebar-logout { margin-top: auto; }
  .moderation-content { width: min(100%, 1440px); min-width: 0; margin: 0 auto; padding: 38px clamp(18px, 4vw, 56px) 60px; }
  .moderation-header { padding-bottom: 24px; border-bottom: 1px solid #dce5ef; }
  .back-link { margin-bottom: 26px; padding: 0; border: 0; background: transparent; color: #159eba; cursor: pointer; font: inherit; font-weight: 800; }
  .eyebrow { margin: 0 0 7px; color: #20b6d8; font-size: 12px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
  .moderation-header h1 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: clamp(30px, 4vw, 46px); letter-spacing: -1.5px; }
  .moderation-header > p:last-child { max-width: 760px; margin: 10px 0 0; color: #65738a; font-size: 16px; line-height: 1.55; }
  .moderation-note { display: flex; align-items: flex-start; gap: 12px; margin: 22px 0; padding: 15px 17px; border: 1px solid #bdebf4; border-radius: 14px; background: #effbfe; color: #52647c; font-size: 14px; line-height: 1.5; }
  .moderation-note svg { flex: 0 0 auto; color: #159eba; }
  .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 24px 0 16px; }
  .filters { display: flex; gap: 8px; overflow-x: auto; }
  .filter, .refresh-button { min-height: 42px; padding: 9px 13px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; white-space: nowrap; }
  .filter.active { border-color: #31c7e6; background: #e5f9fd; color: #121a32; }
  .refresh-button:disabled { opacity: .65; cursor: wait; }
  .post-list { display: grid; gap: 14px; }
  .moderation-card { min-width: 0; padding: 20px; border: 1px solid #dce5ef; border-radius: 16px; background: #fff; box-shadow: 0 5px 18px rgba(36, 56, 87, .035); }
  .post-topline { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #738098; font-size: 12px; }
  .status { padding: 5px 9px; border-radius: 999px; background: #f1f4f8; color: #536179; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  .status-pending { background: #fff6df; color: #94630b; }
  .status-approved { background: #e7f8ef; color: #197448; }
  .status-removed { background: #fff0f0; color: #b13e49; }
  .moderation-card h2 { margin: 13px 0 8px; font-family: "Syne", Arial, sans-serif; font-size: 18px; }
  .moderation-card h2 span { color: #738098; font-family: "DM Sans", Arial, sans-serif; font-size: 14px; font-weight: 500; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }
  .tags span { padding: 4px 8px; border-radius: 999px; background: #effbfe; color: #147d98; font-size: 11px; font-weight: 800; }
  .post-description { margin: 0; color: #526179; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
  .image-link { display: inline-block; margin-top: 12px; color: #159eba; font-size: 14px; font-weight: 800; }
  .moderated-at { margin: 12px 0 0; color: #8792a5; font-size: 12px; }
  .post-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; padding-top: 15px; border-top: 1px solid #edf1f6; }
  .post-actions button { min-height: 40px; padding: 9px 13px; border-radius: 10px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; }
  .post-actions button:disabled { opacity: .6; cursor: wait; }
  .approve-button { border: 0; background: #31c7e6; color: #102039; }
  .remove-button { border: 1px solid #ffc6cb; background: #fff7f7; color: #c43d49; }
  .return-button { border: 1px solid #dce5ef; background: #fff; color: #536179; }
  .empty-state { padding: 30px 20px; border: 1px dashed #cbd6e4; border-radius: 15px; color: #65738a; text-align: center; }
  .feedback { padding: 12px 15px; border-radius: 11px; font-size: 14px; }
  .feedback.error { background: #fff0f0; color: #a3323e; }
  .feedback.success { background: #e7f8ef; color: #197448; }
  .moderation-gate { display: grid; place-items: center; min-height: 100vh; padding: 24px; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .moderation-gate-card { width: min(100%, 500px); padding: 38px; border: 1px solid #dce5ef; border-radius: 20px; background: #fff; text-align: center; }
  .moderation-gate-card > svg { color: #20b6d8; }
  .moderation-gate-card h1 { font-family: "Syne", Arial, sans-serif; }
  .moderation-gate-card p { color: #65738a; line-height: 1.55; }
  .moderation-gate-card button { padding: 12px 17px; border: 0; border-radius: 11px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  @media (max-width: 850px) { .moderation-layout { display: block; } .moderation-layout .sidebar { position: static; height: auto; padding: 16px; border-right: 0; border-bottom: 1px solid #e2e9f2; } .moderation-layout .brand { margin-bottom: 14px; } .moderation-layout .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .moderation-layout .side-link { width: auto; min-width: max-content; padding: 10px 12px; font-size: 13px; } .moderation-layout .sidebar .sidebar-logout { display: none; } .moderation-content { padding: 24px 16px 40px; } }
  @media (max-width: 520px) { .moderation-content { padding: 20px 12px 32px; } .toolbar { align-items: flex-start; } .filters { gap: 6px; } .filter, .refresh-button { min-height: 39px; padding: 8px 10px; font-size: 12px; } .moderation-card { padding: 16px; } .post-topline { align-items: flex-start; } .post-topline time { max-width: 55%; text-align: right; } }
`;
