"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { emergency, banks, networks, geoLinks } from "./contacts";
import DashboardNavIcon from "../components/DashboardNavIcon";
import LogoutButton from "../components/LogoutButton";
import { DASHBOARD_NAV } from "../components/dashboardNav";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "menu") return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "close") return <svg {...shared}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  if (name === "shield") return <svg {...shared} viewBox="0 0 24 26" fill="currentColor" stroke="none"><path d="M7,1 L15.5,1 L18.5,2.5 L21,7.5 L17.8,9.5 L16.8,13.5 L15.8,20 L12.5,25 L9.5,23.5 L8,19.5 L6,15 L7,11.5 L5,9.5 L2.8,10.3 L1,6 L2.3,2.2 Z" /><ellipse cx="19.5" cy="17" rx="0.9" ry="1.9" transform="rotate(20 19.5 17)" fill="currentColor" stroke="none" /></svg>;
  if (name === "home") return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "book") return <svg {...shared}><path d="M4 19a2 2 0 0 1 2-2h14" /><path d="M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>;
  if (name === "alert") return <svg {...shared}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "chat") return <svg {...shared}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.6-4.3A8.4 8.4 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "pin") return <svg {...shared}><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "exit") return <svg {...shared}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 3v18a1 1 0 0 1-1 1h-8" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

