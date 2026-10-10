"use client";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

// Pages a guest (anonymous sign-in) may use.
export const GUEST_ROUTES = [
  "/learn",
  "/library",
  "/help",
  "/cyberbot",
  "/profiles",
];

export function useAuthUser() {
  const [state, setState] = useState({
    user: null,
    isGuest: false,
    loading: true,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ user: null, isGuest: false, loading: false });
      return;
    }
    const update = (user) =>
      setState({ user, isGuest: Boolean(user?.is_anonymous), loading: false });
    supabase.auth.getUser().then(({ data }) => update(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      update(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}

export function filterNavForUser(nav, isGuest) {
  return isGuest
    ? nav.filter(([, route]) => GUEST_ROUTES.includes(route))
    : nav;
}

// Navigation items for the current user: guests only see GUEST_ROUTES.
// Empty until the auth check finishes, so guests never see the full menu.
export function useDashboardNav(nav) {
  const { isGuest, loading } = useAuthUser();
  return loading ? [] : filterNavForUser(nav, isGuest);
}
