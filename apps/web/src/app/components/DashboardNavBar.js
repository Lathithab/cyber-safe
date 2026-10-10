"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavIcon from "./DashboardNavIcon";
import C3saLogo from "./C3saLogo";
import LogoutButton from "./LogoutButton";
import { DASHBOARD_NAV } from "./dashboardNav";
import { filterNavForUser, useGuestNav } from "../../lib/useAuthUser";

const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
// Guests get Help in the bottom bar instead of the sidebar and More menu.
const GUEST_PRIMARY_ROUTES = [...PRIMARY_ROUTES, "/help"];
const MENU_EXCLUDED_ROUTES = ["/login", "/admin", "/notification"];

// Inline because the dashboard CSS lives in each page; styled like a bottom-nav item.
const sideHelpStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, alignSelf: "center", margin: "auto 0 12px", padding: "6px 14px", border: 0, background: "transparent", cursor: "pointer", font: "inherit" };

const iconProps ={ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true };

function MenuIcon() {
  return <svg {...iconProps} width={21} height={21}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

function CloseIcon() {
  return <svg {...iconProps} width={18} height={18}><path d="M18 6 6 18M6 6l12 12" /></svg>;
}

function shortLabel(label) {
  return label.replace("Community ", "").replace(" Security", "").replace(" Incident", "").replace(" AI", "");
}

// Mobile top bar, desktop sidebar, mobile bottom bar and "More" menu shared by
// the dashboard pages. Styling comes from each page's own CSS (same class names).
export default function DashboardNavBar({
  active,
  iconSize,
  bell = false,
  menuLogout = false,
  sidebarExtra = null,
  brandHref = "/",
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const guestNav = useGuestNav();
  const primaryRoutes = guestNav ? GUEST_PRIMARY_ROUTES : PRIMARY_ROUTES;
  const links = filterNavForUser(DASHBOARD_NAV, guestNav);
  const sideNav = guestNav ? links.filter(([, route]) => route !== "/help") : links;
  const primaryNav = links.filter(([, route]) => primaryRoutes.includes(route));
  const menuNav = links.filter(([, route]) => !primaryRoutes.includes(route) && !MENU_EXCLUDED_ROUTES.includes(route));

  return (
    <>
      <header className="mobile-topbar">
        <button className="mobile-topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>
        <button className="mobile-topbar-brand" type="button" onClick={() => router.push("/feed")}>
          <C3saLogo size={34} />
          <strong>CyberSafe</strong>
        </button>
        {bell ? (
          <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/notification")} aria-label="Notifications">
            <DashboardNavIcon name="bell" size={21} />
          </button>
        ) : (
          <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/profiles")} aria-label="User Profile">
            <DashboardNavIcon name="user" size={21} />
          </button>
        )}
      </header>

      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push(brandHref)}>
          <C3saLogo />
          <span><strong>CyberSafe</strong><small>South Africa</small></span>
        </button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {sideNav.map(([label, route, icon]) => (
            <button key={label} className={`side-link ${route === active ? "active" : ""}`} type="button" onClick={() => router.push(route)}>
              <DashboardNavIcon name={icon} size={iconSize} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        {guestNav && (
          <button
            type="button"
            onClick={() => router.push("/help")}
            aria-label="Get Help"
            style={{ ...sideHelpStyle, color: active === "/help" ? "#EB630F" : "rgba(255,255,255,.6)" }}
          >
            <DashboardNavIcon name="help" size={22} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Help</span>
          </button>
        )}
        <LogoutButton />
        {sidebarExtra}
      </aside>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {primaryNav.map(([label, route, icon]) => (
          <button key={label} type="button" className={`bottom-nav-item ${route === active ? "active" : ""}`} onClick={() => router.push(route)}>
            <DashboardNavIcon name={icon} size={21} />
            <span>{shortLabel(label)}</span>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div className="nav-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-menu-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="nav-menu-header">
              <strong>More</strong>
              <button type="button" className="nav-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><CloseIcon /></button>
            </div>
            <div className="nav-menu-grid">
              {menuNav.map(([label, route, icon]) => (
                <button key={label} type="button" className="nav-menu-item" onClick={() => { setMenuOpen(false); router.push(route); }}>
                  <span className="nav-menu-icon"><DashboardNavIcon name={icon} size={20} /></span>
                  {label}
                </button>
              ))}
            </div>
            {menuLogout && <LogoutButton />}
          </div>
        </div>
      )}
    </>
  );
}
