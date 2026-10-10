"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

const sections = [
  { title: "Community Feed", route: "/feed", keywords: "posts community alerts scam warnings" },
  { title: "Learn Security", route: "/learn", keywords: "learning academy modules quizzes lessons" },
  { title: "Scam Library", route: "/library", keywords: "scams guides examples warning signs phishing" },
  { title: "Report Incident", route: "/postReport", keywords: "report incident cybercrime fraud" },
  { title: "Get Help", route: "/help", keywords: "help emergency bank hotline support" },
  { title: "CyberBot AI", route: "/cyberbot", keywords: "chat chatbot ask assistant" },
  { title: "Notifications", route: "/notification", keywords: "alerts updates notifications" },
  { title: "User Profile", route: "/profiles", keywords: "account profile user" },
  { title: "Settings", route: "/settings", keywords: "preferences account settings" },
];

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export default function PlatformSearch({ className = "platform-search" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [guides, setGuides] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const term = query.trim().toLowerCase();

  const matchingSections = useMemo(() => {
    if (!term) return [];
    return sections.filter((section) => `${section.title} ${section.keywords}`.toLowerCase().includes(term)).slice(0, 4);
  }, [term]);

  const guideResults = useMemo(() => {
    if (!term) return [];
    return guides.filter((guide) => `${guide.title} ${guide.summary} ${guide.category}`.toLowerCase().includes(term)).slice(0, 4);
  }, [guides, term]);

  const results = useMemo(() => [
    ...matchingSections.map((section) => ({ ...section, kind: "section" })),
    ...guideResults.map((guide) => ({
      title: guide.title,
      description: `${guide.category} · Scam guide`,
      route: `/library?search=${encodeURIComponent(query.trim())}&guide=${encodeURIComponent(guide.slug)}`,
      kind: "guide",
    })),
  ], [matchingSections, guideResults, query]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    let isCurrent = true;

    async function loadGuides() {
      const { data, error } = await supabase
        .from("scam_guides")
        .select("slug, category, title, summary")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (isCurrent) setGuides(error ? [] : data || []);
    }

    loadGuides();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function openResult(result) {
    setIsOpen(false);
    setQuery("");
    router.push(result.route);
  }

  function submitSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    if (results.length) {
      openResult(results[Math.min(activeIndex, results.length - 1)]);
      return;
    }
    setIsOpen(false);
    router.push(`/library?search=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") setIsOpen(false);
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    }
    if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    }
  }

  return (
    <div className="platform-search-wrap" ref={rootRef}>
      <form className={className} role="search" onSubmit={submitSearch}>
        <SearchIcon />
        <input
          aria-label="Search platform"
          aria-expanded={isOpen && Boolean(term)}
          aria-controls="platform-search-results"
          aria-autocomplete="list"
          placeholder="Search platform..."
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </form>
      {isOpen && term && (
        <div className="platform-search-results" id="platform-search-results" role="listbox" aria-label="Search results">
          {results.map((result, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? "platform-search-result active" : "platform-search-result"}
              key={`${result.kind}-${result.route}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => openResult(result)}
            >
              <span className="platform-search-result-title">{result.title}</span>
              <span className="platform-search-result-type">{result.kind === "guide" ? result.description : "Open section"}</span>
            </button>
          ))}
          {!results.length && <p className="platform-search-empty">No section matches yet. Press Enter to search scam guides.</p>}
          {results.length > 0 && <p className="platform-search-hint">Enter to open · ↑↓ to navigate · Esc to close</p>}
        </div>
      )}
      <style jsx>{`
        .platform-search-wrap { position: relative; z-index: 30; width: min(245px, 100%); min-width: 0; flex: 0 1 245px; }
        .platform-search { width: 100%; }
        .platform-search-results { position: absolute; top: calc(100% + 8px); left: 0; right: 0; max-height: min(360px, 60vh); overflow: auto; padding: 6px; border: 1px solid #e4ddd4; border-radius: 12px; background: #fff; box-shadow: 0 14px 36px rgba(16, 34, 58, .16); }
        .platform-search-result { display: flex; width: 100%; flex-direction: column; align-items: flex-start; gap: 3px; padding: 11px 12px; border: 0; border-radius: 8px; background: transparent; color: #18223b; text-align: left; cursor: pointer; }
        .platform-search-result.active, .platform-search-result:hover { background: #fff3e8; }
        .platform-search-result-title { font-size: 13px; font-weight: 750; }
        .platform-search-result-type, .platform-search-empty, .platform-search-hint { color: #66758d; font-size: 11px; }
        .platform-search-empty { margin: 0; padding: 12px; }
        .platform-search-hint { margin: 4px 8px 5px; }
        @media (max-width: 1180px) { .platform-search-wrap { width: 100%; flex-basis: 100%; } }
      `}</style>
    </div>
  );
}
