"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "../components/DashboardNavIcon";
import { DASHBOARD_NAV } from "../components/dashboardNav";

const INCIDENT_TYPES = [
  "Phishing Link",
  "Financial Scam",
  "WhatsApp Takeover",
  "Cyberbullying",
  "Malware",
  "Identity Theft",
];

function Icon({ name, size = 22 }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "shield") return <svg {...shared}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "home") return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "book") return <svg {...shared}><path d="M4 19a2 2 0 0 1 2-2h14" /><path d="M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>;
  if (name === "alert") return <svg {...shared}><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === "chat") return <svg {...shared}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.6-4.3A8.4 8.4 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" /></svg>;
  if (name === "phone") return <svg {...shared}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
  if (name === "search") return <svg {...shared}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "calendar") return <svg {...shared}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
  if (name === "pin") return <svg {...shared}><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "upload") return <svg {...shared}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v13" /></svg>;
  return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
}

function Sidebar({ router }) {
  const items = DASHBOARD_NAV;

  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => router.push("/")}>
        <span className="brand-icon"><Icon name="shield" size={28} /></span>
        <span><strong>CyberSafe</strong><small>South Africa</small></span>
      </button>
      <nav className="side-nav" aria-label="Dashboard navigation">
        {items.map(([label, route, icon]) => (
          <button key={label} className={`side-link ${route === "/postReport" ? "active" : ""}`} type="button" onClick={() => router.push(route)}>
            <DashboardNavIcon name={icon} size={25} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="emergency-card" type="button" onClick={() => router.push("/help")}>
        <span className="emergency-icon"><Icon name="phone" size={23} /></span>
        <span><strong>EMERGENCY</strong><small>Victim of a scam or cyber hack?</small><b>Get Help Now</b></span>
      </button>
    </aside>
  );
}

export default function PostReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({ incidentType: "", description: "", incidentDate: "", location: "", anonymous: true, file: null });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.incidentType && form.description.trim().length >= 10;
  const today = new Date().toISOString().slice(0, 10);

  function updateForm(event) {
    const { name, value, type, checked, files } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : files ? files[0] ?? null : value }));
  }

  function readEvidenceImage(file) {
    if (!file?.type.startsWith("image/")) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The selected image could not be read."));
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);

    let evidenceImage = null;
    try {
      evidenceImage = await readEvidenceImage(form.file);
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const localReport = {
        id: `report-${Date.now()}`,
        name: form.anonymous ? "Anonymous" : "CyberSafe member",
        text: form.description.trim(),
        location: form.location.trim(),
        incidentDate: form.incidentDate,
        issues: [form.incidentType],
        image: evidenceImage,
        time: "Just now",
        likes: 0,
        comments: 0,
        liked: false,
        saved: false,
      };

      try {
        const reports = JSON.parse(localStorage.getItem("cybersafeReports") || "[]");
        localStorage.setItem("cybersafeReports", JSON.stringify([localReport, ...reports]));
        router.push("/feed");
        return;
      } catch {
        setSubmitError("This device could not save the report locally. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from("posts").insert({
      display_name: form.anonymous ? "Anonymous" : "CyberSafe member",
      description: form.description.trim(),
      location: form.location.trim() || null,
      issues: [form.incidentType],
      image_url: evidenceImage,
      status: "approved",
    });

    if (error) {
      setSubmitError("We could not submit your report. Please try again or use Get Help Now if you need urgent support.");
      setIsSubmitting(false);
      return;
    }
    router.push("/feed");
  }

  return (
    <main className="report-dashboard">
      <Sidebar router={router} />
      <section className="dashboard-content">
        <header className="page-header">
          <div className="page-intro">
            <div className="title-row"><h1>Report Cyber Crime</h1><span>Community Safety Hub</span></div>
            <p>Securely submit incident details to alert the community and access direct legal/SAPS support channels.</p>
          </div>
          <div className="header-actions">
            <label className="platform-search"><Icon name="search" size={22} /><input aria-label="Search platform" placeholder="Search platform..." /></label>
            <button className="help-button" type="button" onClick={() => router.push("/help")}>Get Help Now</button>
          </div>
        </header>

        <div className="content-grid">
          <form className="report-card" onSubmit={handleSubmit}>
            <div className="card-heading"><h2>Incident Form</h2><p>Provide as much information as possible. Your safety and privacy are our priority.</p></div>

            <fieldset className="incident-types"><legend>What type of incident occurred?</legend><div className="type-options">
              {INCIDENT_TYPES.map((type) => <button key={type} type="button" className={form.incidentType === type ? "type-button selected" : "type-button"} onClick={() => setForm((current) => ({ ...current, incidentType: type }))}>{type}</button>)}
            </div></fieldset>

            <label className="field-label" htmlFor="description">Detailed Description</label>
            <textarea id="description" name="description" value={form.description} onChange={updateForm} placeholder="Tell us what happened, how you were contacted, and what information or money may be at risk..." rows={5} />

            <div className="two-fields">
              <label className="field-label" htmlFor="incidentDate">Date of Incident<span className="input-shell"><Icon name="calendar" size={21} /><input id="incidentDate" name="incidentDate" type="date" max={today} value={form.incidentDate} onChange={updateForm} /></span></label>
              <label className="field-label" htmlFor="location">Location (Province/City)<span className="input-shell"><Icon name="pin" size={21} /><input id="location" name="location" placeholder="e.g. Johannesburg, Gauteng" value={form.location} onChange={updateForm} /></span></label>
            </div>

            <label className="anonymous-option"><span><strong>Post Anonymously to Safety Feed</strong><small>This alerts other South Africans in your area without revealing your personal identity.</small></span><input name="anonymous" type="checkbox" checked={form.anonymous} onChange={updateForm} aria-label="Post anonymously" /><i /></label>

            <div className="form-actions">
              <label className="upload-button"><Icon name="upload" size={21} /><span>{form.file ? form.file.name : "Upload Evidence "}</span><input name="file" type="file" accept="application/pdf,image/png,image/jpeg" onChange={updateForm} hidden /></label>
              <button className="submit-button" type="submit" disabled={!canSubmit || isSubmitting}>{isSubmitting ? "Submitting report..." : "Submit Incident Report"}</button>
            </div>
            {submitError && <p className="submit-error" role="alert">{submitError}</p>}
            <p className="privacy-note">Do not include passwords, PINs, one-time passwords, full card numbers, or ID numbers.</p>
          </form>

          <aside className="report-summary">
            <h2>Your Active Reports</h2>
            <div className="status-card">
              <span className="case-number">YOUR REPORT JOURNEY</span>
              <p className="status-title">What happens after submission?</p>
              <ol>
                <li className="complete">Submitted securely</li>
                <li>Reviewed for safety and relevance</li>
                <li>Escalated if SAPS or bank action is needed</li>
                <li>Community alert published anonymously</li>
              </ol>
            </div>
            <div className="report-tip"><strong>Need urgent help?</strong><p>If money is moving or account access is at risk, call your bank immediately.</p><button type="button" onClick={() => router.push("/help")}>Open support hub</button></div>
          </aside>
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .report-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
        .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 30px 28px 28px; border-right: 1px solid #e2e9f2; background: #fff; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 0; border: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; } .brand-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; background: #e6faff; color: #31c7e6; } .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 26px; line-height: 1; letter-spacing: -1px; } .brand small { display: block; margin-top: 5px; color: #31c7e6; font-size: 15px; font-weight: 700; }
        .side-nav { display: grid; gap: 9px; margin-top: 42px; } .side-link { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 17px; border: 0; border-radius: 14px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 18px; font-weight: 600; text-align: left; } .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; } .side-link.active svg { color: #31c7e6; }
        .emergency-card { display: flex; align-items: flex-start; gap: 13px; margin-top: auto; padding: 20px; border: 2px solid #ff5a5f; border-radius: 20px; background: #fff4f4; color: #ff5158; cursor: pointer; font: inherit; text-align: left; } .emergency-icon { flex: 0 0 auto; } .emergency-card strong, .emergency-card small, .emergency-card b { display: block; } .emergency-card strong { font-size: 17px; } .emergency-card small { margin: 13px 0 7px; color: #536179; font-size: 13px; line-height: 1.4; } .emergency-card b { color: #ff5158; font-size: 14px; }
        .dashboard-content { min-width: 0; padding: 38px 42px 56px; } .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; border-bottom: 1px solid #dce5ef; } .page-intro { min-width: 0; } .title-row { display: flex; align-items: center; flex-wrap: nowrap; gap: 12px; } h1, h2, strong, legend { font-family: "Syne", Arial, sans-serif; } h1 { margin: 0; white-space: nowrap; font-size: clamp(32px, 3.4vw, 44px); letter-spacing: -2px; line-height: 1; } .title-row span { flex: 0 0 auto; padding: 7px 14px; border-radius: 999px; background: #e0f8fc; color: #2fc4e4; font-size: 13px; font-weight: 800; } .page-intro p { max-width: 720px; margin: 13px 0 0; color: #5b6980; font-size: 18px; line-height: 1.35; }
        .header-actions { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; padding-top: 1px; } .platform-search { display: flex; align-items: center; gap: 10px; width: 245px; padding: 0 16px; border: 1px solid #dce5ef; border-radius: 14px; background: #fff; color: #536179; } .platform-search input { width: 100%; height: 50px; border: 0; outline: 0; color: #26324a; font: inherit; font-size: 15px; } .help-button, .submit-button { border: 0; border-radius: 14px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800; } .help-button { min-height: 50px; padding: 0 23px; white-space: nowrap; }
        .content-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr); gap: 30px; margin-top: 28px; align-items: start; } .report-card, .report-summary { border: 1px solid #dce5ef; border-radius: 20px; background: #fff; box-shadow: 0 8px 24px rgba(36, 56, 87, .035); } .report-card { padding: 36px; } .card-heading h2, .report-summary h2 { margin: 0; font-size: 25px; letter-spacing: -1px; } .card-heading p { margin: 10px 0 0; color: #65738a; font-size: 16px; line-height: 1.45; }
        .incident-types { margin: 40px 0 27px; padding: 0; border: 0; } .incident-types legend, .field-label { display: block; margin-bottom: 13px; color: #1c263d; font-size: 17px; font-weight: 800; } .type-options { display: flex; flex-wrap: wrap; gap: 13px; } .type-button { padding: 14px 20px; border: 1px solid #dce5ef; border-radius: 14px; background: #f8fafc; color: #536179; cursor: pointer; font: inherit; font-size: 15px; font-weight: 700; } .type-button.selected { border-color: #31c7e6; background: #e6faff; color: #20b6d8; box-shadow: inset 0 0 0 1px #31c7e6; }
        textarea, .input-shell { width: 100%; border: 1px solid #dce5ef; border-radius: 15px; background: #f8fafc; color: #26324a; font: inherit; font-size: 16px; outline: none; } textarea { min-height: 158px; padding: 18px 20px; resize: vertical; line-height: 1.45; } textarea:focus, .input-shell:focus-within { border-color: #31c7e6; box-shadow: 0 0 0 3px rgba(49,199,230,.13); } .two-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 27px; } .input-shell { display: flex; align-items: center; gap: 12px; height: 58px; padding: 0 16px; color: #607087; } .input-shell input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: #26324a; font: inherit; font-size: 16px; }
        .anonymous-option { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 28px; padding: 21px 22px; border-radius: 17px; background: #e5f9fd; cursor: pointer; } .anonymous-option strong, .anonymous-option small { display: block; } .anonymous-option strong { font-size: 16px; } .anonymous-option small { margin-top: 7px; color: #66758b; font-size: 14px; line-height: 1.35; } .anonymous-option input { position: absolute; opacity: 0; pointer-events: none; } .anonymous-option i { position: relative; width: 54px; height: 31px; flex: 0 0 auto; border-radius: 999px; background: #bdc9d7; } .anonymous-option i::after { content: ""; position: absolute; top: 4px; left: 4px; width: 23px; height: 23px; border-radius: 50%; background: #fff; transition: transform .18s; } .anonymous-option input:checked + i { background: #31c7e6; } .anonymous-option input:checked + i::after { transform: translateX(23px); }
        .form-actions { display: grid; grid-template-columns: 1fr 1.2fr; gap: 22px; margin-top: 38px; } .upload-button { display: flex; align-items: center; justify-content: center; gap: 11px; min-height: 62px; padding: 10px 16px; border: 1px solid #dce5ef; border-radius: 15px; background: #f8fafc; color: #536179; cursor: pointer; font-size: 16px; font-weight: 800; overflow: hidden; } .upload-button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .submit-button:disabled { cursor: not-allowed; opacity: .5; } .submit-error { margin: 16px 0 0; color: #d92d20; font-size: 14px; line-height: 1.4; } .privacy-note { margin: 18px 0 0; color: #8996a8; font-size: 12px; line-height: 1.45; }
        .report-summary { padding: 34px; } .status-card { margin-top: 25px; padding: 23px; border: 1px solid #dce5ef; border-radius: 17px; } .case-number { color: #2fc4e4; font-size: 13px; font-weight: 800; letter-spacing: .04em; } .status-title { margin: 18px 0; font-family: "Syne", Arial, sans-serif; font-size: 18px; font-weight: 800; } .status-card ol { display: grid; gap: 15px; margin: 0; padding: 0; list-style: none; color: #8b97a8; font-size: 14px; } .status-card li { position: relative; padding-left: 28px; } .status-card li::before { content: ""; position: absolute; top: 3px; left: 0; width: 14px; height: 14px; border-radius: 50%; background: #e9eef4; } .status-card li.complete { color: #202c42; font-weight: 700; } .status-card li.complete::before { background: #16bf89; }
        .report-tip { margin-top: 24px; padding: 22px; border-radius: 17px; background: #fff4f4; } .report-tip strong { color: #d92d20; font-size: 16px; } .report-tip p { margin: 8px 0 16px; color: #65738a; font-size: 14px; line-height: 1.4; } .report-tip button { border: 0; background: transparent; color: #d92d20; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; padding: 0; }
        @media (max-width: 1180px) { .report-dashboard { grid-template-columns: 270px minmax(0, 1fr); } .sidebar { padding: 28px 20px 25px; } .dashboard-content { padding: 34px 30px 52px; } .side-link { font-size: 17px; } .page-header { align-items: flex-start; flex-direction: column; } .header-actions { width: 100%; } .platform-search { flex: 1; } }
        @media (max-width: 850px) { .report-dashboard { display: block; } .sidebar { position: static; height: auto; padding: 18px; border-right: 0; border-bottom: 1px solid #dce5ef; } .brand { margin-bottom: 16px; } .brand strong { font-size: 23px; } .brand small { font-size: 13px; } .side-nav { display: flex; gap: 7px; overflow-x: auto; margin: 0; } .side-link { width: auto; min-width: max-content; padding: 10px 13px; border-radius: 11px; font-size: 14px; } .side-link svg { width: 19px; } .emergency-card { display: none; } .dashboard-content { padding: 27px 18px 45px; } .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .dashboard-content { padding: 22px 14px 35px; } h1 { font-size: 34px; } .page-intro p { font-size: 16px; } .header-actions, .form-actions, .two-fields { grid-template-columns: 1fr; display: grid; } .platform-search { width: 100%; } .help-button { min-height: 48px; } .report-card, .report-summary { padding: 24px 18px; border-radius: 18px; } .card-heading h2, .report-summary h2 { font-size: 23px; } .type-button { padding: 11px 13px; font-size: 13px; } .anonymous-option { align-items: flex-start; } .anonymous-option i { margin-top: 7px; } }
      `}</style>
    </main>
  );
}
