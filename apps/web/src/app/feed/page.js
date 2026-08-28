"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";
import { SEED_POSTS, loadStoredComments, appendStoredComment } from "./posts";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
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
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  const links = DASHBOARD_NAV;

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
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

  function submitPost(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed && !pendingImage) {
      showToast("Write something or attach an image first");
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
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/feed" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={24} /><span>{label}</span></button>)}
        </nav>
        <button className="emergency-card" type="button" onClick={() => router.push("/help")}><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span></button>
      </aside>

      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Community Safety Feed</h1><span>South Africa Active</span></div>
            <p>Stay updated with the latest scams, alerts, and cybersecurity advice across South Africa.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={22} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
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
                  <button type="button" onClick={removeImageAttachment} aria-label="Remove image"><Icon name="close" size={14} /></button>
                </div>
              )}

              <div className="composer-bottom">
                <div className="composer-tools">
                  <label className="tool">
                    <Icon name="image" size={18} />Image/Evidence
                    <input ref={fileInputRef} type="file" accept="image/*" className="visually-hidden" onChange={handleImageAttach} />
                  </label>
                  <label className="tool category-picker"><Icon name="tag" size={18} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Post category">{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                </div>
                <button type="submit" className="post-button">Post Safety Alert</button>
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
                {post.location && <p className="post-meta"><Icon name="pin" size={14} />{post.location}</p>}
                {post.incidentDate && <p className="post-meta">Incident date: {post.incidentDate}</p>}
                {post.image && <img src={post.image} alt="" className="post-image" />}

                <div className="post-actions">
                  <div className="left-actions">
                    <button type="button" className={`action-button ${post.liked ? "liked" : ""}`} onClick={() => likePost(index)}><Icon name="gem" size={17} />{post.likes} Helpful</button>
                    <button type="button" className="action-button" onClick={() => toggleComments(post.id)}><Icon name="comment" size={17} />{post.comments} Comments</button>
                    <div className="share-wrap">
                      <button type="button" className="action-button" onClick={() => setOpenShareId((current) => (current === post.id ? null : post.id))}><Icon name="share" size={17} />Share</button>
                      {openShareId === post.id && (
                        <div className="menu-popup share-popup">
                          <button type="button" onClick={() => copyPostLink(post.id)}>Copy link</button>
                          <button type="button" onClick={() => sharePost("WhatsApp")}>Share to WhatsApp</button>
                          <button type="button" onClick={() => sharePost("Community Feed")}>Repost to feed</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="button" className={`save-button ${post.saved ? "saved" : ""}`} onClick={() => savePost(index)} aria-label="Save post"><Icon name="bookmark" size={18} />{post.saved ? "Saved" : "Save"}</button>
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
              <span className="incident-icon"><Icon name="phone" size={22} /></span>
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
        .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .feed-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; overflow-y: auto; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .side-divider { height: 1px; margin: 8px 4px; background: #e2e9f2; } .footer-links { display: grid; gap: 3px; margin-top: auto; padding-top: 14px; } .footer-link { display: flex; align-items: center; gap: 10px; padding: 9px 17px; border: 0; background: transparent; color: #8996a8; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; text-align: left; } .footer-link:hover { color: #536179; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: 18px; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; }
        .user-chip { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 12px; padding: 8px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; font: inherit; text-align: left; } .user-chip:hover { background: #f6f9fd; } .chip-avatar { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-weight: 800; font-size: 13px; } .user-chip strong { display: block; font-size: 13px; } .user-chip small { display: block; color: #8996a8; font-size: 11px; font-weight: 600; }

        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } .title-row { display: flex; align-items: center; gap: 12px; } h1, h2, strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(30px, 3.4vw, 42px); letter-spacing: -2px; } .title-row span { padding: 7px 14px; border-radius: 999px; background: #e7f9f0; color: #16bf89; font-size: 13px; font-weight: 800; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; } .platform-search { display: flex; align-items: center; gap: 10px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 15px; } .help-button { border: 0; border-radius: 14px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; min-height: 50px; padding: 0 23px; white-space: nowrap; }

        .content-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr); gap: 26px; margin-top: 26px; align-items: start; }
        .feed-column { display: grid; gap: 18px; }
        .composer { padding: 22px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .composer-top { display: flex; align-items: center; gap: 14px; } .composer-avatar { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-weight: 800; } .composer-top input { flex: 1; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 15px; }
        .composer-image-preview { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 8px; border: 1px solid #eef2f7; border-radius: 12px; background: #f8fafc; } .composer-image-preview img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; } .composer-image-preview button { margin-left: auto; border: 0; background: #fff; border: 1px solid #dce5ef; border-radius: 8px; color: #536179; cursor: pointer; padding: 6px; display: grid; place-items: center; }
        .composer-bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eef2f7; flex-wrap: wrap; } .composer-tools { display: flex; gap: 18px; } .tool { display: flex; align-items: center; gap: 7px; color: #536179; font-size: 13px; font-weight: 700; cursor: pointer; } .category-picker select { border: 0; background: transparent; color: #536179; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; } .post-button { border: 0; border-radius: 12px; padding: 12px 20px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }

        .loading-state { padding: 30px; text-align: center; color: #65738a; }
        .post-card { padding: 24px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .post-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; } .post-user { display: flex; gap: 12px; align-items: center; } .avatar-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; } .avatar-fallback { display: grid; place-items: center; background: #e6faff; color: #20b6d8; font-weight: 800; } .name-row { display: flex; align-items: center; gap: 9px; } .name-row strong { font-size: 15px; } .badge { padding: 4px 9px; border-radius: 999px; background: #fdecec; color: #d92d20; font-size: 11px; font-weight: 800; } .post-user small { color: #8996a8; font-size: 12px; }
        .menu-wrap, .share-wrap { position: relative; } .menu-button { border: 0; background: transparent; color: #8996a8; cursor: pointer; font-size: 18px; font-weight: 800; padding: 0 4px; } .menu-popup { position: absolute; z-index: 3; top: 26px; right: 0; min-width: 160px; padding: 5px; border: 1px solid #dce5ef; border-radius: 10px; background: #fff; box-shadow: 0 8px 20px rgba(14,27,36,.16); display: grid; } .menu-popup button { width: 100%; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: #26324a; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; } .menu-popup button:hover { background: #f6f9fd; } .menu-popup button.delete-button { color: #d92d20; } .share-popup { left: 0; right: auto; top: auto; bottom: 30px; }
        .post-text { margin: 16px 0 0; color: #26324a; font-size: 15px; line-height: 1.5; white-space: pre-wrap; } .post-meta { display: flex; align-items: center; gap: 6px; margin: 10px 0 0; color: #65738a; font-size: 13px; font-weight: 600; } .post-image { width: 100%; margin-top: 14px; border-radius: 14px; object-fit: cover; max-height: 320px; }
        .post-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding-top: 16px; border-top: 1px solid #eef2f7; } .left-actions { display: flex; gap: 22px; } .action-button { display: flex; align-items: center; gap: 7px; border: 0; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; } .action-button.liked { color: #20b6d8; } .save-button { display: flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; } .save-button.saved { color: #121a32; }

        .comments-panel { margin-top: 16px; padding-top: 16px; border-top: 1px solid #eef2f7; } .comments-list { display: grid; gap: 14px; margin-bottom: 14px; } .no-comments { margin: 0 0 14px; color: #8996a8; font-size: 13px; }
        .comment-item { display: flex; gap: 10px; } .comment-avatar { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border-radius: 50%; background: #e6faff; color: #20b6d8; font-size: 12px; font-weight: 800; } .comment-bubble { flex: 1; padding: 10px 13px; border-radius: 12px; background: #f6f9fd; } .c-name { font-size: 12.5px; font-weight: 800; color: #121a32; } .c-time { margin-left: 6px; font-size: 11px; color: #8996a8; font-weight: 600; } .comment-bubble p { margin: 4px 0 0; color: #26324a; font-size: 13.5px; line-height: 1.4; }
        .comment-input-row { display: flex; align-items: center; gap: 10px; } .comment-input-row input { flex: 1; border: 1px solid #dce5ef; border-radius: 999px; padding: 10px 16px; font: inherit; font-size: 13.5px; outline: none; } .comment-input-row input:focus { border-color: #31c7e6; box-shadow: 0 0 0 3px #e6faff; } .comment-input-row button { border: 0; background: #31c7e6; color: #102039; font-weight: 800; font-size: 12.5px; padding: 10px 16px; border-radius: 999px; cursor: pointer; flex: 0 0 auto; }

        .feed-side { display: grid; gap: 20px; } .incident-card, .trending-card { padding: 24px; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .incident-card { border: 2px solid #ffb3b7; background: #fff8f8; } .incident-icon { display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: 12px; border-radius: 50%; background: #fff; color: #ff5158; } .incident-card h2 { margin: 0; font-size: 19px; } .incident-card small { display: block; margin: 4px 0 12px; color: #d92d20; font-size: 12px; font-weight: 800; text-transform: uppercase; } .incident-card p { margin: 0 0 18px; color: #65738a; font-size: 14px; line-height: 1.4; } .incident-card button { width: 100%; padding: 13px; border: 0; border-radius: 13px; background: #ff5158; color: #fff; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
        .trending-card h2 { margin: 0 0 16px; font-size: 19px; } .trending-list { display: grid; gap: 18px; } .trending-item small { color: #20b6d8; font-size: 11px; font-weight: 800; letter-spacing: .03em; } .trending-item strong { display: block; margin: 6px 0 4px; font-size: 15px; } .trending-item p { margin: 0; color: #8996a8; font-size: 13px; }

        .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #121a32; color: #fff; font-size: 13px; font-weight: 700; padding: 12px 22px; border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,.25); z-index: 60; }

        @media (max-width: 1180px) { .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 850px) { .feed-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .side-divider, .footer-links, .emergency-card, .user-chip { display: none; } .dashboard-content { padding: 27px 18px 45px; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 27px; } .page-header { flex-direction: column; align-items: flex-start; } .header-actions { width: 100%; flex-direction: column; } .platform-search { width: 100%; } .composer-bottom { flex-direction: column; align-items: stretch; } .post-button { width: 100%; } .left-actions { gap: 14px; } }
      `}</style>
    </main>
  );
}
