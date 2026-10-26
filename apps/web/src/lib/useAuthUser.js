"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

// Pages a guest (anonymous sign-in) may use.
export const GUEST_ROUTES = [
  "/learn",
  "/library",
  "/help",
  "/cyberbot",
  "/profiles",
];

// Last known auth state, shared across pages so navigating doesn't wait on
// another auth check before the nav can render.
let lastKnownState = null;

export function useAuthUser() {
  const [state, setState] = useState(
    () => lastKnownState ?? { user: null, isGuest: false, loading: true },
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      lastKnownState = { user: null, isGuest: false, loading: false };
      setState(lastKnownState);
      return;
    }
    const update = (user) => {
      lastKnownState = { user, isGuest: Boolean(user?.is_anonymous), loading: false };
      setState(lastKnownState);
    };
    supabase.auth.getUser().then(({ data }) => update(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      update(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}

// Same as useAuthUser, but sends visitors who are not signed in to the login
// page. Guests (anonymous sign-ins) count as signed in. If Supabase is not
// configured (demo mode) nobody is redirected.
export function useRequireUser() {
  const router = useRouter();
  const state = useAuthUser();

  useEffect(() => {
    if (isSupabaseConfigured && !state.loading && !state.user) {
      router.replace("/login");
    }
  }, [state.loading, state.user, router]);

  return state;
}

export function filterNavForUser(nav, isGuest) {
  return isGuest
    ? nav.filter(([, route]) => GUEST_ROUTES.includes(route))
    : nav;
}

// Whether to show the guest navigation. Also true until the first auth check
// finishes, so the nav is never empty and guests never see the full menu.
export function useGuestNav() {
  const { isGuest, loading } = useAuthUser();
  return loading || isGuest;
}
