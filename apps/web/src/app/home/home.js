/* 
   CyberSafe — Home page
 */

const DB = {
  user: JSON.parse(localStorage.getItem("cs_user") || "null"),
  users: JSON.parse(localStorage.getItem("cs_users") || "[]"),
  posts: JSON.parse(localStorage.getItem("cs_posts") || "null"),
  reports: JSON.parse(localStorage.getItem("cs_reports") || "[]"),
  likes: JSON.parse(localStorage.getItem("cs_likes") || "[]"),
  saved: JSON.parse(localStorage.getItem("cs_saved") || "[]"),
  progress: JSON.parse(localStorage.getItem("cs_progress") || '{"phishing":60,"passwords":35,"browsing":20,"devices":0}')
};

/*  line-icon set */
const ICONS = {
  bell: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  home: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>`,
  feed: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  learn: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  report: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>`,
  account: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  admin: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/></svg>`,
  thumbUp: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22V11"/><path d="M11.5 22h6.66a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 19.56 11H14l1-5.5A2 2 0 0 0 13 3l-6 8v11z"/></svg>`,
  thumbUpFilled: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M7 22V11H3v11z"/><path d="M11.5 22h6.66a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 19.56 11H14l1-5.5A2 2 0 0 0 13 3l-6 8v11z"/></svg>`,
  comment: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  bookmarkFilled: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22V3"/></svg>`
};

/*  avatar image generator (a real <img> src, since .profile-pic targets an <img>)  */
function avatarImage(name, bg, fg) {
  const initials = ini(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
    <circle cx='60' cy='60' r='60' fill='${bg}'/>
    <text x='60' y='72' font-family='Arial' font-size='42' font-weight='700' fill='${fg}' text-anchor='middle'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/*  seed data (used the first time there are no posts yet)  */
function seedImage(bg, border, accent, title, subtitle, tagBg, tagColor, tagText) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='520' viewBox='0 0 900 520'>
    <rect width='900' height='520' fill='${bg}'/>
    <rect x='55' y='55' width='790' height='410' rx='18' fill='white' stroke='${border}' stroke-width='3'/>
    <text x='90' y='120' font-family='Arial' font-size='30' font-weight='700' fill='${accent}'>${title}</text>
    <text x='90' y='175' font-family='Arial' font-size='22' fill='#1c1e21'>${subtitle}</text>
    <rect x='90' y='220' width='500' height='18' rx='9' fill='#e4e6eb'/>
    <rect x='90' y='255' width='630' height='18' rx='9' fill='#e4e6eb'/>
    <rect x='90' y='325' width='230' height='48' rx='8' fill='${tagBg}'/>
    <text x='112' y='357' font-family='Arial' font-size='18' fill='${tagColor}'>${tagText}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

if (!DB.posts) {
  DB.posts = [
    {
      id: "1", name: "Maya Chen", initials: "MC", time: "2h",
      text: "Scam alert. I received a message claiming my bank account would be blocked unless I clicked a link. I did not click it. Always verify unexpected requests through the official app or website.",
      image: seedImage("#eaf6ff", "#c9e3f9", "#30C9E8", "SECURITY ALERT", "Your account needs urgent verification.", "#ffe8ed", "#b4233d", "Suspicious link"),
      comments: [
        { name: "Thabo", text: "Good catch. Thanks for warning everyone." },
        { name: "Lebo", text: "I received the same message." }
      ]
    },
    {
      id: "2", name: "CyberSafe Team", initials: "CS", time: "5h",
      text: "Cyber safety reminder: never share your password, PIN or OTP in a post or message. If you receive something suspicious, report it and help others recognise the warning signs.",
      image: seedImage("#f3faf5", "#cfe8d5", "#247a43", "CYBERSAFE REMINDER", "Never share your OTP or password.", "#e9f8ee", "#247a43", "Official guidance"),
      comments: []
    },
    {
      id: "3", name: "Jordan Williams", initials: "JW", time: "Yesterday",
      text: "Has anyone else received fake delivery messages asking for a small payment? Sharing the warning so people know what to look out for.",
      image: seedImage("#fff8e8", "#f0dfad", "#956b00", "SCAM WARNING", "Fake delivery payment request.", "#fff4cc", "#956b00", "Verify before paying"),
      comments: [{ name: "Nandi", text: "Yes! Same wording and same suspicious link." }]
    }
  ];
  persist();
}

/*  core utils  */
function persist() {
  for (const [k, v] of Object.entries({ user: DB.user, users: DB.users, posts: DB.posts, reports: DB.reports, likes: DB.likes, saved: DB.saved, progress: DB.progress })) {
    localStorage.setItem("cs_" + k, JSON.stringify(v));
  }
}
function esc(x) { return String(x ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])); }
function ini(n) { return n.split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase(); }
function toast(t) {
  let x = document.querySelector(".toast");
  if (x) x.remove();
  x = document.createElement("div");
  x.className = "toast";
  x.textContent = t;
  document.body.appendChild(x);
  setTimeout(() => x.remove(), 2200);
}
function go(p) { location.href = p + ".html"; }

