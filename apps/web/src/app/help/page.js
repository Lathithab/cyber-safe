"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { emergency, banks, networks, geoLinks } from "./contacts";
import BottomNav from "../components/BottomNav";

export default function HelpPage() {
  const router = useRouter();

  // ── Quick exit ────────────────────────────────
  // Immediately Leaves the app and relocates to Googgle
  function quickExit() {
    window.location.replace("https://www.google.com");
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") quickExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openMaps(query) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ── Icons ─────────────────────────────────────
  const PhoneIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );

  const PinIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const CallRow = ({ c, urgent }) => (
    <a className={`row ${urgent ? "row-urgent" : ""}`} href={`tel:${c.tel}`}>
      <div className="row-text">
        <span className="row-name">{c.name}</span>
        <span className="row-detail">{c.detail}</span>
      </div>
      <div className="row-action">
        <span className="row-num">{formatNumber(c.tel)}</span>
        <span className="row-icon">
          <PhoneIcon />
        </span>
      </div>
    </a>
  );

  return (
    <div className="help-page">
      {/* Top bar */}
      <div className="help-topbar">
        <button
          className="back-btn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="help-title">Get Help</span>
        <button
          className="exit-btn"
          onClick={quickExit}
          aria-label="Quick exit to a neutral page"
        >
          Quick exit
        </button>
      </div>

      <div className="help-body">
        {/* Safety banner  */}
        <div className="alert">
          <div className="alert-head">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>Being scammed right now?</span>
          </div>
          <p className="alert-text">
            <strong>Call your bank immediately</strong> if money is moving or
            someone has your details.
          </p>
        </div>

        {/* Emergency */}
        <Section title="Emergency" hint="Police & crime lines">
          {emergency.map((c) => (
            <CallRow key={c.name} c={c} urgent />
          ))}
        </Section>

        {/* Banks */}
        <Section
          title="Your bank's fraud line"
          hint="Tap to call — report fraud or stop a card"
        >
          {banks.map((c) => (
            <CallRow key={c.name} c={c} />
          ))}
        </Section>

        {/* Networks */}
        <Section
          title="Mobile network"
          hint="Report SIM-swap fraud or a lost SIM"
        >
          {networks.map((c) => (
            <CallRow key={c.name} c={c} />
          ))}
        </Section>

        {/* Geo help */}
        <Section title="Find help near you" hint="Opens your maps app ">
          <div className="geo-grid">
            {geoLinks.map((g) => (
              <button
                key={g.label}
                className="geo-btn"
                onClick={() => openMaps(g.query)}
              >
                <span className="geo-icon">
                  <PinIcon />
                </span>
                <span className="geo-label">{g.label}</span>
                <span className="geo-note">{g.note}</span>
              </button>
            ))}
          </div>
        </Section>

        <p className="disclaimer">
          Contact numbers should be confirmed against each provider's official
          website. If you are in immediate danger, call 10111.
        </p>
      </div>

      <BottomNav />

      <style>{`
        .help-page {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f5f7fa;
          font-family: "DM Sans", Arial, sans-serif;
          color: #0e1b24;
          padding-bottom: 104px;
        }

        /* Top bar */
        .help-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #30C9E8;
          color: #fff;
        }
        .back-btn {
          background: rgba(255,255,255,0.18);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
          transition: background 0.15s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.3); }
        .help-title {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 20px;
          flex: 1;
        }
        .exit-btn {
          background: #0e1b24;
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 999px;
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          flex: none;
          transition: opacity 0.15s;
        }
        .exit-btn:hover { opacity: 0.85; }

        .help-body { padding: 16px 15px; }

        /* Safety alert */
        .alert {
          background: #fdecec;
          border: 1px solid #f3c0c0;
          border-left: 4px solid #d92d20;
          border-radius: 14px;
          padding: 15px 16px;
          margin-bottom: 22px;
        }
        .alert-head {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b42318;
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .alert-text {
          font-size: 14px;
          line-height: 1.5;
          color: #5c1f1a;
        }
        .alert-text strong { color: #b42318; }

        /* Sections */
        .section { margin-bottom: 24px; }
        .section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          margin: 0 4px 10px;
        }
        .section-title {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: #0e1b24;
        }
        .section-hint {
          font-size: 12px;
          color: #6b7c86;
          text-align: right;
        }

        /* Call rows */
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #fff;
          border: 1px solid #e3e9ee;
          border-radius: 14px;
          padding: 13px 15px;
          margin-bottom: 9px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.1s, box-shadow 0.15s, border-color 0.15s;
        }
        .row:hover {
          border-color: #30C9E8;
          box-shadow: 0 4px 14px -8px rgba(14,27,36,0.25);
        }
        .row:active { transform: scale(0.99); }

        .row-urgent {
          background: #fff6f5;
          border-color: #f4ccc7;
        }
        .row-urgent:hover { border-color: #d92d20; }

        .row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .row-name {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #0e1b24;
        }
        .row-detail { font-size: 12.5px; color: #6b7c86; }

        .row-action {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: none;
        }
        .row-num {
          font-variant-numeric: tabular-nums;
          font-weight: 700;
          font-size: 14px;
          color: #0e7c93;
        }
        .row-urgent .row-num { color: #b42318; }
        .row-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #30C9E8;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .row-urgent .row-icon { background: #d92d20; }

        /* Geo */
        .geo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .geo-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          background: #fff;
          border: 1px solid #e3e9ee;
          border-radius: 14px;
          padding: 15px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: "DM Sans", sans-serif;
        }
        .geo-btn:hover {
          border-color: #30C9E8;
          box-shadow: 0 4px 14px -8px rgba(14,27,36,0.25);
        }
        .geo-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #dff6fb;
          color: #0e7c93;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .geo-label {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #0e1b24;
          line-height: 1.25;
        }
        .geo-note { font-size: 11.5px; color: #6b7c86; }

        .disclaimer {
          margin-top: 18px;
          font-size: 12px;
          color: #8a99a3;
          line-height: 1.5;
          text-align: center;
          padding: 0 8px;
        }

        @media (max-width: 380px) {
          .row-num { display: none; }
        }
      `}</style>
    </div>
  );
}

// Small presentational section wrapper.
function Section({ title, hint, children }) {
  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">{title}</span>
        {hint && <span className="section-hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// 0860010111 -> 0860 010 111  (display only; tel: uses raw digits)
function formatNumber(tel) {
  if (tel.length <= 5) return tel;
  return tel.replace(/(\d{4})(\d{3})(\d{3,})/, "$1 $2 $3");
}
