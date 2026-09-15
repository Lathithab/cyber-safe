"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const WHATSAPP_URL = "https://wa.me/27618780277?text=Hello%20CyberBot";

function Icon({ name, size = 24 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "home") return <svg {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "book") return <svg {...props}><path d="M4 19a2 2 0 0 1 2-2h14" /><path d="M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>;
  if (name === "alert") return <svg {...props}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "phone") return <svg {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  return <svg {...props}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.6-4.3A8.4 8.4 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" /></svg>;
}

export default function CyberBotPage() {
  const router = useRouter();
  const links = DASHBOARD_NAV;
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    QRCode.toDataURL(WHATSAPP_URL, { width: 280, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, []);

  return <main className="cyberbot-page">
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => router.push("/")}><span className="brand-icon"><Icon name="shield" size={28} /></span><span><strong>CyberSafe</strong><small>South Africa</small></span></button>
      <nav className="side-nav" aria-label="Dashboard navigation">{links.map(([label, route, icon]) => <button key={label} className={`side-link ${route === "/cyberbot" ? "active" : ""}`} type="button" onClick={() => router.push(route)}><DashboardNavIcon name={icon} /><span>{label}</span></button>)}</nav>
    </aside>
    <section className="cyberbot-content" aria-label="CyberBot AI">
      <div className="cyberbot-card">
        <span className="chat-icon"><DashboardNavIcon name="chat" size={30} /></span>
        <p className="eyebrow">CyberBot AI</p>
        <h1>Chat with CyberBot on WhatsApp</h1>
        <p>Scan this QR code with your phone camera to start a conversation with the CyberSafe WhatsApp assistant.</p>
        {qrCode && <img className="qr-code" src={qrCode} alt="QR code that opens CyberBot on WhatsApp" />}
        <a className="whatsapp-button" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Open WhatsApp</a>
        <small>Only share safe details. Never send a PIN, password, OTP, or full card number.</small>
      </div>
    </section>
    <style>{`
      * { box-sizing: border-box; } .cyberbot-page { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; } .sidebar { position: sticky; top: 0; height: 100vh; padding: 30px 28px; border-right: 1px solid #e2e9f2; background: #fff; } .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; } .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
      .cyberbot-content { display: grid; min-height: 100vh; place-items: center; padding: 48px 26px; } .cyberbot-card { width: min(100%, 510px); padding: 38px; border: 1px solid #dce5ef; border-radius: 24px; background: #fff; box-shadow: 0 12px 32px rgba(36, 56, 87, .07); text-align: center; } .chat-icon { display: grid; place-items: center; width: 62px; height: 62px; margin: 0 auto 18px; border-radius: 18px; background: #e6faff; color: #31c7e6; } .eyebrow { margin: 0; color: #20b6d8; font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } h1 { margin: 9px 0 13px; font-family: "Syne", Arial, sans-serif; font-size: clamp(28px, 3vw, 36px); letter-spacing: -1.5px; } .cyberbot-card > p { max-width: 400px; margin: 0 auto; color: #65738a; font-size: 16px; line-height: 1.5; } .qr-code { display: block; width: 250px; height: 250px; margin: 27px auto 23px; padding: 10px; border: 1px solid #dce5ef; border-radius: 16px; background: #fff; } .whatsapp-button { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 24px; border-radius: 13px; background: #31c7e6; color: #102039; font-size: 15px; font-weight: 800; text-decoration: none; } .cyberbot-card small { display: block; max-width: 390px; margin: 19px auto 0; color: #8996a8; font-size: 12px; line-height: 1.45; }
      @media (max-width: 850px) { .cyberbot-page { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #e2e9f2; } .brand { margin-bottom: 16px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .cyberbot-content { min-height: auto; padding: 32px 18px; } } @media (max-width: 480px) { .cyberbot-content { padding: 22px 14px; } .cyberbot-card { padding: 28px 18px; } .qr-code { width: 220px; height: 220px; } }
    `}</style>
  </main>;
}