/* 
    */
if (!DB.user) {
  DB.user = { name: "Alex Morgan", email: "alex@example.com", role: "user" };
  persist();
}
renderHome();

/*  shared shell: header + bottom navbar  */
function shell(active) {
  const u = DB.user;
  document.getElementById("app").innerHTML = `
    <div class="header">
      <div class="top-bar">
        <div class="top-spacer"></div>
        <div class="logo-section">
          <h1>CyberSafe</h1>
          <p>Stay alert. Stay safe.</p>
        </div>
        <div class="top-icons">
          <span class="notification" id="notif" role="button" aria-label="Notifications">${ICONS.bell}</span>
          <button class="add-post" id="addPost" aria-label="New post">+</button>
        </div>
      </div>
    </div>
    <main id="content"></main>
    <nav class="navbar">
      <a class="nav-item ${active === "home" ? "active" : ""}" href="home.html"><span class="nav-icon">${ICONS.home}</span><span>Home</span></a>
      <a class="nav-item ${active === "feed" ? "active" : ""}" href="feed.html"><span class="nav-icon">${ICONS.feed}</span><span>Feed</span></a>
      <a class="nav-item ${active === "learn" ? "active" : ""}" href="learn.html"><span class="nav-icon">${ICONS.learn}</span><span>Learn</span></a>
      <a class="nav-item ${active === "report" ? "active" : ""}" href="report.html"><span class="nav-icon">${ICONS.report}</span><span>Report</span></a>
      <a class="nav-item ${active === "account" ? "active" : ""}" href="account.html"><span class="nav-icon">${ICONS.account}</span><span>Account</span></a>
      ${u.role === "admin" ? `<a class="nav-item ${active === "admin" ? "active" : ""}" href="admin.html"><span class="nav-icon">${ICONS.admin}</span><span>Admin</span></a>` : ""}
    </nav>`;
  document.getElementById("notif").onclick = () => toast("No new notifications.");
  document.getElementById("addPost").onclick = () => go("feed");
}

/*  side sections (trailing content in the feed)  */
function sideSectionsHTML() {
  const topics = ["Phishing awareness", "Strong passwords", "WhatsApp scams", "Fake job offers"];
  return `
    <div class="section-title">Trending topics</div>
    <div class="post-card">
      ${topics.map(t => `<p style="margin-bottom:8px;font-size:16px">${esc(t)}</p>`).join("")}
    </div>
    <div class="post-card icon-row">
      <div class="icon-badge urgent">${ICONS.report}</div>
      <div class="icon-row-text">
        <h2>Received something suspicious?</h2>
        <p>Submit a quick report — takes under a minute.</p>
        <button class="btn-primary" onclick="go('report')">Report now</button>
      </div>
    </div>`;
}

