"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";
import { SEED_POSTS, loadStoredComments, appendStoredComment } from "./posts";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none"><path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" /><ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" fill="currentColor" stroke="none" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "image") return <svg {...shared}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m4 18 5-5 4 4 3-3 4 4" /></svg>;
  if (name === "tag") return <svg {...shared}><path d="m20.6 12-8-8H4v8.6l8 8a2 2 0 0 0 2.8 0l5.8-5.8a2 2 0 0 0 0-2.8Z" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" /></svg>;
  if (name === "gem") return <svg {...shared}><polygon points="12 2 22 8 12 22 2 8" /></svg>;
  if (name === "comment") return <svg {...shared}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>;
  if (name === "share") return <svg {...shared}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.6 15.4 6.9M8.6 13.4l6.8 3.7" /></svg>;
  if (name === "bookmark") return <svg {...shared}><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
  if (name === "pin") return <svg {...shared}><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

function loadStoredReports() {
  try {
    const reports = JSON.parse(localStorage.getItem("cybersafeReports") || "[]");
    const latest = JSON.parse(sessionStorage.getItem("cybersafeLatestReport") || "null");
    sessionStorage.removeItem("cybersafeLatestReport");
    return latest ? [latest, ...reports] : reports;
  } catch {
    return [];
  }
}

const TRENDING = [
  { tag: "ALERT · GAUTENG", title: "Eskom WhatsApp Bill Refund Scam", meta: "1.2k community members warning" },
  { tag: "EDUCATION", title: "Cyberbullying resources for schools", meta: "Adopted by 45 SA high schools" },
  { tag: "BANKING SAFETY", title: "Capitec / FNB OTP Phishing", meta: "Crucial advice for students" },
];

