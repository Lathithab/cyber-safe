"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "./supabase";

// Redirects to /login when Supabase is configured and there is no active
// session. In demo mode (no Supabase env vars) every dashboard page stays
// open, matching the rest of the app's demo behaviour.
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.push("/login");
        return;
      }
      setUser(data.session.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    });

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
