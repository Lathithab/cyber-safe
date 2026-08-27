"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
function loadReports() {
  try {
    const reports = JSON.parse(
      localStorage.getItem("cybersafeReports") || "[]",
    );
    const latest = JSON.parse(
      sessionStorage.getItem("cybersafeLatestReport") || "null",
    );
    sessionStorage.removeItem("cybersafeLatestReport");
    return latest ? [latest, ...reports] : reports;
  } catch {
    return [];
  }
}

export default function FeedPage() {
  const router = useRouter();
  


  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeNav, setActiveNav] = useState("feed");
  const [openMenuId, setOpenMenuId] = useState(null);

 useEffect(() => {
  async function loadPosts() {
    if (!isSupabaseConfigured) {
      setPosts(loadReports());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      setError(error.message);
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
      liked: false,
      saved: false,
    }));

    setPosts(databasePosts);
    setLoading(false);
  }

  loadPosts();
}, []);
if (loading) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      Loading community feed...
    </div>
  );
}

if (error) {
  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#b42318" }}>
      {error}
    </div>
  );
}


  function openPost(id) {
    if (!id) return;
    router.push(`/post?id=${encodeURIComponent(id)}`);
  }

  // ── ICONS ─────────────────────────────

  function gemSVG(liked) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={liked ? "#30C9E8" : "none"}
        stroke={liked ? "#30C9E8" : "#000"}
        strokeWidth="2"
      >
        <polygon points="12 2 22 8 12 22 2 8" />
      </svg>
    );
  }

  function commentSVG() {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#bbb"
        strokeWidth="2"
      >
        <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
      </svg>
    );
  }

  function bookmarkSVG(saved) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={saved ? "#000" : "none"}
        stroke="#000"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    );
  }

  function searchSVG() {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#bbb"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    );
  }

  // ── ACTIONS ───────────────────────────

  function likePost(i) {
    setPosts((prev) => {
      const updated = [...prev];
      updated[i].liked = !updated[i].liked;
      updated[i].likes += updated[i].liked ? 1 : -1;
      return updated;
    });
  }

  function savePost(i) {
    setPosts((prev) => {
      const updated = [...prev];
      updated[i].saved = !updated[i].saved;
      return updated;
    });
  }

  function deleteReport(id) {
    if (!window.confirm("Remove this report from your feed?")) return;

    setPosts((current) => current.filter((post) => post.id !== id));
    setOpenMenuId(null);

    try {
      const reports = JSON.parse(
        localStorage.getItem("cybersafeReports") || "[]",
      );
      localStorage.setItem(
        "cybersafeReports",
        JSON.stringify(reports.filter((report) => report.id !== id)),
      );
    } catch {
      // The visible feed has already been updated; storage may be unavailable.
    }
  }

  // ── UI ────────────────────────────────

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.topBar}>
          <div style={{ width: 40 }} />

          <div style={styles.logoSection}>
            <h1 style={styles.logo}>CyberSafe</h1>
            <p style={styles.sub}>Community & Social</p>
          </div>

          <div style={styles.icons}>
            <svg
              style={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M15 17h5l-1.4-1.4C18.8 14.8 18 13.5 18 12V9a6 6 0 10-12 0v3c0 1.5-.8 2.8-1.6 3.6L3 17h5" />
            </svg>

            <svg
              style={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>

        <h2 style={styles.title}>Feed</h2>

        <div style={styles.searchBox}>
          {searchSVG()}
          <input
            style={styles.searchInput}
            placeholder="Search posts, topics or users..."
          />
        </div>
      </div>

      {/* FEED */}
      <div style={styles.feed}>
        {posts.map((p, i) => (
          <div
            key={p.id || i}
            style={styles.card}
            onClick={() => openPost(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openPost(p.id);
            }}
          >
            <div style={styles.postHeader}>
              <div style={styles.userInfo}>
                {p.profile ? (
                  <img src={p.profile} alt="" style={styles.profilePic} />
                ) : (
                  <div
                    style={{
                      ...styles.profilePic,
                      display: "grid",
                      placeItems: "center",
                      background: "#dff7fb",
                      color: "#126c80",
                      fontWeight: "800",
                    }}
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 style={styles.name}>{p.name}</h3>
                  <p style={styles.time}>{p.time}</p>
                </div>
              </div>

              {p.id?.startsWith("report-") ? (
                <div style={styles.menuWrap}>
                  <button
                    aria-label={`Options for ${p.name}'s report`}
                    aria-expanded={openMenuId === p.id}
                    style={styles.menuButton}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((current) =>
                        current === p.id ? null : p.id,
                      );
                    }}
                  >
                    •••
                  </button>
                  {openMenuId === p.id && (
                    <div style={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
                      <button
                        style={styles.deleteButton}
                        type="button"
                        onClick={() => deleteReport(p.id)}
                      >
                        Delete report
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.menu}>•••</div>
              )}
            </div>

            <div style={styles.text}>{p.text}</div>

            {p.location && <p style={styles.location}>📍 {p.location}</p>}

            {p.incidentDate && (
              <p style={styles.incidentDate}>Incident date: {p.incidentDate}</p>
            )}

            {p.image && <img src={p.image} alt="" style={styles.image} />}

            <div style={styles.actions}>
              <div style={styles.leftActions}>
                {/* LIKE */}
                <div
                  style={styles.action}
                  onClick={(e) => {
                    e.stopPropagation();
                    likePost(i);
                  }}
                >
                  <div style={{ pointerEvents: "none" }}>{gemSVG(p.liked)}</div>

                  <span
                    style={{
                      color: p.liked ? "#30C9E8" : "#000",
                      fontWeight: "600",
                    }}
                  >
                    {p.likes}
                  </span>
                </div>

                {/* COMMENT */}
                <div style={styles.action} onClick={() => openPost(p.id)}>
                  {commentSVG()}

                  <span style={styles.commentText}>{p.comments}</span>
                </div>
              </div>

              {/* SAVE */}
              <div
                style={styles.save}
                onClick={(e) => {
                  e.stopPropagation();
                  savePost(i);
                }}
              >
                {bookmarkSVG(p.saved)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

// ── STYLES ─────────────────────────────

const styles = {
  wrapper: {
    maxWidth: "500px",
    margin: "0 auto",
    background: "#f5f7fa",
    minHeight: "100vh",
    paddingBottom: "90px",
    fontFamily: "Arial",
  },

  header: {
    padding: "15px",
    background: "#30C9E8",
    color: "white",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoSection: {
    textAlign: "center",
    flex: 1,
  },

  logo: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
  },

  sub: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.95,
    fontWeight: "600",
  },

  icons: {
    display: "flex",
    gap: "10px",
  },

  icon: {
    width: "22px",
    height: "22px",
    cursor: "pointer",
  },

  title: {
    marginTop: "18px",
    fontSize: "28px",
    fontWeight: "800",
  },

  searchBox: {
    marginTop: "15px",
    background: "white",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "15px",
    color: "#000",
  },

  feed: {
    padding: "15px",
  },

  card: {
    background: "white",
    borderRadius: "18px",
    padding: "15px",
    marginBottom: "15px",
    cursor: "pointer",
  },

  postHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  userInfo: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  profilePic: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
  },

  name: {
    margin: 0,
    fontSize: "17px",
    color: "#000",
    fontWeight: "700",
  },

  time: {
    margin: 0,
    fontSize: "12px",
    color: "gray",
  },

  menu: {
    fontSize: "20px",
    color: "#000",
  },

  menuWrap: {
    position: "relative",
  },

  menuButton: {
    padding: "0 4px",
    border: 0,
    background: "transparent",
    color: "#000",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: 1,
  },

  menuPopup: {
    position: "absolute",
    zIndex: 2,
    top: "30px",
    right: 0,
    minWidth: "126px",
    padding: "5px",
    border: "1px solid #dbe3e9",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(14, 27, 36, 0.16)",
  },

  deleteButton: {
    width: "100%",
    padding: "9px 10px",
    border: 0,
    borderRadius: "7px",
    background: "transparent",
    color: "#b42318",
    cursor: "pointer",
    fontFamily: "Arial",
    fontSize: "13px",
    fontWeight: "700",
    textAlign: "left",
  },

  text: {
    marginTop: "12px",
    color: "#000",
    fontSize: "16px",
    lineHeight: "1.5",
  },

  location: {
    margin: "10px 0 0",
    color: "#5d727a",
    fontSize: "13px",
    fontWeight: "600",
  },

  incidentDate: {
    margin: "5px 0 0",
    color: "#5d727a",
    fontSize: "13px",
    fontWeight: "600",
  },

  image: {
    width: "100%",
    borderRadius: "12px",
    marginTop: "12px",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
  },

  leftActions: {
    display: "flex",
    gap: "18px",
  },

  action: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    userSelect: "none",
  },

  commentText: {
    color: "#000",
    fontWeight: "600",
  },

  save: {
    cursor: "pointer",
    userSelect: "none",
  },

  navbar: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    maxWidth: "500px",
    background: "white",
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
    borderTop: "1px solid #ddd",
  },

  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },

  iconSmall: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: "12px",
    fontWeight: "600",
  },
};
