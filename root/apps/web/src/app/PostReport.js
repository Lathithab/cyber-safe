"use client";

import { useState } from "react";

export default function PostReportPage() {
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

    console.log("SUBMITTED REPORT:", form);
    alert("Report submitted!");
  }

  return (
    <div style={styles.wrapper}>

      {/* Banner */}
      <div style={styles.banner}>
        Post a Report
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="location"
          value={form.location}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Select location</option>
          <option>Cape Town</option>
          <option>Johannesburg</option>
          <option>Durban</option>
          <option>Pretoria</option>
        </select>

        <textarea
          name="description"
          placeholder="Describe the scam"
          value={form.description}
          onChange={handleChange}
          style={{ ...styles.input, height: "100px" }}
        />

        <p><b>Did the scammer take any of the following?</b></p>

        {["Money", "Bank Details", "Passwords", "Identity Info"].map((item) => (
          <label key={item} style={styles.checkbox}>
            <input
              type="checkbox"
              value={item}
              onChange={handleCheckbox}
            />
            {item}
          </label>
        ))}

        <input type="file" onChange={handleFile} />

        <button type="submit" style={styles.button}>
          Submit
        </button>

      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "500px",
    margin: "40px auto",
    background: "white",
    borderRadius: "15px",
    overflow: "hidden",
    fontFamily: "Arial",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  banner: {
    background: "#30C9E8",
    padding: "20px",
    color: "white",
    fontSize: "24px",
    textAlign: "center",
    fontWeight: "bold",
  },

  form: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  checkbox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  button: {
    background: "#30C9E8",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};