const CATEGORIES = ["General Tip", "Scam Alert", "Cyberbullying", "Phishing", "Malware"];
const CURRENT_USER = { name: "Sipho Ndlovu", role: "Gauteng Community" };

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openShareId, setOpenShareId] = useState(null);
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [pendingImage, setPendingImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  const links = DASHBOARD_NAV;
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = links.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = links.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
    try {
      const pendingSubmissionMessage = sessionStorage.getItem("cybersafePendingSubmission");
      if (pendingSubmissionMessage) {
        showToast(pendingSubmissionMessage);
        sessionStorage.removeItem("cybersafePendingSubmission");
      }
    } catch {
      // The feed can load normally if session storage is unavailable.
    }

    async function loadPosts() {
      const withComments = (list) =>
        list.map((post) => {
          const stored = loadStoredComments(post.id);
          return {
            ...post,
            commentsList: [...(post.topComments || []), ...stored],
            comments: (post.comments || 0) + stored.length,
            liked: false,
            saved: false,
          };
        });

      const reports = loadStoredReports();

      if (!isSupabaseConfigured) {
        setPosts(withComments([...reports, ...SEED_POSTS]));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("posts").select("*").eq("status", "approved").order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading posts:", error);
        setPosts(withComments([...reports, ...SEED_POSTS]));
        setLoading(false);
        return;
      }

      const databasePosts = (data || []).map((post) => ({
        id: post.id,
        name: post.display_name,
        time: new Date(post.created_at).toLocaleString(),
        text: post.description,
        location: post.location,
        image: post.image_url,
        likes: 0,
        comments: 0,
      }));

      setPosts(withComments([...reports, ...databasePosts, ...SEED_POSTS]));
      setLoading(false);
    }
    loadPosts();
  }, []);

  const unreadTrending = useMemo(() => TRENDING, []);

  function likePost(index) {
    setPosts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], liked: !updated[index].liked, likes: updated[index].likes + (updated[index].liked ? -1 : 1) };
      return updated;
    });
  }

  function savePost(index) {
    setPosts((prev) => {
      const updated = [...prev];
      const nowSaved = !updated[index].saved;
      updated[index] = { ...updated[index], saved: nowSaved };
      showToast(nowSaved ? "Post saved" : "Removed from saved posts");
      return updated;
    });
  }

  function deleteReport(id) {
    if (!window.confirm("Remove this report from your feed?")) return;
    setPosts((current) => current.filter((post) => post.id !== id));
    setOpenMenuId(null);
    try {
      const reports = JSON.parse(localStorage.getItem("cybersafeReports") || "[]");
      localStorage.setItem("cybersafeReports", JSON.stringify(reports.filter((report) => report.id !== id)));
    } catch {
      // Feed state is already updated; storage may be unavailable.
    }
    showToast("Report deleted");
  }

  function hidePost(id) {
    setPosts((current) => current.filter((post) => post.id !== id));
    setOpenMenuId(null);
    showToast("Post hidden");
  }

  function reportPost(id) {
    setOpenMenuId(null);
    showToast("Post reported. Thank you for keeping the community safe.");
  }

  function copyPostLink(id) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/post?id=${encodeURIComponent(id)}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied to clipboard")).catch(() => showToast("Couldn't copy the link"));
    } else {
      showToast("Couldn't copy the link");
    }
    setOpenShareId(null);
  }

  function sharePost(destination) {
    setOpenShareId(null);
    showToast(`Shared to ${destination}`);
  }

  function toggleComments(id) {
    setOpenCommentsId((current) => (current === id ? null : id));
  }

  function submitComment(index) {
    const post = posts[index];
    const text = (commentDrafts[post.id] || "").trim();
    if (!text) return;
    const comment = { name: CURRENT_USER.name, text, time: "Just now" };
    appendStoredComment(post.id, comment);
    setPosts((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], commentsList: [...updated[index].commentsList, comment], comments: updated[index].comments + 1 };
      return updated;
    });
    setCommentDrafts((current) => ({ ...current, [post.id]: "" }));
  }

  function handleImageAttach(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result);
    reader.readAsDataURL(file);
  }

  function removeImageAttachment() {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submitPost(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed && !pendingImage) {
      showToast("Write something or attach an image first");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      setIsPosting(true);
      const { error } = await supabase.from("posts").insert({
        author_id: null,
        display_name: CURRENT_USER.name,
        description: trimmed || "(shared an image)",
        issues: category === "General Tip" ? [] : [category],
        image_url: pendingImage,
        status: "pending",
      });
      setIsPosting(false);
      if (error) {
        console.error("Could not submit community post for review:", error);
        showToast("Could not submit. Please try again.");
        return;
      }
      setDraft("");
      setCategory(CATEGORIES[0]);
      removeImageAttachment();
      showToast("Submitted for moderator review");
      return;
    }

    const newPost = {
      id: `report-${Date.now()}`,
      name: "You",
      time: "Just now",
      text: trimmed || "(shared an image)",
      issues: category === "General Tip" ? undefined : [category],
      image: pendingImage,
      likes: 0,
      comments: 0,
      commentsList: [],
      liked: false,
      saved: false,
    };
    setPosts((current) => [newPost, ...current]);
    try {
      const reports = JSON.parse(localStorage.getItem("cybersafeReports") || "[]");
      localStorage.setItem("cybersafeReports", JSON.stringify([newPost, ...reports]));
    } catch {
      // Post is already visible in this session even if storage fails.
    }
    setDraft("");
    setCategory(CATEGORIES[0]);
    removeImageAttachment();
    showToast("Posted to the community feed");
  }

  return (
    <main className="feed-dashboard">
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
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/feed" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={19} /><span>{label}</span></button>)}
        </nav>
        <LogoutButton />
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {primaryNav.map(([label, route, icon]) => (
          <button key={label} type="button" className={`bottom-nav-item ${route === "/feed" ? "active" : ""}`} onClick={() => router.push(route)}>
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
            <div className="title-row"><h1>Community Safety Feed</h1><span>South Africa Active</span></div>
            <p>Stay updated with the latest scams, alerts, and cybersecurity advice across South Africa.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={18} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

        <div className="content-grid">
          <div className="feed-column">
            <form className="composer" onSubmit={submitPost}>
              <div className="composer-top">
                <div className="composer-avatar">{initials(CURRENT_USER.name)}</div>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share a warning, question, or cyber safety tip with your community..." aria-label="Share a post" />
              </div>

              {pendingImage && (
                <div className="composer-image-preview">
                  <img src={pendingImage} alt="Attached evidence" />
                  <button type="button" onClick={removeImageAttachment} aria-label="Remove image"><Icon name="close" size={12} /></button>
                </div>
              )}

              <div className="composer-bottom">
                <div className="composer-tools">
                  <label className="tool">
                    <Icon name="image" size={14} />Image/Evidence
                    <input ref={fileInputRef} type="file" accept="image/*" className="visually-hidden" onChange={handleImageAttach} />
                  </label>
                  <label className="tool category-picker"><Icon name="tag" size={14} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Post category">{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                </div>
                <button type="submit" className="post-button" disabled={isPosting}>{isPosting ? "Submitting…" : "Post Safety Alert"}</button>
              </div>
            </form>

            {loading && <p className="loading-state">Loading community feed...</p>}

            {!loading && posts.map((post, index) => (
              <article className="post-card" key={post.id || index}>
                <div className="post-header">
                  <div className="post-user">
                    {post.profile ? <img src={post.profile} alt="" className="avatar-img" /> : <div className="avatar-img avatar-fallback">{initials(post.name)}</div>}
                    <div>
                      <div className="name-row"><strong>{post.name}</strong>{post.issues?.[0] && <span className="badge">{String(post.issues[0]).toUpperCase()}</span>}</div>
                      <small>{post.role ? `${post.role} · ` : ""}{post.time}</small>
                    </div>
                  </div>
                  <div className="menu-wrap">
                    <button className="menu-button" type="button" aria-label={`Options for ${post.name}'s post`} onClick={() => setOpenMenuId((current) => (current === post.id ? null : post.id))}>•••</button>
                    {openMenuId === post.id && (
                      <div className="menu-popup">
                        <button type="button" onClick={() => reportPost(post.id)}>Report post</button>
                        <button type="button" onClick={() => hidePost(post.id)}>Hide post</button>
                        {post.id?.startsWith("report-") && <button type="button" className="delete-button" onClick={() => deleteReport(post.id)}>Delete report</button>}
                      </div>
                    )}
                  </div>
                </div>

                <p className="post-text">{post.text}</p>
                {post.location && <p className="post-meta"><Icon name="pin" size={12} />{post.location}</p>}
                {post.incidentDate && <p className="post-meta">Incident date: {post.incidentDate}</p>}
                {post.image && <img src={post.image} alt="" className="post-image" />}

                <div className="post-actions">
                  <div className="left-actions">
                    <button type="button" className={`action-button ${post.liked ? "liked" : ""}`} onClick={() => likePost(index)}><Icon name="gem" size={14} />{post.likes} Helpful</button>
                    <button type="button" className="action-button" onClick={() => toggleComments(post.id)}><Icon name="comment" size={14} />{post.comments} Comments</button>
                    <div className="share-wrap">
                      <button type="button" className="action-button" onClick={() => setOpenShareId((current) => (current === post.id ? null : post.id))}><Icon name="share" size={14} />Share</button>
                      {openShareId === post.id && (
                        <div className="menu-popup share-popup">
                          <button type="button" onClick={() => copyPostLink(post.id)}>Copy link</button>
                          <button type="button" onClick={() => sharePost("WhatsApp")}>Share to WhatsApp</button>
                          <button type="button" onClick={() => sharePost("Community Feed")}>Repost to feed</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="button" className={`save-button ${post.saved ? "saved" : ""}`} onClick={() => savePost(index)} aria-label="Save post"><Icon name="bookmark" size={14} />{post.saved ? "Saved" : "Save"}</button>
                </div>

                {openCommentsId === post.id && (
                  <div className="comments-panel">
                    <div className="comments-list">
                      {post.commentsList.map((comment, cIndex) => (
                        <div className="comment-item" key={cIndex}>
                          <div className="comment-avatar">{initials(comment.name)}</div>
                          <div className="comment-bubble">
                            <span className="c-name">{comment.name}</span><span className="c-time">{comment.time}</span>
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      {!post.commentsList.length && <p className="no-comments">Be the first to comment.</p>}
                    </div>
                    <div className="comment-input-row">
                      <div className="comment-avatar">{initials(CURRENT_USER.name)}</div>
                      <input
                        placeholder="Write a comment..."
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        onKeyDown={(event) => { if (event.key === "Enter") submitComment(index); }}
                      />
                      <button type="button" onClick={() => submitComment(index)}>Post</button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <aside className="feed-side">
            <section className="incident-card">
              <span className="incident-icon"><Icon name="phone" size={18} /></span>
              <h2>Cyber Incident?</h2>
              <small>Immediate assistance is ready</small>
              <p>If you've been phished, hacked, or are facing cyberbullying, use our specialized South African hotlines.</p>
              <button type="button" onClick={() => router.push("/help")}>Access Cyber Helpline</button>
            </section>

            <section className="trending-card">
              <h2>Trending in South Africa</h2>
              <div className="trending-list">
                {unreadTrending.map((item) => (
                  <div className="trending-item" key={item.title}>
                    <small>{item.tag}</small>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}

      <style>{`
        * { box-sizing: border-box; }
        .visually-hidden { position: absolute; width: 16px; height: 16px; padding: 0; margin: 2px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        /* ============================================================
           BASE = PHONE. Everything below, with no media query, is the
           default mobile layout. Tablet/desktop are added on top via
           min-width queries further down.
        ============================================================ */
        .feed-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 14px 6px; border-right: 1px solid #0d3557; background: #00243A; overflow-y: auto; }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; }
        .brand-icon { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 8px; background: rgba(235,99,15,.22); color: #EB630F; }
        .brand span:not(.brand-icon) { display: none; }

        .side-nav { display: grid; gap: 4px; margin-top: 20px; width: 100%; }
        .side-link { display: flex; align-items: center; justify-content: center; gap: 0; width: 100%; padding: 11px 0; border: 0; border-radius: 9px; background: transparent; color: #fff; cursor: pointer; font: inherit; font-size: 11px; font-weight: 600; text-align: left; min-height: 42px; }
        .side-link span { display: none; }
        .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; }
        .side-link.active svg { color: #EB630F; }

        .side-divider { width: 100%; height: 1px; margin: 6px 0; background: #e2e9f2; }
        .footer-links { display: none; }
        .emergency-card { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; margin-top: 14px; padding: 10px 4px; border: 2px solid #ff5a5f; border-radius: 10px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: center; }
        .emergency-card span:not(.emergency-icon) { display: none; }
        .emergency-card strong, .emergency-card small, .emergency-card b { display: block; }
        .user-chip { display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 10px; padding: 6px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font: inherit; }
        .user-chip:hover { background: #f6f9fd; }
        .chip-avatar { display: grid; place-items: center; width: 26px; height: 26px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; font-size: 10px; }
        .user-chip span:not(.chip-avatar) { display: none; }
        .user-chip strong { display: block; font-size: 11px; }
        .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 18px 12px 28px; }
        .page-header { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid #dce5ef; }
        .page-intro { min-width: 0; }
        .title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        h1, h2, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        h1 { margin: 0; font-size: 20px; letter-spacing: -0.6px; }
        .title-row span { padding: 5px 10px; border-radius: 999px; background: #e7f9f0; color: #16bf89; font-size: 10px; font-weight: 800; }
        .page-intro p { max-width: 100%; margin: 8px 0 0; color: #5b6980; font-size: 13px; line-height: 1.4; }

        .header-actions { display: flex; flex-direction: column; align-items: stretch; gap: 8px; width: 100%; }
        .platform-search { display: flex; align-items: center; gap: 8px; width: 100%; padding: 0 14px; border: 1px solid #dce5ef; border-radius: 9px; background: #fff; color: #536179; }
        .platform-search input { width: 100%; height: 44px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 13px; }
        .help-button { border: 0; border-radius: 9px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; min-height: 44px; padding: 0 20px; white-space: nowrap; }

        .content-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin: 18px auto 0; align-items: start; max-width: 560px; width: 100%; }
        .feed-column { display: grid; gap: 12px; }
        .composer { padding: 14px; border: 1px solid #dce5ef; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); }
        .composer-top { display: flex; align-items: center; gap: 10px; }
        .composer-avatar { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-weight: 800; }
        .composer-top input { flex: 1; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 14px; min-height: 34px; }

        .composer-image-preview { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 6px; border: 1px solid #eef2f7; border-radius: 8px; background: #f8fafc; }
        .composer-image-preview img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
        .composer-image-preview button { margin-left: auto; border: 1px solid #dce5ef; background: #fff; border-radius: 6px; color: #536179; cursor: pointer; padding: 6px; display: grid; place-items: center; min-width: 32px; min-height: 32px; }

        .composer-bottom { display: flex; flex-direction: column; align-items: stretch; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
        .composer-tools { display: flex; gap: 16px; }
        .tool { display: flex; align-items: center; gap: 6px; color: #536179; font-size: 12px; font-weight: 700; cursor: pointer; }
        .category-picker select { border: 0; background: transparent; color: #536179; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .post-button { border: 0; border-radius: 9px; padding: 12px 16px; background: #EB630F; color: #00243A; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; width: 100%; min-height: 42px; }

        .loading-state { padding: 22px; text-align: center; color: #65738a; }
        .post-card { padding: 15px; border: 1px solid #dce5ef; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); }
        .post-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .post-user { display: flex; gap: 9px; align-items: center; min-width: 0; }
        .avatar-img { width: 36px; height: 36px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
        .avatar-fallback { display: grid; place-items: center; background: #FDEAE0; color: #C24F0C; font-weight: 800; }
        .name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .name-row strong { font-size: 13px; }
        .badge { padding: 3px 7px; border-radius: 999px; background: #fdecec; color: #d92d20; font-size: 10px; font-weight: 800; }
        .post-user small { color: #8996a8; font-size: 11px; }

        .menu-wrap, .share-wrap { position: relative; }
        .menu-button { border: 0; background: transparent; color: #8996a8; cursor: pointer; font-size: 16px; font-weight: 800; padding: 6px; min-width: 32px; min-height: 32px; }
        .menu-popup { position: absolute; z-index: 3; top: 30px; right: 0; min-width: 160px; padding: 4px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; box-shadow: 0 8px 20px rgba(14,27,36,.16); display: grid; }
        .menu-popup button { width: 100%; padding: 10px; border: 0; border-radius: 5px; background: transparent; color: #26324a; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; text-align: left; }
        .menu-popup button:hover { background: #f6f9fd; }
        .menu-popup button.delete-button { color: #d92d20; }
        .share-popup { left: 0; right: auto; top: auto; bottom: 34px; }

        .post-text { margin: 12px 0 0; color: #26324a; font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
        .post-meta { display: flex; align-items: center; gap: 5px; margin: 8px 0 0; color: #65738a; font-size: 12px; font-weight: 600; }
        .post-image { width: 100%; margin-top: 12px; border-radius: 9px; object-fit: cover; max-height: 260px; }

        .post-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding-top: 14px; border-top: 1px solid #eef2f7; }
        .left-actions { display: flex; gap: 14px; }
        .action-button { display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; min-height: 32px; }
        .action-button.liked { color: #C24F0C; }
        .save-button { display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; min-height: 32px; }
        .save-button.saved { color: #00243A; }

        .comments-panel { margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
        .comments-list { display: grid; gap: 11px; margin-bottom: 12px; }
        .no-comments { margin: 0 0 12px; color: #8996a8; font-size: 12px; }
        .comment-item { display: flex; gap: 8px; }
        .comment-avatar { display: grid; place-items: center; width: 26px; height: 26px; flex: 0 0 auto; border-radius: 50%; background: #FDEAE0; color: #C24F0C; font-size: 11px; font-weight: 800; }
        .comment-bubble { flex: 1; padding: 9px 11px; border-radius: 9px; background: #f6f9fd; }
        .c-name { font-size: 12px; font-weight: 800; color: #00243A; }
        .c-time { margin-left: 6px; font-size: 11px; color: #8996a8; font-weight: 600; }
        .comment-bubble p { margin: 3px 0 0; color: #26324a; font-size: 13px; line-height: 1.45; }
        .comment-input-row { display: flex; align-items: center; gap: 8px; }
        .comment-input-row input { flex: 1; min-height: 40px; border: 1px solid #dce5ef; border-radius: 999px; padding: 0 14px; font: inherit; font-size: 13px; outline: none; }
        .comment-input-row input:focus { border-color: #EB630F; box-shadow: 0 0 0 3px #FDEAE0; }
        .comment-input-row button { border: 0; background: #EB630F; color: #00243A; font-weight: 800; font-size: 12px; padding: 0 14px; min-height: 40px; border-radius: 999px; cursor: pointer; flex: 0 0 auto; }

        .feed-side { display: grid; gap: 14px; }
        .incident-card, .trending-card { padding: 16px; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); }
        .incident-card { border: 2px solid #ffb3b7; background: #fff8f8; }
        .incident-icon { display: grid; place-items: center; width: 34px; height: 34px; margin-bottom: 10px; border-radius: 50%; background: #fff; color: #ff5158; }
        .incident-card h2 { margin: 0; font-size: 15px; }
        .incident-card small { display: block; margin: 3px 0 10px; color: #d92d20; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .incident-card p { margin: 0 0 14px; color: #65738a; font-size: 12px; line-height: 1.45; }
        .incident-card button { width: 100%; padding: 12px; border: 0; border-radius: 9px; background: #ff5158; color: #fff; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; min-height: 42px; }
        .trending-card h2 { margin: 0 0 14px; font-size: 15px; }
        .trending-list { display: grid; gap: 12px; }
        .trending-item small { color: #C24F0C; font-size: 10px; font-weight: 800; letter-spacing: .03em; }
        .trending-item strong { display: block; margin: 4px 0 3px; font-size: 13px; }
        .trending-item p { margin: 0; color: #8996a8; font-size: 12px; }

        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #00243A; color: #fff; font-size: 12px; font-weight: 700; padding: 11px 18px; border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,.25); z-index: 60; max-width: calc(100vw - 32px); text-align: center; }

        /* ============================================================
           TABLET AND UP (min-width: 851px) — sidebar widens, labels
           reappear, footer links and header actions go horizontal.
        ============================================================ */
        .sidebar { display: none; }

        .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #00243A; border-bottom: 2px solid #EB630F; }
        .mobile-topbar-menu { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #fff; cursor: pointer; }
        .mobile-topbar-brand { display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: #fff; cursor: pointer; font: inherit; padding: 0; }
        .mobile-topbar-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(235,99,15,.22); color: #EB630F; }
        .mobile-topbar-brand strong { font-size: 15px; letter-spacing: -0.3px; }
        .mobile-topbar-bell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #fff; cursor: pointer; }

        .dashboard-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); }

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

        .dashboard-content { padding-bottom: 78px; }

        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .mobile-topbar { display: none; }
          .bottom-nav, .nav-menu-overlay { display: none; }
          .dashboard-content { padding-top: 30px; padding-bottom: 36px; }
          .feed-dashboard { grid-template-columns: 168px minmax(0, 1fr); }
          .sidebar { align-items: stretch; padding: 22px 16px 20px; }
          .brand span:not(.brand-icon) { display: block; }
          .brand strong { font-size: 15px; }
          .brand small { display: block; margin-top: 4px; font-size: 11px; }
          .side-nav { margin-top: 24px; gap: 6px; }
          .side-link { justify-content: flex-start; gap: 10px; padding: 10px 10px; font-size: 12px; }
          .side-link span { display: inline; }
          .footer-links { display: grid; gap: 2px; margin-top: auto; padding-top: 12px; }
          .footer-link { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; text-align: left; }
          .footer-link:hover { color: #536179; }
          .emergency-card { flex-direction: row; align-items: flex-start; text-align: left; padding: 14px; }
          .emergency-card span:not(.emergency-icon) { display: block; }
          .emergency-card strong { font-size: 12px; }
          .emergency-card small { margin: 8px 0 5px; font-size: 11px; }
          .user-chip { justify-content: flex-start; }
          .user-chip span:not(.chip-avatar) { display: block; }
          .user-chip strong { font-size: 11px; }

          .dashboard-content { padding: 24px 20px 36px; }
          .page-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
          h1 { white-space: nowrap; font-size: clamp(19px, 3.4vw, 23px); }
          .header-actions { flex-direction: row; align-items: center; width: auto; }
          .platform-search { width: 200px; }
          .composer-bottom { flex-direction: row; align-items: center; justify-content: space-between; }
          .post-button { width: auto; }
        }

        /* ============================================================
           DESKTOP (min-width: 1181px) — full sidebar width, two-column
           feed layout with the trending/emergency side column visible.
        ============================================================ */
        @media (min-width: 1181px) {
          .feed-dashboard { grid-template-columns: 230px minmax(0, 1fr); }
          .sidebar { padding: 24px 22px 22px; }
          .side-link { font-size: 14px; }
          .dashboard-content { padding: 30px 34px 45px; }
          .content-grid { grid-template-columns: minmax(0, 2.1fr) minmax(240px, 0.82fr); gap: 21px; max-width: none; margin-left: 0; margin-right: 0; }
          .feed-side { position: sticky; top: 24px; align-self: start; max-height: calc(100vh - 48px); overflow-y: auto; scrollbar-width: none; }
          .feed-side::-webkit-scrollbar { display: none; }
          .platform-search { width: 245px; }
        }
`}</style>
    </main>
  );
}
