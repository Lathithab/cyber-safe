"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();

  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
  async function loadModule() {
    if (!isSupabaseConfigured) {
      setLoadError("Supabase is not configured.");
      setIsLoading(false);
      return;
    }

    console.log("MODULE ID:", params.module_id);

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", params.module_id)
      .single();

    if (error) {
      console.error("Error loading module:", JSON.stringify(error, null, 2));
      setLoadError("We could not load this module.");
      setIsLoading(false);
      return;
    }

    console.log("MODULE LOADED:", data);

    setModule(data);
    setIsLoading(false);
  }

  loadModule();
}, [params.module_id]);

  if (isLoading) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <p>Loading module...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Something went wrong</h1>
        <p>{loadError}</p>

        <button onClick={() => router.push("/learn")}>
          Back to Learn
        </button>
      </main>
    );
  }

  if (!module) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Module not found</h1>

        <button onClick={() => router.push("/learn")}>
          Back to Learn
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px",
        background: "#f6f9fd",
        color: "#121a32",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/learn")}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#20b6d8",
          fontWeight: "700",
          marginBottom: "30px",
        }}
      >
        ← Back to Learn
      </button>

      <article
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          padding: "45px",
          borderRadius: "24px",
          border: "1px solid #dce5ef",
        }}
      >
        <p
          style={{
            color: "#20b6d8",
            fontWeight: "800",
            textTransform: "uppercase",
            fontSize: "13px",
          }}
        >
          {module.difficulty} · {module.estimated_minutes} minutes
        </p>

        <h1
          style={{
            fontSize: "42px",
            marginBottom: "15px",
          }}
        >
          {module.title}
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#65738a",
            lineHeight: "1.6",
            marginBottom: "35px",
          }}
        >
          {module.description}
        </p>

        <div
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}
        >
          {module.content}
        </div>

        <button
  type="button"
  onClick={() => router.push(`/learn/${params.module_id}/quiz`)}
  style={{
    marginTop: "40px",
    padding: "15px 24px",
    border: "none",
    borderRadius: "13px",
    background: "#31c7e6",
    color: "#102039",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "16px",
  }}
>
  Take Quiz →
</button>
      </article>
    </main>
  );
}