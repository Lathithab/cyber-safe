"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const threats = [
  {
    id: "whatsapp-takeover",
    category: "WhatsApp",
    title: "WhatsApp verification-code scam",
    summary: "A scammer asks for the six-digit code sent to your phone, then takes over your WhatsApp account.",
    signs: ["They say they sent a code by mistake.", "They pressure you to send the code quickly.", "The message comes from a known contact whose account may be compromised."],
    action: "Never share a WhatsApp verification code. Enable two-step verification in WhatsApp and warn your contacts if you shared one.",
  },
  {
    id: "banking-phishing",
    category: "Banking",
    title: "Fake bank SMS or phishing link",
    summary: "A message claims there is a payment, account block, or security problem and asks you to tap a link.",
    signs: ["The link is shortened or does not match your bank’s official website.", "It asks for a PIN, password, card details, or OTP.", "It creates urgency with threats or a surprising payment."],
    action: "Do not use the link. Open your official banking app or call the number on the back of your card. If money is moving, call your bank now.",
  },
  {
    id: "sim-swap",
    category: "SIM swap",
    title: "SIM-swap fraud",
    summary: "Your number unexpectedly loses service while scammers try to receive your banking one-time passwords.",
    signs: ["Your phone suddenly shows no signal or cannot make calls.", "You receive an unexpected SIM-swap notification.", "Your banking app or account details change unexpectedly."],
    action: "Call your mobile network from another phone immediately, then contact your bank and change important passwords from a safe device.",
  },
  {
    id: "job-fee",
    category: "Job scams",
    title: "Job offer that asks for a fee",
    summary: "A supposed recruiter offers work, then asks for payment for training, equipment, a background check, or a placement fee.",
    signs: ["The salary is unusually high for little information.", "They ask for money before you start work.", "The sender uses a free email address rather than the company domain."],
    action: "Do not pay or share ID documents. Independently verify the vacancy on the employer’s official website or switchboard.",
  },
  {
    id: "marketplace-payment",
    category: "Marketplace",
    title: "Fake proof-of-payment",
    summary: "A buyer sends a convincing payment confirmation and pressures you to release goods before the money has cleared.",
    signs: ["They insist on courier collection immediately.", "The payment email or screenshot looks unusual.", "Your banking app does not show cleared funds."],
    action: "Only release goods after cleared funds appear in your own banking app. A screenshot or email is not proof of payment.",
  },
];

const categories = ["All", ...new Set(threats.map((threat) => threat.category))];

