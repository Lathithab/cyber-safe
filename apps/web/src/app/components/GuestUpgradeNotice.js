import Link from "next/link";

export default function GuestUpgradeNotice({ action }) {
  return (
    <section
      role="status"
      style={{
        maxWidth: 520,
        margin: "48px auto",
        padding: 24,
        borderRadius: 16,
        border: "1px solid #d9dee8",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>Create a free account to {action}</h2>
      <p style={{ marginBottom: 20 }}>
        As a guest you can learn, take quizzes and browse the Scam Library. To{" "}
        {action}, sign up with Google or an email address.
      </p>
      <Link
        href="/login"
        className="submit-button"
        style={{ display: "inline-block", padding: "12px 20px" }}
      >
        Create my account
      </Link>
    </section>
  );
}
