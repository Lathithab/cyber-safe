"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { emergency, banks, networks, geoLinks } from "./contacts";
import DashboardNavIcon from "../components/DashboardNavIcon";

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
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
  const links = [["Home Feed", "/", "home"], ["Learn Security", "/learn", "learn"], ["Scam Library", "/library", "library"], ["Report Incident", "/postReport", "report"], ["Get Help", "/help", "help"], ["CyberBot AI", "/cyberbot", "chat"]];
  return <aside className="sidebar">
    <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
    <nav className="side-nav" aria-label="Dashboard navigation">{links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/help" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} size={25} /><span>{label}</span></button>)}</nav>
    <div className="emergency-card"><span className="emergency-icon"><Icon name="phone" size={23} /></span><span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Use this hub for help</b></span></div>
  </aside>;
}

function formatNumber(tel) {
  if (tel.length <= 5) return tel;
  return tel.replace(/(\d{4})(\d{3})(\d{3,})/, "$1 $2 $3");
}

function ContactRow({ contact, urgent = false }) {
  return <a className={`contact-row ${urgent ? "urgent" : ""}`} href={`tel:${contact.tel}`}><span><strong>{contact.name}</strong><small>{contact.detail}</small></span><span className="call-action"><b>{formatNumber(contact.tel)}</b><i><Icon name="phone" size={18} /></i></span></a>;
}

