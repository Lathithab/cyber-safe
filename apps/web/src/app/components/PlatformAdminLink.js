"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import DashboardNavIcon from "./DashboardNavIcon";

// Page navigation remounts this link in each page-specific sidebar. Retain the
// last verified role between those mounts so the link does not blink out while
// the same signed-in user's role is checked again.
let cachedAdminUserId = null;
let cachedIsAdmin = false;

export default function PlatformAdminLink() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(cachedIsAdmin);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      cachedAdminUserId = null;
      cachedIsAdmin = false;
      setIsAdmin(false);
      return undefined;
    }

    let isActive = true;
    let currentUserId = null;
    let authGeneration = 0;

    async function checkAdminRole(user, expectedGeneration = authGeneration) {
      if (!user) {
        currentUserId = null;
        cachedAdminUserId = null;
        cachedIsAdmin = false;
        if (isActive) setIsAdmin(false);
        return;
      }

      currentUserId = user.id;
      if (cachedAdminUserId !== user.id) {
        cachedAdminUserId = user.id;
        cachedIsAdmin = false;
        if (isActive) setIsAdmin(false);
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (isActive && authGeneration === expectedGeneration && currentUserId === user.id) {
        cachedAdminUserId = user.id;
        if (!error) cachedIsAdmin = profile?.role === "admin";
        setIsAdmin(cachedIsAdmin);
      }
    }

    const initialGeneration = authGeneration;
    supabase.auth.getUser()
      .then(({ data: { user }, error }) => {
        if (error) throw error;
        if (authGeneration !== initialGeneration) return undefined;
        return checkAdminRole(user, initialGeneration);
      })
      .catch((error) => {
        console.error("Could not verify Platform Admin navigation access:", error);
        if (isActive) setIsAdmin(Boolean(cachedAdminUserId && cachedIsAdmin));
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authGeneration += 1;
      const eventGeneration = authGeneration;
      if (!session?.user) {
        currentUserId = null;
        cachedAdminUserId = null;
        cachedIsAdmin = false;
        setIsAdmin(false);
        return;
      }

      if (session.user.id !== cachedAdminUserId) {
        currentUserId = session.user.id;
        cachedAdminUserId = session.user.id;
        cachedIsAdmin = false;
        setIsAdmin(false);
      }
      // Defer Supabase queries until after the auth callback returns.
      window.setTimeout(() => checkAdminRole(session.user, eventGeneration), 0);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isAdmin) return null;
  const isCurrentAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="platform-admin-nav" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e4ddd4" }}>
      <button
        className={`side-link ${isCurrentAdminPage ? "active" : ""}`}
        type="button"
        onClick={() => router.push("/admin")}
        style={{ width: "100%" }}
        aria-current={isCurrentAdminPage ? "page" : undefined}
      >
        <DashboardNavIcon name="admin" size={24} />
        <span>Platform Admin</span>
      </button>
    </div>
  );
}
