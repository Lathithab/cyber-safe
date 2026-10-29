"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";

const RANGES = [7, 30, 90];

const EMPTY_TOTALS = {
  users: null,
  submissions: null,
  modules: null,
  completions: null,
};

const EMPTY_TRENDS = {
  signups: [],
  submissions: [],
  completions: [],
  activeUsers: null,
};

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "22px",
  minWidth: 0,
};

const SECTION_TITLE_STYLE = { margin: "34px 0 14px", fontSize: "20px" };

function sumRows(rows) {
  return rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
}

// RPCs return a continuous, chronological daily series. The newest `days`
// entries are the selected period; the preceding `days` entries are its baseline.
function splitSeries(rows, days) {
  return {
    current: rows.slice(-days),
    previous: rows.slice(0, Math.max(rows.length - days, 0)),
  };
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Delta({ pct, days }) {
  if (pct === undefined) return null;

  let label;
  let color = "#64748b";

  if (pct === null) {
    label = "New activity vs previous period";
    color = "#15803d";
  } else if (pct === 0) {
    label = `No change vs previous ${days} days`;
  } else {
    label = `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs previous ${days} days`;
    color = pct > 0 ? "#15803d" : "#b91c1c";
  }

  return <p style={{ color, fontSize: "13px", margin: "8px 0 0" }}>{label}</p>;
}

function MetricCard({ title, value, description, pct, days }) {
  return (
    <article style={CARD_STYLE}>
      <p style={{ color: "#64748b", margin: "0 0 10px" }}>{title}</p>
      <h2 style={{ fontSize: "32px", lineHeight: 1.15, margin: "0 0 8px" }}>
        {value === null || value === undefined ? "—" : Number(value).toLocaleString()}
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>{description}</p>
      <Delta pct={pct} days={days} />
    </article>
  );
}

function BarChart({ title, rows, color, isLoading }) {
  const width = 600;
  const height = 150;
  const values = rows.map((row) => Number(row.total ?? 0));
  const peak = Math.max(0, ...values);
  const max = Math.max(1, peak);
  const slot = rows.length ? width / rows.length : width;
  const barWidth = Math.max(slot - 2, 1);
  const total = sumRows(rows);

  return (
    <article style={CARD_STYLE}>
      <p style={{ margin: "0 0 12px", fontWeight: 600 }}>{title}</p>
      {isLoading ? (
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading chart…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          No chart data returned. Check the browser console and Supabase SQL functions.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${title}: ${total} total during this period`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="#e2e8f0" />
            {rows.map((row, index) => {
              const value = Number(row.total ?? 0);
              const barHeight = value > 0 ? Math.max((value / max) * (height - 10), 2) : 0;
              return (
                <rect
                  key={row.bucket_date}
                  x={index * slot}
                  y={height - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx="2"
                  fill={color}
                >
                  <title>{`${formatShortDate(row.bucket_date)}: ${value}`}</title>
                </rect>
              );
            })}
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              color: "#64748b",
              fontSize: "12px",
              marginTop: "6px",
            }}
          >
            <span>{formatShortDate(rows[0].bucket_date)}</span>
            <span>Total: {total.toLocaleString()} · Peak day: {peak}</span>
            <span>{formatShortDate(rows[rows.length - 1].bucket_date)}</span>
          </div>
        </>
      )}
    </article>
  );
}

function ModuleTable({ modules, isLoading }) {
  const cellStyle = { padding: "11px 12px", textAlign: "left", whiteSpace: "nowrap" };

  if (isLoading) {
    return <article style={CARD_STYLE}><p style={{ margin: 0, color: "#64748b" }}>Loading module analytics…</p></article>;
  }

  if (!modules.length) {
    return (
      <article style={CARD_STYLE}>
        <p style={{ color: "#64748b", margin: 0 }}>
          No module statistics returned. Confirm that the admin SQL ran successfully.
        </p>
      </article>
    );
  }

  return (
    <article style={{ ...CARD_STYLE, padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#475569" }}>
            <th style={cellStyle}>Module</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Learners completed</th>
            <th style={cellStyle}>Average quiz score</th>
            <th style={cellStyle}>Last completion</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => {
            const score = module.average_score === null || module.average_score === undefined
              ? null
              : Number(module.average_score);
            return (
              <tr key={module.module_id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ ...cellStyle, whiteSpace: "normal", minWidth: "180px" }}>{module.title}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 999,
                      fontSize: "12px",
                      background: module.published ? "#dcfce7" : "#f1f5f9",
                      color: module.published ? "#166534" : "#475569",
                    }}
                  >
                    {module.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td style={cellStyle}>{Number(module.completions ?? 0).toLocaleString()}</td>
                <td style={cellStyle}>{score === null ? "—" : `${score.toFixed(1)}%`}</td>
                <td style={cellStyle}>{formatDateTime(module.last_completed_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const [days, setDays] = useState(30);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [trends, setTrends] = useState(EMPTY_TRENDS);
  const [moduleStats, setModuleStats] = useState([]);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Verify the current session and admin role before requesting admin-only data.
  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!isSupabaseConfigured || !supabase) {
        setAccess("unavailable");
        setIsLoadingTotals(false);
        setIsLoadingModules(false);
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;
      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError || profile?.role !== "admin") {
        if (profileError) console.error("Admin profile check failed:", profileError);
        setAccess("denied");
        setIsLoadingTotals(false);
        setIsLoadingModules(false);
        return;
      }

      setAccess("allowed");

      const [totalsResult, moduleResult] = await Promise.all([
        supabase.rpc("cybersafe_admin_totals"),
        supabase.rpc("cybersafe_admin_module_stats"),
      ]);

      if (!active) return;

      const totalsRow = Array.isArray(totalsResult.data)
        ? totalsResult.data[0]
        : totalsResult.data;

      if (totalsResult.error) {
        console.error("Dashboard totals RPC failed:", totalsResult.error);
        setErrorMessage("Some dashboard totals could not be loaded. Check the browser console and Supabase SQL functions.");
      }

      setTotals({
        users: totalsResult.error ? null : Number(totalsRow?.registered_accounts ?? 0),
        submissions: totalsResult.error ? null : Number(totalsRow?.submissions ?? 0),
        modules: totalsResult.error ? null : Number(totalsRow?.published_modules ?? 0),
        completions: totalsResult.error ? null : Number(totalsRow?.completions ?? 0),
      });

      if (moduleResult.error) {
        console.error("Module analytics RPC failed:", moduleResult.error);
        setErrorMessage((current) => current || "Module analytics could not be loaded. Check the browser console and Supabase SQL functions.");
        setModuleStats([]);
      } else {
        setModuleStats(moduleResult.data ?? []);
      }

      setIsLoadingTotals(false);
      setIsLoadingModules(false);
    }

    loadDashboard().catch((error) => {
      console.error("Could not load admin dashboard:", error);
      if (active) {
        setErrorMessage("The dashboard could not be loaded. Check the browser console for details.");
        setIsLoadingTotals(false);
        setIsLoadingModules(false);
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  // Reload the selected period and the prior period whenever the range changes.
  useEffect(() => {
    if (access !== "allowed" || !supabase) return;

    let active = true;
    setIsLoadingTrends(true);

    async function loadTrends() {
      const [signupsResult, submissionsResult, completionsResult, activeUsersResult] = await Promise.all([
        supabase.rpc("cybersafe_admin_signups_by_day", { p_days: days * 2 }),
        supabase.rpc("cybersafe_admin_submissions_by_day", { p_days: days * 2 }),
        supabase.rpc("cybersafe_admin_completions_by_day", { p_days: days * 2 }),
        supabase.rpc("cybersafe_admin_active_users", { p_days: days }),
      ]);

      if (!active) return;

      const results = [signupsResult, submissionsResult, completionsResult, activeUsersResult];
      const labels = ["Signups", "Submissions", "Completions", "Active users"];
      const failed = results.filter((result) => result.error);

      if (failed.length) {
        results.forEach((result, index) => {
          if (result.error) console.error(`${labels[index]} trend RPC failed:`, result.error);
        });
        setErrorMessage((current) => current || "Some activity metrics could not be loaded. Check the browser console and Supabase SQL functions.");
      }

      setTrends({
        signups: signupsResult.error ? [] : (signupsResult.data ?? []),
        submissions: submissionsResult.error ? [] : (submissionsResult.data ?? []),
        completions: completionsResult.error ? [] : (completionsResult.data ?? []),
        activeUsers: activeUsersResult.error ? null : Number(activeUsersResult.data ?? 0),
      });
      setIsLoadingTrends(false);
    }

    loadTrends().catch((error) => {
      console.error("Could not load dashboard trends:", error);
      if (active) {
        setErrorMessage((current) => current || "Activity metrics could not be loaded. Check the browser console for details.");
        setTrends(EMPTY_TRENDS);
        setIsLoadingTrends(false);
      }
    });

    return () => {
      active = false;
    };
  }, [access, days]);

  if (access !== "allowed") {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
        <h1>
          {access === "checking" ? "Checking admin access…" : access === "denied" ? "Admin access required" : "Dashboard unavailable"}
        </h1>
        <p>
          {access === "denied"
            ? "You need an administrator account to view these insights."
            : access === "unavailable"
              ? "Check your Supabase configuration."
              : "Verifying your account permissions."}
        </p>
        {access === "denied" && <button onClick={() => router.push("/feed")}>Return to feed</button>}
        {access === "unavailable" && <button onClick={() => router.push("/login")}>Go to login</button>}
      </main>
    );
  }

  const signupSeries = splitSeries(trends.signups, days);
  const submissionSeries = splitSeries(trends.submissions, days);
  const completionSeries = splitSeries(trends.completions, days);

  const signupSeriesReady = !isLoadingTrends && trends.signups.length === days * 2;
  const submissionSeriesReady = !isLoadingTrends && trends.submissions.length === days * 2;
  const completionSeriesReady = !isLoadingTrends && trends.completions.length === days * 2;

  const totalCards = [
    { title: "Registered accounts", value: totals.users, description: "Accounts in Supabase Auth" },
    { title: "Community submissions", value: totals.submissions, description: "Posts and reports stored in the database" },
    { title: "Published modules", value: totals.modules, description: "Learning modules available to learners" },
    { title: "Module completions", value: totals.completions, description: "Completed records in user_progress" },
  ];

  const periodCards = [
    {
      title: `Active users (${days} days)`,
      value: isLoadingTrends ? null : trends.activeUsers,
      description: "People who posted or completed a module",
    },
    {
      title: "New signups",
      value: signupSeriesReady ? sumRows(signupSeries.current) : null,
      description: `In the last ${days} days`,
      pct: signupSeriesReady ? percentChange(sumRows(signupSeries.current), sumRows(signupSeries.previous)) : undefined,
    },
    {
      title: "New submissions",
      value: submissionSeriesReady ? sumRows(submissionSeries.current) : null,
      description: `Posts and reports in the last ${days} days`,
      pct: submissionSeriesReady ? percentChange(sumRows(submissionSeries.current), sumRows(submissionSeries.previous)) : undefined,
    },
    {
      title: "Completions",
      value: completionSeriesReady ? sumRows(completionSeries.current) : null,
      description: `In the last ${days} days`,
      pct: completionSeriesReady ? percentChange(sumRows(completionSeries.current), sumRows(completionSeries.previous)) : undefined,
    },
  ];

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
    gap: "18px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(18px, 4vw, 32px)",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p style={{ color: "#64748b", marginBottom: "8px" }}>CYBERSAFE · ADMINISTRATION</p>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 34px)" }}>Platform Insights</h1>
          <p style={{ color: "#64748b", marginBottom: 0 }}>A snapshot of account growth, community activity and learning outcomes.</p>
        </div>
        <button
          onClick={() => router.push("/admin/learning")}
          style={{ padding: "12px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 8, background: "#ffffff", color: "#0f172a" }}
        >
          Manage learning content
        </button>
      </header>

      {errorMessage && (
        <p role="alert" style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12 }}>
          {errorMessage}
        </p>
      )}

      {isLoadingTotals && <p>Loading platform totals…</p>}
      <section aria-label="Platform totals" style={gridStyle}>
        {totalCards.map((card) => <MetricCard key={card.title} {...card} />)}
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={SECTION_TITLE_STYLE}>Activity over time</h2>
        <div role="group" aria-label="Date range" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setDays(range)}
              aria-pressed={days === range}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: days === range ? "#0f172a" : "#ffffff",
                color: days === range ? "#ffffff" : "#0f172a",
              }}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>

      {isLoadingTrends && <p>Loading activity for the selected period…</p>}
      <section aria-label="Activity metrics" style={gridStyle}>
        {periodCards.map((card) => <MetricCard key={card.title} days={days} {...card} />)}
      </section>

      <section
        aria-label="Activity charts"
        style={{ ...gridStyle, gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", marginTop: 18 }}
      >
        <BarChart title="New accounts per day" rows={signupSeries.current} color="#2563eb" isLoading={isLoadingTrends} />
        <BarChart title="Community submissions per day" rows={submissionSeries.current} color="#7c3aed" isLoading={isLoadingTrends} />
        <BarChart title="Module completions per day" rows={completionSeries.current} color="#059669" isLoading={isLoadingTrends} />
      </section>

      <h2 style={SECTION_TITLE_STYLE}>Learning performance</h2>
      <p style={{ color: "#64748b", marginTop: -4, marginBottom: 14 }}>
        Completion and quiz-score data comes from saved records in <code>user_progress</code>. Modules without completions remain visible.
      </p>
      <ModuleTable modules={moduleStats} isLoading={isLoadingModules} />

      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "24px" }}>
        Active users means distinct people who posted or completed a module during the selected period; it is not a live-online count.
        Community submissions include rows in <code>posts</code>, including reports that may still be awaiting moderation.
      </p>

      <button
        onClick={() => router.push("/feed")}
        style={{ marginTop: 12, padding: "10px 14px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 8, background: "#ffffff", color: "#0f172a" }}
      >
        Back to community feed
      </button>
    </main>
  );
}