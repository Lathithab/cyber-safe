"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

// Opened from the link in the "reset your password" email. The link signs the
// person in with a short-lived recovery session, which lets them choose a new
// password here.
export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [waited, setWaited] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    // The link is exchanged for a session in the background; give it a moment
    // before telling the person the link did not work.
    const timer = setTimeout(() => setWaited(true), 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || "We could not change your password.");
      return;
    }

    await supabase.auth.signOut();
    setDone(true);
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Choose a new password</h1>

        {done ? (
          <>
            <p style={styles.text}>
              Your password has been changed. Sign in with your new password.
            </p>
            <Link href="/login" style={styles.button}>
              Go to sign in
            </Link>
          </>
        ) : ready ? (
          <form onSubmit={handleSubmit}>
            <label style={styles.label} htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
              required
            />
            <label style={styles.label} htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              style={styles.input}
              required
            />
            {error && (
              <p style={styles.error} role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving…" : "Change password"}
            </button>
          </form>
        ) : waited || !isSupabaseConfigured ? (
          <>
            <p style={styles.text}>
              This reset link is not valid any more. Links expire after a
              short time and only work once.
            </p>
            <Link href="/login" style={styles.button}>
              Back to sign in
            </Link>
          </>
        ) : (
          <p style={styles.text} role="status">
            Checking your link…
          </p>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "#f7f4ef",
    color: "#00243A",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 28,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid #e4ddd4",
  },
  title: { margin: "0 0 16px", fontSize: 22 },
  text: { margin: "0 0 20px", lineHeight: 1.5, color: "#526179" },
  label: { display: "block", margin: "14px 0 6px", fontSize: 13, fontWeight: 700 },
  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d9dee8",
    borderRadius: 8,
    font: "inherit",
  },
  error: { margin: "12px 0 0", color: "#b13e49", fontSize: 14 },
  button: {
    display: "inline-block",
    marginTop: 20,
    padding: "12px 20px",
    border: 0,
    borderRadius: 10,
    background: "#EB630F",
    color: "#fff",
    font: "inherit",
    fontWeight: 800,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
};