/*  post rendering (home shows the two most recent posts)  */
function postHTML(p) {
  const liked = DB.likes.includes(p.id);
  const saved = DB.saved.includes(p.id);
  const cs = p.comments || [];
  return `
    <article class="post-card" data-id="${p.id}">
      <div class="post-header">
        <div class="user-info">
          <img class="profile-pic" src="${avatarImage(p.name, "#dcecff", "#1266ad")}" alt="">
          <div class="user-details">
            <h2>${esc(p.name)}</h2>
            <p>${esc(p.time || "Just now")}</p>
          </div>
        </div>
        <div class="menu" aria-label="More options">⋯</div>
      </div>
      <div class="post-content">${esc(p.text)}</div>
      ${p.image ? `<img class="post-image" src="${p.image}" alt="Photo or screenshot shared by ${esc(p.name)}">` : ""}
      <div class="post-actions">
        <div class="left-actions">
          <div class="action" data-like><span class="${liked ? "gem" : ""}">${liked ? ICONS.thumbUpFilled : ICONS.thumbUp}</span><span>${liked ? 1 : 0}</span></div>
          <div class="action" data-comments>${ICONS.comment}<span>${cs.length}</span></div>
          <div class="action" data-report>${ICONS.flag}<span>Report</span></div>
        </div>
        <div class="save" data-save><span class="${saved ? "gem" : ""}">${saved ? ICONS.bookmarkFilled : ICONS.bookmark}</span></div>
      </div>
      <div class="comments hidden">
        <div>${cs.map(c => `<div class="comment"><img class="profile-pic" style="width:30px;height:30px" src="${avatarImage(c.name, "#e4e6eb", "#555")}" alt=""><div class="comment-bubble"><b>${esc(c.name)}</b><br>${esc(c.text)}</div></div>`).join("")}</div>
        <form class="comment-form"><input placeholder="Write a comment..." maxlength="250" required><button>Post</button></form>
      </div>
    </article>`;
}

function bindPosts() {
  document.querySelectorAll(".post-card[data-id]").forEach(card => {
    const id = card.dataset.id;
    card.querySelector("[data-like]").onclick = () => {
      DB.likes = DB.likes.includes(id) ? DB.likes.filter(x => x !== id) : [...DB.likes, id];
      persist(); renderHome();
    };
    card.querySelector("[data-save]").onclick = () => {
      DB.saved = DB.saved.includes(id) ? DB.saved.filter(x => x !== id) : [...DB.saved, id];
      persist(); renderHome();
      toast(DB.saved.includes(id) ? "Saved" : "Removed from saved");
    };
    card.querySelector("[data-report]").onclick = () => go("report");
    card.querySelector("[data-comments]").onclick = () => card.querySelector(".comments").classList.toggle("hidden");
    card.querySelector(".comment-form").onsubmit = e => {
      e.preventDefault();
      const v = e.target.querySelector("input").value.trim();
      if (!v) return;
      const p = DB.posts.find(x => x.id === id);
      p.comments = p.comments || [];
      p.comments.push({ name: DB.user.name, text: v });
      persist(); renderHome();
      toast("Comment posted.");
    };
  });
}

/*  the home page itself  */
function renderHome() {
  shell("home");
  const firstPosts = DB.posts.slice(0, 2);
  document.getElementById("content").innerHTML = `
    <div class="feed">
      <h1 class="page-title">Welcome back, ${esc(DB.user.name.split(" ")[0])}</h1>
      <div class="search-box">
        <input id="globalSearch" placeholder="Search CyberSafe">
      </div>

      <div class="section-title" style="margin-top:25px">Quick actions</div>
      <div class="post-card icon-row">
        <div class="icon-badge">${ICONS.feed}</div>
        <div class="icon-row-text">
          <h2>Community Feed</h2>
          <p>Read awareness posts and warnings shared by members.</p>
          <button class="btn-primary" onclick="go('feed')">Open Feed</button>
        </div>
      </div>
      <div class="post-card icon-row">
        <div class="icon-badge">${ICONS.learn}</div>
        <div class="icon-row-text">
          <h2>Learning</h2>
          <p>Short modules and quizzes to build practical knowledge.</p>
          <button class="btn-primary" onclick="go('learn')">Start Learning</button>
        </div>
      </div>
      <div class="post-card icon-row">
        <div class="icon-badge urgent">${ICONS.report}</div>
        <div class="icon-row-text">
          <h2>Report Activity</h2>
          <p>Submit an incident with details and optional evidence.</p>
          <button class="btn-primary" onclick="go('report')">Make a Report</button>
        </div>
      </div>

      <div class="section-title" style="margin-top:25px">Recent community activity</div>
      <div id="dashboardPosts">${firstPosts.map(postHTML).join("")}</div>

      ${sideSectionsHTML()}
    </div>`;
  document.getElementById("globalSearch").onkeydown = e => { if (e.key === "Enter" && e.target.value.trim()) go("feed"); };
  bindPosts();
}
