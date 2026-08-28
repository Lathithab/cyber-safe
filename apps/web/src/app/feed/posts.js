// Shared seed data for the community feed and the single-post detail view.
// Report posts (submitted via /postReport) are stored separately in
// localStorage under "cybersafeReports" and merged in at render time.

export const SEED_POSTS = [
  {
    id: "seed-0",
    name: "Kgomotso Khumalo",
    handle: "@kgomotso_k",
    time: "2 hours ago",
    role: "Soweto community leader",
    issues: ["Scam Alert"],
    text: "URGENT WARNING: Beware of a new Eskom billing scam circulating via WhatsApp in Gauteng. Scam messages claim you have an outstanding bill and demand immediate payment via an online card link. Eskom will NEVER request payment links over WhatsApp. Keep your details safe and warn your parents!",
    image:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?q=80&w=800&auto=format&fit=crop",
    likes: 34,
    comments: 2,
    profile: "https://i.pravatar.cc/150?img=51",
    topComments: [
      {
        name: "Thabo Mokoena",
        text: "Thanks for the warning — forwarded this to my mom right away.",
        time: "1h ago",
      },
      {
        name: "Naledi Petersen",
        text: "Same thing happened to my neighbour last week. Glad she didn't click the link.",
        time: "45m ago",
      },
    ],
  },
  {
    id: "seed-1",
    name: "Sarah Mitchell",
    handle: "@sarah_m",
    time: "2m ago",
    text: "I almost got scammed by a fake banking SMS asking for account verification details.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop",
    likes: 1432,
    comments: 128,
    profile: "https://i.pravatar.cc/150?img=47",
    topComments: [
      {
        name: "Michael R.",
        text: "This happened to me too! They even had my bank's logo on it. Reported it to the bank straight away.",
        time: "1m ago",
      },
      {
        name: "Naledi K.",
        text: "Never click the link in the SMS — always open your banking app directly instead.",
        time: "48s ago",
      },
    ],
  },
  {
    id: "seed-2",
    name: "Edward Chen",
    handle: "@edward_c",
    time: "5m ago",
    text: "Fake job offer emails are increasing. Never pay upfront fees for training.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=800&auto=format&fit=crop",
    likes: 2089,
    comments: 302,
    profile: "https://i.pravatar.cc/150?img=12",
    topComments: [
      {
        name: "Thabo M.",
        text: "Lost R500 to one of these before I learned the red flags. Thanks for sharing.",
        time: "3m ago",
      },
      {
        name: "Priya S.",
        text: "Legit employers never ask you to pay for training upfront. Good reminder.",
        time: "2m ago",
      },
    ],
  },
  {
    id: "seed-3",
    name: "Lerato Dlamini",
    handle: "@lerato_d",
    time: "10m ago",
    text: "Someone cloned my WhatsApp profile and tried scamming my family pretending to be me.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    likes: 976,
    comments: 84,
    profile: "https://i.pravatar.cc/150?img=32",
    topComments: [
      {
        name: "Grace N.",
        text: "So scary! Did you manage to get your account back?",
        time: "8m ago",
      },
      {
        name: "Kagiso T.",
        text: "This is why I keep two-factor authentication turned on for WhatsApp now.",
        time: "6m ago",
      },
    ],
  },
  {
    id: "seed-4",
    name: "James Okafor",
    handle: "@james_o",
    time: "18m ago",
    text: "Be careful of fake WiFi networks in malls and airports. Hackers can steal login details.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    likes: 763,
    comments: 49,
    profile: "https://i.pravatar.cc/150?img=22",
    topComments: [
      {
        name: "Daniel P.",
        text: "Airport WiFi got me once. Now I always use a VPN when traveling.",
        time: "14m ago",
      },
      {
        name: "Zanele M.",
        text: "Good tip, sharing this with my family before their trip.",
        time: "11m ago",
      },
    ],
  },
  {
    id: "seed-5",
    name: "Aisha Khan",
    handle: "@aisha_k",
    time: "30m ago",
    text: "Received a phishing email pretending to be Netflix asking me to update payment information.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    likes: 1214,
    comments: 175,
    profile: "https://i.pravatar.cc/150?img=48",
    topComments: [
      {
        name: "Farai C.",
        text: "I get these constantly. The fake domains are getting harder to spot.",
        time: "22m ago",
      },
      {
        name: "Bongani S.",
        text: "Netflix will never ask for payment info by email — always check the account page directly.",
        time: "19m ago",
      },
    ],
  },
  {
    id: "seed-6",
    name: "Michael Vantassel",
    handle: "@mike_v",
    time: "1h ago",
    text: "Scammers are now using AI voice calls pretending to be family members asking for money.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop",
    likes: 3402,
    comments: 601,
    profile: "https://i.pravatar.cc/150?img=18",
    topComments: [
      {
        name: "Lindiwe P.",
        text: "This is terrifying honestly. My mom almost fell for one of these.",
        time: "40m ago",
      },
      {
        name: "Sipho D.",
        text: "Agreed — we set up a family safe word for emergencies after hearing about this.",
        time: "33m ago",
      },
    ],
  },
  {
    id: "seed-7",
    name: "Nomvula Sithole",
    handle: "@nomvula_s",
    time: "2h ago",
    text: "Always enable two-factor authentication. It saved my account after a password leak.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    likes: 1827,
    comments: 233,
    profile: "https://i.pravatar.cc/150?img=25",
    topComments: [
      {
        name: "Ayesha R.",
        text: "Such a good example of why 2FA matters. Turning it on for everything now.",
        time: "1h ago",
      },
      {
        name: "Karabo L.",
        text: "Great reminder — just enabled it on my email too.",
        time: "55m ago",
      },
    ],
  },
];

export function findSeedPost(id) {
  return SEED_POSTS.find((post) => post.id === id) || null;
}

export function loadReportById(id) {
  try {
    const reports = JSON.parse(
      localStorage.getItem("cybersafeReports") || "[]",
    );
    return reports.find((report) => report.id === id) || null;
  } catch {
    return null;
  }
}

export function loadCommentCounts() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("cybersafeComments") || "{}",
    );
    return Object.fromEntries(
      Object.entries(stored).map(([id, list]) => [id, list.length]),
    );
  } catch {
    return {};
  }
}

export function loadStoredComments(id) {
  try {
    const stored = JSON.parse(
      localStorage.getItem("cybersafeComments") || "{}",
    );
    return stored[id] || [];
  } catch {
    return [];
  }
}

export function appendStoredComment(id, comment) {
  try {
    const stored = JSON.parse(
      localStorage.getItem("cybersafeComments") || "{}",
    );
    const updated = [...(stored[id] || []), comment];
    stored[id] = updated;
    localStorage.setItem("cybersafeComments", JSON.stringify(stored));
    return updated;
  } catch {
    return null;
  }
}
