"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", route: "/", icon: "home" },
  { label: "Feed", route: "/feed", icon: "feed" },
  { label: "Post", route: "/postReport", icon: "post" },
  { label: "Library", route: "/library", icon: "library" },
  { label: "Help", route: "/help", icon: "help" },
];

function NavIcon({ icon }) {
  if (icon === "home")
    return <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" />;
  if (icon === "feed")
    return (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </>
    );
  if (icon === "library")
    return (
      <>
        <path d="M4 19a2 2 0 012-2h14" />
        <path d="M6 3h14v18H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </>
    );
  if (icon === "help")
    return (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M4.9 4.9l4 4M15.1 15.1l4 4M19.1 4.9l-4 4M8.9 15.1l-4 4" />
      </>
    );
  return <path d="M12 5v14M5 12h14" />;
}

// Inline styles on purpose: this component is dropped into pages that each
// bring their own unscoped <style> block, so it can't risk colliding with
// any of their class names.
const styles = {
  nav: {
    position: "fixed",
    zIndex: 30,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "space-around",
    maxWidth: 500,
    margin: "0 auto",
    padding: "12px 0 calc(12px + env(safe-area-inset-bottom))",
    borderTop: "1px solid #ddd",
    background: "#fff",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  button: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
  },
};

// Shared bottom tab bar. Renders on every top-level page; import it and
// place <BottomNav /> as the last element before that page's <style> tag.
// Deliberately left off /post (the single-post detail view), which already
// has its own fixed top bar and a fixed comment composer at the bottom.
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={styles.nav} aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active =
          item.route === "/"
            ? pathname === "/"
            : pathname.startsWith(item.route);
        return (
          <button
            key={item.label}
            type="button"
            style={{ ...styles.button, color: active ? "#30c9e8" : "#666" }}
            onClick={() => router.push(item.route)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <NavIcon icon={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
