"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    location: "",
    description: "",
    issues: [],
    file: null,
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCheckbox(e) {
    const value = e.target.value;
    setForm((prev) => {
      const exists = prev.issues.includes(value);
      return {
        ...prev,
        issues: exists
          ? prev.issues.filter((i) => i !== value)
          : [...prev.issues, value],
      };
    });
  }

  function handleFile(e) {
    setForm({ ...form, file: e.target.files[0] });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams({
      username: form.username,
      location: form.location,
      description: form.description,
      issues: form.issues.join(","),
    });
    router.push(`/post?${params}`);
  }

  return (
    <div className="page-column">
      <div className="banner">Post a Report</div>

      <div className="card">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            className="field"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <select
            className="field"
            name="location"
            value={form.location}
            onChange={handleChange}
          >
            <option value="">Select location</option>
            <option>Cape Town</option>
            <option>Johannesburg</option>
            <option>Durban</option>
            <option>Pretoria</option>
          </select>

          <textarea
            className="field"
            name="description"
            placeholder="Describe the scam"
            value={form.description}
            onChange={handleChange}
            style={{ height: "100px" }}
          />

          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
            Did the scammer take any of the following?
          </p>

          {["Money", "Bank Details", "Passwords", "Identity Info"].map(
            (item) => (
              <label
                key={item}
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <input type="checkbox" value={item} onChange={handleCheckbox} />
                {item}
              </label>
            ),
          )}

          <input className="field" type="file" onChange={handleFile} />

          <button className="btn-primary" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