export default function HelpPage() {
  const router = useRouter();
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
    <Sidebar router={router} />
    <section className="hub-content">
      <header className="hub-header">
        <div><p className="eyebrow">CyberSafe support</p><h1> Helpline Hub</h1><p>Official South African support contacts for scam, fraud and cybercrime incidents.</p></div>
        <button className="quick-exit" type="button" onClick={quickExit}><Icon name="exit" size={20} />Quick exit</button>
      </header>

      <section className="critical-banner" aria-label="Critical help guidance"><span className="banner-icon"><Icon name="phone" size={31} /></span><span><strong> HELPLINE HUB</strong><small>Have you lost money or personal access? Call these official South African hotlines immediately for professional help.</small></span></section>

      <div className="hub-grid">
        <div className="main-help">
          <section className="hub-card emergency-services"><h2>National Emergency Services</h2><div className="emergency-grid">{emergency.slice(0, 2).map((contact) => <ContactRow key={contact.name} contact={contact} urgent />)}</div><p className="emergency-note">From a cellphone, you can also call <a href={`tel:${emergency[2].tel}`}>{emergency[2].tel}</a> for emergency services.</p></section>
          <section className="hub-card"><div className="card-title-row"><h2>SA Bank Fraud Hotlines</h2><label className="contact-search"><Icon name="search" size={20} /><input value={bankSearch} onChange={(event) => setBankSearch(event.target.value)} placeholder="Search bank..." aria-label="Search bank fraud lines" /></label></div><div className="contact-list">{filteredBanks.map((contact) => <ContactRow key={contact.name} contact={contact} />)}{!filteredBanks.length && <p className="empty-state">No bank matches that search.</p>}</div></section>
          <section className="hub-card"><h2>Telecom &amp; Network Fraud</h2><p className="card-subtitle">Report a SIM-swap, lost SIM, or suspicious network activity.</p><div className="contact-list">{networks.map((contact) => <ContactRow key={contact.name} contact={contact} />)}</div></section>
        </div>

        <aside className="right-help">
          <section className="hub-card police-card"><h2>Find Nearest Police Station</h2><button className="map-preview" type="button" onClick={() => openMaps(geoLinks[0].query)} aria-label="Find nearest police station on Google Maps"><span className="street street-one" /><span className="street street-two" /><span className="street street-three" /><span className="map-marker marker-one"><Icon name="pin" size={21} /></span><span className="map-marker marker-two"><Icon name="pin" size={21} /></span><span className="map-marker marker-three"><Icon name="pin" size={21} /></span><b>Open map</b></button><button className="map-link" type="button" onClick={() => openMaps(geoLinks[0].query)}><Icon name="pin" size={20} />Find the nearest SAPS station</button></section>
          <section className="hub-card resource-card"><h2>Important Safety Notes</h2><ul><li>This app provides awareness and support guidance, not emergency protection.</li><li>Only use a safe, private device if you believe an account is compromised.</li><li>Never share your PIN, password, one-time password, or full card number.</li></ul></section>
        </aside>
      </div>
    </section>

    <style>{`
      * { box-sizing: border-box; } .hub-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
      .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; } .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; line-height: 1; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; } .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link:last-child { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link:last-child svg { color: #31c7e6; } .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: auto; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-family: "Syne", Arial, sans-serif; font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; }
      .side-link:last-child { background: transparent; color: #536179; font-weight: 600; } .side-link:last-child svg { color: currentColor; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
      .hub-content { min-width: 0; padding: 38px 42px 56px; } .hub-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .eyebrow { margin: 0 0 7px; color: #2fc4e4; font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } h1, h2, strong { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; font-size: clamp(32px, 3.4vw, 44px); letter-spacing: -2px; line-height: 1; } .hub-header p:last-child { margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; } .quick-exit { display: flex; align-items: center; gap: 8px; min-height: 47px; padding: 0 18px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
      .critical-banner { display: flex; align-items: center; gap: 18px; margin-top: 28px; padding: 25px 30px; border: 2px solid #ff6266; border-radius: 22px; background: #fff0f1; color: #151b34; } .banner-icon { display: grid; place-items: center; width: 57px; height: 57px; flex: 0 0 auto; border-radius: 50%; background: #fff; color: #ff5158; } .critical-banner strong, .critical-banner small { display: block; } .critical-banner strong { font-size: 24px; letter-spacing: -.7px; } .critical-banner small { margin-top: 7px; color: #5b6980; font-size: 16px; line-height: 1.4; }
      .hub-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr); gap: 30px; margin-top: 30px; align-items: start; } .main-help { display: grid; gap: 28px; } .right-help { display: grid; gap: 28px; } .hub-card { padding: 30px; border: 1px solid #dce5ef; border-radius: 22px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .hub-card h2 { margin: 0; font-size: 24px; letter-spacing: -1px; } .card-subtitle { margin: 9px 0 19px; color: #65738a; font-size: 14px; }
      .emergency-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 25px; } .emergency-note { margin: 17px 0 0; color: #65738a; font-size: 13px; } .emergency-note a { color: #25b9da; font-weight: 800; text-decoration: none; }
      .contact-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 18px; border: 1px solid #dce5ef; border-radius: 15px; background: #fff; color: #121a32; text-decoration: none; transition: border-color .15s, box-shadow .15s, transform .15s; } .contact-row:hover { border-color: #31c7e6; box-shadow: 0 8px 16px rgba(36,56,87,.08); transform: translateY(-1px); } .contact-row.urgent { min-height: 114px; border-color: #ffb3b7; background: #fff8f8; } .contact-row > span:first-child { min-width: 0; } .contact-row strong, .contact-row small { display: block; } .contact-row strong { font-size: 16px; } .contact-row small { margin-top: 5px; color: #66758b; font-size: 13px; } .call-action { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; } .call-action b { color: #25b9da; font-size: 15px; } .urgent .call-action b { color: #ff5158; font-size: 22px; } .call-action i { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: #31c7e6; color: #fff; } .urgent .call-action i { background: #ff5158; } .contact-list { display: grid; gap: 10px; margin-top: 21px; } .card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; } .contact-search { display: flex; align-items: center; gap: 8px; width: 210px; color: #536179; } .contact-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 14px; } .empty-state { margin: 4px 0; color: #65738a; font-size: 14px; }
      .map-preview { position: relative; width: 100%; height: 260px; margin-top: 21px; overflow: hidden; border: 0; border-radius: 15px; background: linear-gradient(145deg, #d8e6e8 0 38%, #c4d3d6 38% 68%, #dce7db 68%); cursor: pointer; } .map-preview::before, .map-preview::after { content: ""; position: absolute; inset: -20% -10%; background: repeating-linear-gradient(32deg, transparent 0 34px, rgba(39, 123, 155, .64) 35px 39px, transparent 40px 76px); transform: rotate(-10deg); } .map-preview::after { background: repeating-linear-gradient(120deg, transparent 0 44px, rgba(255, 176, 78, .8) 45px 51px, transparent 52px 102px); transform: rotate(9deg); opacity: .8; } .street { position: absolute; z-index: 1; display: block; height: 12px; border-radius: 999px; background: #2f8eb3; transform: rotate(25deg); } .street-one { top: 45%; left: -8%; width: 120%; } .street-two { top: 20%; left: 12%; width: 95%; transform: rotate(112deg); } .street-three { top: 67%; left: 14%; width: 83%; transform: rotate(-22deg); } .map-marker { position: absolute; z-index: 2; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; background: #fff; color: #ff775e; box-shadow: 0 3px 10px rgba(30, 48, 66, .25); transform: rotate(-45deg); } .map-marker svg { transform: rotate(45deg); } .marker-one { top: 29%; left: 35%; } .marker-two { top: 56%; left: 61%; } .marker-three { top: 43%; right: 13%; } .map-preview b { position: absolute; z-index: 3; right: 14px; bottom: 13px; padding: 8px 11px; border-radius: 8px; background: #fff; color: #314159; font-size: 13px; }
      .map-link { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 0; border: 0; background: transparent; color: #5b6980; cursor: pointer; font: inherit; font-size: 14px; text-align: left; } .map-link svg { color: #31c7e6; } .resource-card ul { display: grid; gap: 15px; margin: 22px 0 0; padding: 0; list-style: none; color: #65738a; font-size: 14px; line-height: 1.45; } .resource-card li { position: relative; padding-left: 20px; } .resource-card li::before { content: ""; position: absolute; top: .45em; left: 0; width: 8px; height: 8px; border-radius: 50%; background: #31c7e6; }
      @media (max-width: 1180px) { .hub-dashboard { grid-template-columns: 270px minmax(0, 1fr); } .sidebar { padding: 28px 20px 25px; } .hub-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } .hub-grid { grid-template-columns: 1fr; } .right-help { grid-template-columns: 1fr 1fr; } } @media (max-width: 850px) { .hub-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .brand strong { font-size: 23px; } .brand small { font-size: 13px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .emergency-card { display: none; } .hub-content { padding: 27px 18px 45px; } } @media (max-width: 600px) { .hub-content { padding: 22px 14px 35px; } h1 { font-size: 34px; } .hub-header { flex-direction: column; } .quick-exit { align-self: flex-start; } .critical-banner { align-items: flex-start; padding: 20px; } .critical-banner strong { font-size: 20px; } .critical-banner small { font-size: 14px; } .hub-card { padding: 22px 17px; border-radius: 18px; } .hub-card h2 { font-size: 21px; } .emergency-grid, .right-help { grid-template-columns: 1fr; } .contact-row.urgent { min-height: 0; } .card-title-row { align-items: flex-start; flex-direction: column; } .contact-search { width: 100%; padding: 11px 13px; border: 1px solid #dce5ef; border-radius: 12px; } .map-preview { height: 210px; } }
    `}</style>
  </main>;
}
