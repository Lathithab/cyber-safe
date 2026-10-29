"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";

const INITIAL_STATS = {
  users: null,
  posts: null,
  modules: null,
  completions: null,
};

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "22px",
};

function MetricCard({ title, value, description }) {
  return (
    <article style={CARD_STYLE}>
      <p style={{ color: "#64748b", margin: "0 0 10px" }}>{title}</p>
      <h2 style={{ fontSize: "32px", margin: "0 0 8px" }}>{value ?? "—"}</h2>
      <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
        {description}
      </p>
    </article>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [access, setAccess] = useState("checking");
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!isSupabaseConfigured || !supabase) {
        setAccess("unavailable");
        setIsLoading(false);
        return;
      }

      // Confirm that a user is signed in.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      // Only administrators should access this dashboard.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError || profile?.role !== "admin") {
        setAccess("denied");
        setIsLoading(false);
        return;
      }

      setAccess("allowed");

      // Request counts instead of downloading every database record.
      const results = await Promise.all([
        supabase.rpc("admin_registered_account_count"),

        supabase.from("posts").select("id", { count: "exact", head: true }),

        supabase
          .from("modules")
          .select("id", { count: "exact", head: true })
          .eq("published", true),

        supabase
          .from("user_progress")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
      ]);

      if (!active) return;

      const [usersResult, postsResult, modulesResult, completionsResult] =
        results;

      setStats({
        users: usersResult.error ? null : (usersResult.data ?? 0),
        posts: postsResult.error ? null : (postsResult.count ?? 0),
        modules: modulesResult.error ? null : (modulesResult.count ?? 0),
        completions: completionsResult.error
          ? null
          : (completionsResult.count ?? 0),
      });

      if (results.some((result) => result.error)) {
        console.error("Dashboard metrics error:", results);
        setErrorMessage(
          "Some metrics could not be loaded. Check the database permissions.",
        );
      }

      setIsLoading(false);
    }

    loadDashboard().catch((error) => {
      console.error("Could not load dashboard:", error);

      if (active) {
        setErrorMessage("The dashboard could not be loaded.");
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (access !== "allowed") {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <h1>
          {access === "checking"
            ? "Checking admin access..."
            : access === "denied"
              ? "Admin access required"
              : "Dashboard unavailable"}
        </h1>

        <p>
          {access === "denied"
            ? "You need an administrator account to view these insights."
            : access === "unavailable"
              ? "Check your Supabase configuration."
              : "Verifying your account permissions."}
        </p>

        {access === "denied" && (
          <button onClick={() => router.push("/feed")}>Return to feed</button>
        )}

        {access === "unavailable" && (
          <button onClick={() => router.push("/login")}>Go to login</button>
        )}
      </main>
    );
  }

  const cards = [
    {
      title: "Registered accounts",
      value: stats.users,
      description: "Profiles in the system",
    },
    {
      title: "Community posts",
      value: stats.posts,
      description: "Posts stored in the database",
    },
    {
      title: "Published modules",
      value: stats.modules,
      description: "Learning modules available to learners",
    },
    {
      title: "Module completions",
      value: stats.completions,
      description: "Recorded completed module entries",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
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
          <p style={{ color: "#64748b", marginBottom: "8px" }}>
            CYBERSAFE · ADMINISTRATION
          </p>
          <h1 style={{ margin: 0 }}>Platform Insights</h1>
          <p style={{ color: "#64748b" }}>
            A snapshot of learning and community activity.
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/learning")}
          style={{ padding: "12px 16px", cursor: "pointer" }}
        >
          Manage learning content
        </button>
      </header>

      {errorMessage && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {errorMessage}
        </p>
      )}

      {isLoading && <p>Loading platform insights...</p>}

      <section
        aria-label="Platform metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
          />
        ))}
      </section>

      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "24px" }}>
        These are database totals, not a count of users currently online.
      </p>

      <button
        onClick={() => router.push("/feed")}
        style={{ marginTop: "12px", padding: "10px 14px", cursor: "pointer" }}
      >
        Back to community feed
      </button>
    </main>
  );
}
