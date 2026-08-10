"use client";

import { useState } from "react";

export default function FeedPage() {
  const [posts, setPosts] = useState([
    {
      name: "Sarah",
      time: "2m ago",
      text: "I almost got scammed by a fake banking SMS asking for account verification details.",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop",
      likes: 1400,
      comments: 128,
      profile: "https://i.pravatar.cc/150?img=47",
      liked: false,
      saved: false,
    },
    {
      name: "Edward Chen",
      time: "5m ago",
      text: "Fake job offer emails are increasing. Never pay upfront fees for training.",
      image:
        "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=800&auto=format&fit=crop",
      likes: 2100,
      comments: 302,
      profile: "https://i.pravatar.cc/150?img=12",
      liked: false,
      saved: false,
    },
    {
      name: "Lerato",
      time: "10m ago",
      text: "Someone cloned my WhatsApp profile and tried scamming my family pretending to be me.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
      likes: 980,
      comments: 84,
      profile: "https://i.pravatar.cc/150?img=32",
      liked: false,
      saved: false,
    },
    {
      name: "James",
      time: "18m ago",
      text: "Be careful of fake WiFi networks in malls and airports. Hackers can steal login details.",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
      likes: 760,
      comments: 49,
      profile: "https://i.pravatar.cc/150?img=22",
      liked: false,
      saved: false,
    },
    {
      name: "Aisha Khan",
      time: "30m ago",
      text: "Received a phishing email pretending to be Netflix asking me to update payment information.",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      likes: 1200,
      comments: 175,
      profile: "https://i.pravatar.cc/150?img=48",
      liked: false,
      saved: false,
    },
    {
      name: "Michael",
      time: "1h ago",
      text: "Scammers are now using AI voice calls pretending to be family members asking for money.",
      image:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop",
      likes: 3400,
      comments: 601,
      profile: "https://i.pravatar.cc/150?img=18",
      liked: false,
      saved: false,
    },
    {
      name: "Nomvula",
      time: "2h ago",
      text: "Always enable two-factor authentication. It saved my account after a password leak.",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
      likes: 1800,
      comments: 233,
      profile: "https://i.pravatar.cc/150?img=25",
      liked: false,
      saved: false,
    },
  ]);

  const [activeNav, setActiveNav] = useState("feed");

  // ── ICONS ───────────────────────────────

  function gemSVG(liked) {
    const fill = liked ? "#30C9E8" : "none";
    const stroke = liked ? "#30C9E8" : "#bbb";

    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={fill}
        stroke={stroke}
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
    const fill = saved ? "#888" : "none";
    const stroke = saved ? "#888" : "#bbb";

    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={fill}
        stroke={stroke}
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

  // ── ACTIONS ─────────────────────────────

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

  // ── UI ───────────────────────────────────

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

        {/* SEARCH FIXED */}
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
          <div key={i} style={styles.card}>
            <div style={styles.postHeader}>
              <div style={styles.userInfo}>
                <img src={p.profile} style={styles.profilePic} />
                <div>
                  <h3 style={styles.name}>{p.name}</h3>
                  <p style={styles.time}>{p.time}</p>
                </div>
              </div>
              <div>•••</div>
            </div>

            <div style={styles.text}>{p.text}</div>
            <img src={p.image} style={styles.image} />

            <div style={styles.actions}>
              <div style={styles.leftActions}>
                <div style={styles.action} onClick={() => likePost(i)}>
                  {gemSVG(p.liked)}
                  <span style={{ color: p.liked ? "#30C9E8" : "#555" }}>
                    {p.likes}
                  </span>
                </div>

                <div style={styles.action}>
                  {commentSVG()}
                  <span>{p.comments}</span>
                </div>
              </div>

              <div style={styles.save} onClick={() => savePost(i)}>
                {bookmarkSVG(p.saved)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        {["home", "feed", "learn", "post"].map((item) => (
          <div
            key={item}
            style={{
              ...styles.navItem,
              color: activeNav === item ? "#30C9E8" : "#666",
            }}
            onClick={() => setActiveNav(item)}
          >
            <div style={styles.iconSmall}>
              {item === "home" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" />
                </svg>
              )}

              {item === "feed" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              )}

              {item === "learn" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5V4.5A2.5 2.5 0 016.5 2h11A2.5 2.5 0 0120 4.5v15L12 15l-8 4.5z" />
                </svg>
              )}

              {item === "post" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </div>

            {item.charAt(0).toUpperCase() + item.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── STYLES ───────────────────────────── */

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

  logoSection: { textAlign: "center", flex: 1 },
  logo: { margin: 0 },
  sub: { margin: 0, fontSize: "12px", opacity: 0.9 },

  icons: { display: "flex", gap: "10px" },

  icon: {
    width: "22px",
    height: "22px",
    stroke: "white",
    cursor: "pointer",
  },

  title: { marginTop: "15px" },

  searchBox: {
    marginTop: "15px",
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },

  feed: { padding: "15px" },

  card: {
    background: "white",
    borderRadius: "18px",
    padding: "15px",
    marginBottom: "15px",
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

  name: { margin: 0, fontSize: "16px" },
  time: { margin: 0, fontSize: "12px", color: "gray" },

  text: { marginTop: "10px" },

  image: {
    width: "100%",
    borderRadius: "12px",
    marginTop: "10px",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  leftActions: { display: "flex", gap: "15px" },

  action: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  save: { cursor: "pointer" },

  navbar: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    maxWidth: "500px",
    background: "white",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0",
    borderTop: "1px solid #ddd",
  },

  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "12px",
    cursor: "pointer",
    gap: "3px",
  },
};