function Sidebar({ router }) {
  const links = DASHBOARD_NAV;
  return <aside className="sidebar">
     <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
     <nav className="side-nav" aria-label="Dashboard navigation">{links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/help" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={25} /><span>{label}</span></button>)}</nav>
     <LogoutButton />
     <div className="emergency-card"><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Use this hub for help</b></span></div>
      <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={22} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
      <nav className="side-nav" aria-label="Dashboard navigation">{links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/help" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={20} /><span>{label}</span></button>)}</nav>
      <LogoutButton />
      <div className="emergency-card"><span className="emergency-icon"><Icon name="phone" size={18} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Use this hub for help</b></span></div>
  </aside>;
}

function formatNumber(tel) {
  if (tel.length <= 5) return tel;
  return tel.replace(/(\d{4})(\d{3})(\d{3,})/, "$1 $2 $3");
}

function ContactRow({ contact, urgent = false }) {
  return <a className={`contact-row ${urgent ? "urgent" : ""}`} href={`tel:${contact.tel}`}><span><strong>{contact.name}</strong><small>{contact.detail}</small></span><span className="call-action"><b>{formatNumber(contact.tel)}</b><i><Icon name="phone" size={14} /></i></span></a>;
}

export default function HelpPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const PRIMARY_ROUTES = ["/feed", "/learn", "/postReport", "/cyberbot"];
  const MENU_EXCLUDED_ROUTES = [...PRIMARY_ROUTES, "/login", "/admin", "/notification"];
  const primaryNav = DASHBOARD_NAV.filter(([, route]) => PRIMARY_ROUTES.includes(route));
  const menuNav = DASHBOARD_NAV.filter(([, route]) => !MENU_EXCLUDED_ROUTES.includes(route));
  const [bankSearch, setBankSearch] = useState("");
  const filteredBanks = useMemo(() => banks.filter((bank) => `${bank.name} ${bank.detail}`.toLowerCase().includes(bankSearch.toLowerCase())), [bankSearch]);

  function quickExit() { window.location.replace("https://www.google.com"); }
  function openMaps(query) { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer"); }

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") quickExit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <main className="hub-dashboard">
    <header className="mobile-topbar">
      <button className="mobile-topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" size={21} /></button>
      <button className="mobile-topbar-brand" type="button" onClick={() => router.push("/feed")}><span className="mobile-topbar-icon"><Icon name="shield" size={18} /></span><strong>CyberSafe</strong></button>
      <button className="mobile-topbar-bell" type="button" onClick={() => router.push("/notification")} aria-label="Notifications"><DashboardNavIcon name="bell" size={21} /></button>
    </header>
    <Sidebar router={router} />
    <nav className="bottom-nav" aria-label="Primary navigation">
      {primaryNav.map(([label, route, icon]) => (
        <button key={label} type="button" className={`bottom-nav-item ${route === "/help" ? "active" : ""}`} onClick={() => router.push(route)}>
          <DashboardNavIcon name={icon} size={21} />
          <span>{label.replace("Community ", "").replace(" Security", "").replace(" Incident", "").replace(" AI", "")}</span>
        </button>
      ))}
    </nav>
    {menuOpen && (
      <div className="nav-menu-overlay" onClick={() => setMenuOpen(false)}>
        <div className="nav-menu-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="nav-menu-header"><strong>More</strong><button type="button" className="nav-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={18} /></button></div>
          <div className="nav-menu-grid">
            {menuNav.map(([label, route, icon]) => (
              <button key={label} type="button" className="nav-menu-item" onClick={() => { setMenuOpen(false); router.push(route); }}>
                <span className="nav-menu-icon"><DashboardNavIcon name={icon} size={20} /></span>{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    <section className="hub-content">
      <header className="hub-header">
        <div><p className="eyebrow">CyberSafe support</p><h1> Helpline Hub</h1><p>Official South African support contacts for scam, fraud and cybercrime incidents.</p></div>
        <button className="quick-exit" type="button" onClick={quickExit}><Icon name="exit" size={16} />Quick exit</button>
      </header>

      <section className="critical-banner" aria-label="Critical help guidance"><span className="banner-icon"><Icon name="phone" size={25} /></span><span><strong> HELPLINE HUB</strong><small>Have you lost money or personal access? Call these official South African hotlines immediately for professional help.</small></span></section>

      <div className="hub-grid">
        <div className="main-help">
          <section className="hub-card emergency-services"><h2>National Emergency Services</h2><div className="emergency-grid">{emergency.slice(0, 2).map((contact) => <ContactRow key={contact.name} contact={contact} urgent />)}</div><p className="emergency-note">From a cellphone, you can also call <a href={`tel:${emergency[2].tel}`}>{emergency[2].tel}</a> for emergency services.</p></section>
          <section className="hub-card"><div className="card-title-row"><h2>SA Bank Fraud Hotlines</h2><label className="contact-search"><Icon name="search" size={16} /><input value={bankSearch} onChange={(event) => setBankSearch(event.target.value)} placeholder="Search bank..." aria-label="Search bank fraud lines" /></label></div><div className="contact-list">{filteredBanks.map((contact) => <ContactRow key={contact.name} contact={contact} />)}{!filteredBanks.length && <p className="empty-state">No bank matches that search.</p>}</div></section>
          <section className="hub-card"><h2>Telecom &amp; Network Fraud</h2><p className="card-subtitle">Report a SIM-swap, lost SIM, or suspicious network activity.</p><div className="contact-list">{networks.map((contact) => <ContactRow key={contact.name} contact={contact} />)}</div></section>
        </div>

        <aside className="right-help">
          <section className="hub-card police-card"><h2>Find Nearest Police Station</h2><button className="map-preview" type="button" onClick={() => openMaps(geoLinks[0].query)} aria-label="Find nearest police station on Google Maps"><span className="street street-one" /><span className="street street-two" /><span className="street street-three" /><span className="map-marker marker-one"><Icon name="pin" size={17} /></span><span className="map-marker marker-two"><Icon name="pin" size={17} /></span><span className="map-marker marker-three"><Icon name="pin" size={17} /></span><b>Open map</b></button><button className="map-link" type="button" onClick={() => openMaps(geoLinks[0].query)}><Icon name="pin" size={16} />Find the nearest SAPS station</button></section>
          <section className="hub-card resource-card"><h2>Important Safety Notes</h2><ul><li>This app provides awareness and support guidance, not emergency protection.</li><li>Only use a safe, private device if you believe an account is compromised.</li><li>Never share your PIN, password, one-time password, or full card number.</li></ul></section>
        </aside>
      </div>
    </section>

    <style>{`
      * { box-sizing: border-box; } .hub-dashboard { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); background: #f6f9fd; color: #00243A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        .mobile-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 41; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; height: calc(52px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px); background: #00243A; border-bottom: 2px solid #EB630F; }
        .mobile-topbar-menu, .mobile-topbar-bell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border: 0; background: transparent; color: #fff; cursor: pointer; }
        .mobile-topbar-brand { display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: #fff; cursor: pointer; font: inherit; padding: 0; }
        .mobile-topbar-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(235,99,15,.22); color: #EB630F; }
        .mobile-topbar-brand strong { font-size: 15px; letter-spacing: -0.3px; }

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

                .hub-content { padding-top: calc(18px + 52px + env(safe-area-inset-top, 0px)); padding-bottom: 78px; }

              .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px 22px; border-right: 1px solid #e2e9f2; background: #00243A; overflow: hidden; } .sidebar { display: none; }
        @media (min-width: 851px) {
          .sidebar { display: flex; }
          .hub-dashboard { grid-template-columns: 230px minmax(0, 1fr); } .side-link { font-size: 12px; padding: 10px 12px; gap: 10px; } .brand strong { font-size: 16px; } .brand small { font-size: 11px; }
          .mobile-topbar, .bottom-nav, .nav-menu-overlay { display: none; }
          .hub-content { padding-top: 24px; padding-bottom: 36px; }
        }
 .brand { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: #fff; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 9px; background: rgba(235,99,15,.22); color: #EB630F; } .brand strong { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 20px; line-height: 1; letter-spacing: -0.55px; } .brand small { display: block; margin-top: 5px; color: #EB630F; font-size: 12px; font-weight: 700; } .side-nav { display: grid; gap: 7px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 13px; width: 100%; padding: 11px 14px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.68); cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; text-align: left; } .side-link:last-child { background: #FDEAE0; color: #00243A; font-weight: 800; } .side-link:last-child svg { color: #EB630F; } .emergency-card { display: flex; align-items: flex-start; gap: 10px; margin-top: auto; padding: 16px; border: 2px solid #ff5a5f; border-radius: 12px; background: #fff4f4; color: #ff5158; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; } .emergency-card small { margin: 10px 0 7px; color: #536179; font-size: 11px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 11px; }
      .side-link:last-child { background: transparent; color: #536179; font-weight: 600; } .side-link:last-child svg { color: currentColor; } .side-link.active { background: rgba(235,99,15,.25); color: #fff; font-weight: 800; } .side-link.active svg { color: #EB630F; }
      .hub-content { min-width: 0; padding: 30px 34px 45px; } .hub-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .eyebrow { margin: 0 0 7px; color: #C24F0C; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } h1, h2, strong { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } h1 { margin: 0; font-size: clamp(20px, 3.4vw, 24px); letter-spacing: -1.1px; line-height: 1; } .hub-header p:last-child { margin: 10px 0 0; color: #5b6980; font-size: 14px; line-height: 1.35; } .quick-exit { display: flex; align-items: center; gap: 6px; min-height: 47px; padding: 0 18px; border: 1px solid #dce5ef; border-radius: 8px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 11px; font-weight: 800; }
      .critical-banner { display: flex; align-items: center; gap: 14px; margin-top: 28px; padding: 20px 24px; border: 2px solid #ff6266; border-radius: 13px; background: #fff0f1; color: #151b34; } .banner-icon { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%; background: #fff; color: #ff5158; } .critical-banner strong, .critical-banner small { display: block; } .critical-banner strong { font-size: 19px; letter-spacing: -.7px; } .critical-banner small { margin-top: 7px; color: #5b6980; font-size: 12px; line-height: 1.4; }
      .hub-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr); gap: 24px; margin-top: 30px; align-items: start; } .main-help { display: grid; gap: 22px; } .right-help { display: grid; gap: 22px; } .hub-card { padding: 24px; border: 1px solid #dce5ef; border-radius: 13px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .hub-card h2 { margin: 0; font-size: 19px; letter-spacing: -0.55px; } .card-subtitle { margin: 7px 0 19px; color: #65738a; font-size: 11px; }
      .emergency-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; margin-top: 25px; } .emergency-note { margin: 14px 0 0; color: #65738a; font-size: 11px; } .emergency-note a { color: #EB630F; font-weight: 800; text-decoration: none; }
      .contact-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 14px; border: 1px solid #dce5ef; border-radius: 9px; background: #fff; color: #00243A; text-decoration: none; transition: border-color .15s, box-shadow .15s, transform .15s; } .contact-row:hover { border-color: #EB630F; box-shadow: 0 8px 16px rgba(36,56,87,.08); transform: translateY(-1px); } .contact-row.urgent { min-height: 114px; border-color: #ffb3b7; background: #fff8f8; } .contact-row > span:first-child { min-width: 0; } .contact-row strong, .contact-row small { display: block; } .contact-row strong { font-size: 12px; } .contact-row small { margin-top: 5px; color: #66758b; font-size: 11px; } .call-action { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; } .call-action b { color: #EB630F; font-size: 12px; } .urgent .call-action b { color: #ff5158; font-size: 17px; } .call-action i { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #EB630F; color: #fff; } .urgent .call-action i { background: #ff5158; } .contact-list { display: grid; gap: 8px; margin-top: 21px; } .card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; } .contact-search { display: flex; align-items: center; gap: 6px; width: 210px; color: #536179; } .contact-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 11px; } .empty-state { margin: 3px 0; color: #65738a; font-size: 11px; }
      .map-preview { position: relative; width: 100%; height: 260px; margin-top: 21px; overflow: hidden; border: 0; border-radius: 9px; background: linear-gradient(145deg, #d8e6e8 0 38%, #c4d3d6 38% 68%, #dce7db 68%); cursor: pointer; } .map-preview::before, .map-preview::after { content: ""; position: absolute; inset: -20% -10%; background: repeating-linear-gradient(32deg, transparent 0 34px, rgba(39, 123, 155, .64) 35px 39px, transparent 40px 76px); transform: rotate(-10deg); } .map-preview::after { background: repeating-linear-gradient(120deg, transparent 0 44px, rgba(255, 176, 78, .8) 45px 51px, transparent 52px 102px); transform: rotate(9deg); opacity: .8; } .street { position: absolute; z-index: 1; display: block; height: 12px; border-radius: 999px; background: #2f8eb3; transform: rotate(25deg); } .street-one { top: 45%; left: -8%; width: 120%; } .street-two { top: 20%; left: 12%; width: 95%; transform: rotate(112deg); } .street-three { top: 67%; left: 14%; width: 83%; transform: rotate(-22deg); } .map-marker { position: absolute; z-index: 2; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; background: #fff; color: #ff775e; box-shadow: 0 3px 10px rgba(30, 48, 66, .25); transform: rotate(-45deg); } .map-marker svg { transform: rotate(45deg); } .marker-one { top: 29%; left: 35%; } .marker-two { top: 56%; left: 61%; } .marker-three { top: 43%; right: 13%; } .map-preview b { position: absolute; z-index: 3; right: 14px; bottom: 13px; padding: 6px 9px; border-radius: 5px; background: #fff; color: #314159; font-size: 11px; }
      .map-link { display: flex; align-items: center; gap: 8px; margin-top: 18px; padding: 0; border: 0; background: transparent; color: #5b6980; cursor: pointer; font: inherit; font-size: 11px; text-align: left; } .map-link svg { color: #EB630F; } .resource-card ul { display: grid; gap: 12px; margin: 18px 0 0; padding: 0; list-style: none; color: #65738a; font-size: 11px; line-height: 1.45; } .resource-card li { position: relative; padding-left: 20px; } .resource-card li::before { content: ""; position: absolute; top: .45em; left: 0; width: 16px; height: 16px; border-radius: 50%; background: #EB630F; }
      @media (max-width: 1180px) { .sidebar { padding: 22px 16px 20px; } .hub-content { padding: 27px 24px 42px; } .side-link { font-size: 13px; } .hub-grid { grid-template-columns: 1fr; } .right-help { grid-template-columns: 1fr 1fr; } } @media (max-width: 850px) { .brand strong { font-size: 12px; } .brand small { font-size: 11px; } .side-link svg { width: 16px; height: 16px; }  .sidebar { padding: 11px 8px; } .brand { margin-bottom: 16px; justify-content: center; } .brand strong { font-size: 18px; } .brand small { font-size: 11px; } .side-nav { margin-top: 18px; gap: 3px; } .side-link { padding: 6px 6px; font-size: 11px; gap: 6px; } .side-link svg { width: 19px; }  .side-divider { margin: 4px 2px; } .footer-links { gap: 2px; } .footer-link { font-size: 11px; padding: 4px 6px; gap: 5px; } .emergency-card { padding: 8px; gap: 6px; } .emergency-card strong { font-size: 11px; } .emergency-card small { font-size: 11px; margin: 5px 0 4px; } .emergency-card b { font-size: 11px; } .user-chip { padding: 5px; gap: 5px; } .user-chip strong { font-size: 11px; } .user-chip small { font-size: 11px; } .chip-avatar { width: 20px; height: 20px; font-size: 11px; } .hub-content { padding: 22px 14px 36px; } } @media (max-width: 600px) { .hub-content { padding: 18px 11px 28px; } h1 { font-size: 27px; } .hub-header { flex-direction: column; } .quick-exit { align-self: flex-start; } .critical-banner { align-items: flex-start; padding: 16px; } .critical-banner strong { font-size: 16px; } .critical-banner small { font-size: 11px; } .hub-card { padding: 18px 14px; border-radius: 11px; } .hub-card h2 { font-size: 16px; } .emergency-grid, .right-help { grid-template-columns: 1fr; } .contact-row.urgent { min-height: 0; } .card-title-row { align-items: flex-start; flex-direction: column; } .contact-search { width: 100%; padding: 9px 10px; border: 1px solid #dce5ef; border-radius: 7px; } .map-preview { height: 210px; } }
  
    @media (min-width: 851px) {
      .side-link { font-size: 12px !important; padding: 10px 12px !important; gap: 10px !important; min-width: 0; overflow: hidden; }
      .side-link span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; display: block; } .side-link svg { flex-shrink: 0; }
      .brand strong { font-size: 16px !important; }
      .brand small { font-size: 11px !important; }
    }
  `}</style>
  </main>;
}