export default function LibraryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return threats.filter((threat) => {
      const matchesCategory = category === "All" || threat.category === category;
      const searchable = `${threat.title} ${threat.summary} ${threat.signs.join(" ")}`.toLowerCase();
      return matchesCategory && (!term || searchable.includes(term));
    });
  }, [category, query]);

  return (
    <main className="library-page">
      <header className="library-header">
        <button className="back-button" onClick={() => router.push("/")} type="button" aria-label="Go to home">←</button>
        <div>
          <p className="eyebrow">CyberSafe</p>
          <h1>Threat &amp; Scam Library</h1>
        </div>
      </header>

      <section className="urgent-card">
        <strong>Being scammed right now?</strong>
        <span>Call your bank immediately if money or account details are at risk.</span>
        <button onClick={() => router.push("/help")} type="button">Get help now</button>
      </section>

      <label className="search-label" htmlFor="library-search">Search a scam, app, message or warning sign</label>
      <input id="library-search" className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. WhatsApp code, fake bank SMS" />

      <div className="category-list" aria-label="Scam categories">
        {categories.map((item) => (
          <button className={`category ${category === item ? "selected" : ""}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>
        ))}
      </div>

      <p className="result-count">{results.length} {results.length === 1 ? "guide" : "guides"}</p>
      <section className="threat-list" aria-label="Scam guides">
        {results.map((threat) => {
          const expanded = selectedId === threat.id;
          return (
            <article className="threat-card" key={threat.id}>
              <button className="threat-heading" onClick={() => setSelectedId(expanded ? null : threat.id)} type="button" aria-expanded={expanded}>
                <span><small>{threat.category}</small><strong>{threat.title}</strong></span>
                <span className="chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
              </button>
              <p>{threat.summary}</p>
              {expanded && (
                <div className="details">
                  <h2>Warning signs</h2>
                  <ul>{threat.signs.map((sign) => <li key={sign}>{sign}</li>)}</ul>
                  <h2>What to do</h2>
                  <p>{threat.action}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {!results.length && <p className="empty">No guide matches that search yet. Try a broader term or visit Help if you need urgent support.</p>}
      <p className="library-note">Guidance only - do not share PINs, passwords, one-time passwords, or full card details.</p>

      <style>{`
        * { box-sizing: border-box; }
        .library-page { min-height: 100vh; max-width: 500px; margin: 0 auto; padding: 12px 15px 40px; background: #f5f7fa; color: #0e1b24; font-family: Arial, sans-serif; }
        .library-header { position: sticky; z-index: 10; top: 0; display: flex; align-items: center; gap: 12px; margin: -12px -15px 22px; padding: 12px 14px; background: #30c9e8; color: #fff; } .back-button { width: 36px; height: 36px; border: 0; border-radius: 50%; background: rgba(255,255,255,.18); color: #fff; cursor: pointer; font-size: 27px; line-height: 1; } .eyebrow { margin: 0 0 2px; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .06em; opacity: .88; text-transform: uppercase; } h1 { margin: 0; font-size: 20px; letter-spacing: -.3px; }
        .urgent-card { display: grid; gap: 5px; margin-bottom: 22px; padding: 15px 16px; border: 1px solid #f3c0c0; border-left: 4px solid #d92d20; border-radius: 14px; background: #fdecec; color: #b42318; font-size: 14px; line-height: 1.4; } .urgent-card button { justify-self: start; margin-top: 5px; padding: 8px 11px; border: 0; border-radius: 8px; background: #d92d20; color: #fff; cursor: pointer; font-size: 13px; font-weight: 700; }
        .search-label { display: block; margin-bottom: 7px; color: #0e1b24; font-size: 13px; font-weight: 700; } .search { width: 100%; padding: 13px 14px; border: 1px solid #dbe3e9; border-radius: 12px; background: #fff; color: #0e1b24; font: inherit; font-size: 15px; outline: none; } .search:focus { border-color: #30c9e8; box-shadow: 0 0 0 3px rgba(48, 201, 232, .15); }
        .category-list { display: flex; gap: 8px; overflow-x: auto; margin: 16px 0 18px; padding-bottom: 3px; } .category { flex: 0 0 auto; padding: 8px 12px; border: 1px solid #dbe3e9; border-radius: 999px; background: #fff; color: #3d4c55; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; } .category.selected { border-color: #30c9e8; background: #30c9e8; color: #fff; }
        .result-count { margin: 0 0 10px; color: #6b7c86; font-size: 13px; font-weight: 700; } .threat-list { display: grid; gap: 11px; } .threat-card { padding: 16px; border: 1px solid #dbe3e9; border-radius: 14px; background: #fff; } .threat-heading { display: flex; align-items: flex-start; justify-content: space-between; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; text-align: left; } .threat-heading small { display: block; margin-bottom: 5px; color: #30aeca; font-size: 12px; font-weight: 700; text-transform: uppercase; } .threat-heading strong { display: block; font-size: 17px; line-height: 1.2; } .chevron { margin-left: 12px; color: #30c9e8; font-size: 25px; line-height: .8; } .threat-card > p { margin: 10px 0 0; color: #5b6b75; font-size: 14px; line-height: 1.45; }
        .details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e5edf0; } .details h2 { margin: 0 0 6px; color: #0e1b24; font-size: 14px; } .details ul { margin: 0 0 14px; padding-left: 19px; color: #5b6b75; font-size: 14px; line-height: 1.45; } .details li + li { margin-top: 5px; } .details p { margin: 0; color: #3d4c55; font-size: 14px; font-weight: 600; line-height: 1.45; }
        .empty, .library-note { margin: 24px 4px 0; color: #8a99a3; font-size: 13px; line-height: 1.5; text-align: center; } .library-note { margin-top: 30px; }
      `}</style>
    </main>
  );
}
