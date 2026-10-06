"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import PlatformAdminLink from "./PlatformAdminLink";

function LogoutIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18a1 1 0 0 1-1 1h-8" />
    </svg>
  );
}

export default function LogoutButton({ className = "sidebar-logout", label = "Logout" }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Could not sign out:", error);
        setIsSigningOut(false);
        return;
      }
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {className === "sidebar-logout" && <PlatformAdminLink />}
      <button
        className={className}
        type="button"
        onClick={handleLogout}
        disabled={isSigningOut}
        style={className === "sidebar-logout" ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 10,
          width: "100%",
          minHeight: 46,
          marginTop: 12,
          padding: "10px 14px",
          border: "1px solid #ff9a9e",
          borderRadius: 12,
          background: "#fff4f4",
          color: "#c2413d",
          cursor: isSigningOut ? "wait" : "pointer",
          font: "inherit",
          fontWeight: 700,
          textAlign: "left",
        } : undefined}
      >
        <LogoutIcon />
        <span>{isSigningOut ? "Logging out..." : label}</span>
      </button>
    </>
  );
}
