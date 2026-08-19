"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LOSSES = ["Money", "Bank Details", "Passwords", "Identity Info"];

const MAX_DESC = 500;

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function PostReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    location: "",
    incidentDate: "",
    description: "",
    issues: [],
    file: null,
  });
  const [submitError, setSubmitError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleIssue(value) {
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
    setForm({ ...form, file: e.target.files[0] ?? null });
  }

  function removeFile() {
    setForm({ ...form, file: null });
  }

  const descLeft = MAX_DESC - form.description.length;
  const canSubmit = form.description.trim().length >= 10;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError("");

    let image = null;
    if (form.file) {
      try {
        image = await readImageAsDataUrl(form.file);
      } catch {
        setSubmitError("We could not read that image. Please choose another PNG or JPG file.");
        return;
      }
    }

    const report = {
      id: `report-${Date.now()}`,
      name: form.username.trim() || "Anonymous",
      location: form.location.trim(),
      incidentDate: form.incidentDate,
      text: form.description.trim(),
      issues: form.issues,
      time: "Just now",
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      image,
    };

    try {
      const previous = JSON.parse(localStorage.getItem("cybersafeReports") || "[]");
      localStorage.setItem("cybersafeReports", JSON.stringify([report, ...previous]));
    } catch {
      setSubmitError("This image is too large to save on this device. Try a smaller image or post without an attachment.");
      return;
    }

    router.push("/feed");
  }

  return (
    <div className="report-page">
      {/* Top bar */}
      <div className="report-topbar">
        <button
          className="back-btn"
          onClick={() => router.back()}
          aria-label="Go back"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="report-title">Post a Report</span>
      </div>

      <form className="report-body" onSubmit={handleSubmit}>
        <p className="intro">
          Share what happened so others can spot the same scam. Only add details you're comfortable making public.
        </p>

        {/* Safety nudge → Help */}
        <button
          type="button"
          className="help-nudge"
          onClick={() => router.push("/help")}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4" /><path d="M12 17h.01" />
          </svg>
          <span>Being scammed <strong>right now</strong>? Get help first →</span>
        </button>

        {/* Name */}
        <div className="field-group">
          <label className="label" htmlFor="username">
            Display name <span className="optional">optional</span>
          </label>
          <input
            id="username"
            className="input"
            name="username"
            placeholder="Leave blank to post as Anonymous"
            value={form.username}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        {/* Location */}
        <div className="field-group">
          <label className="label" htmlFor="location">
            Where did it happen? <span className="optional">optional</span>
          </label>
          <input
            id="location"
            className="input"
            name="location"
            placeholder="e.g. Bellville, Cape Town or online"
            value={form.location}
            onChange={handleChange}
            autoComplete="address-level2"
          />
        </div>

        <div className="field-group">
          <label className="label" htmlFor="incidentDate">
            When did it happen? <span className="optional">optional</span>
          </label>
          <input
            id="incidentDate"
            className="input"
            name="incidentDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.incidentDate}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div className="field-group">
          <div className="label-row">
            <label className="label" htmlFor="description">
              What happened?
            </label>
            <span className={`counter ${descLeft < 0 ? "over" : ""}`}>
              {descLeft}
            </span>
          </div>
          <textarea
            id="description"
            className="input textarea"
            name="description"
            placeholder="Describe the scam — how they contacted you, what they asked for, what tipped you off…"
            value={form.description}
            onChange={handleChange}
            maxLength={MAX_DESC}
            rows={5}
          />
          {!canSubmit && form.description.length > 0 && (
            <span className="hint">A little more detail helps others (min. 10 characters).</span>
          )}
        </div>

        {/* Losses */}
        <div className="field-group">
          <span className="label">Did the scammer take any of these?</span>
          <div className="chips">
            {LOSSES.map((item) => {
              const active = form.issues.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  className={`chip ${active ? "chip-on" : ""}`}
                  onClick={() => toggleIssue(item)}
                  aria-pressed={active}
                >
                  {active && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence */}
        <div className="field-group">
          <span className="label">
            Add a screenshot <span className="optional">optional</span>
          </span>
          {!form.file ? (
            <label className="dropzone">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
              <span className="dz-main">Tap to upload an image</span>
              <span className="dz-sub">PNG or JPG</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleFile} hidden />
            </label>
          ) : (
            <div className="file-pill">
              <span className="file-name">{form.file.name}</span>
              <button type="button" className="file-remove" onClick={removeFile} aria-label="Remove file">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <button className="submit" type="submit" disabled={!canSubmit}>
          Post report
        </button>
        {submitError && <p className="submit-error" role="alert">{submitError}</p>}
        <p className="privacy-note">
          Your report will appear in the community feed on this device. Don't
          include full card numbers, passwords or ID numbers.
        </p>
      </form>

      <style>{`
        .report-page {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f5f7fa;
          font-family: "DM Sans", Arial, sans-serif;
          color: #0e1b24;
          padding-bottom: 40px;
        }

        /* Top bar */
        .report-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #30C9E8;
          color: #fff;
        }
        .back-btn {
          background: rgba(255,255,255,0.18);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
          transition: background 0.15s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.3); }
        .report-title {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 20px;
        }

        .report-body {
          padding: 18px 15px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .intro {
          font-size: 14px;
          line-height: 1.55;
          color: #5b6b75;
          margin-top: -2px;
        }

        /* Help nudge */
        .help-nudge {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          background: #fdecec;
          border: 1px solid #f3c0c0;
          border-radius: 12px;
          padding: 11px 13px;
          color: #b42318;
          font-family: "DM Sans", sans-serif;
          font-size: 13.5px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }
        .help-nudge:hover { background: #fbe0e0; }
        .help-nudge svg { flex: none; }

        .field-group { display: flex; flex-direction: column; gap: 8px; }

        .label-row { display: flex; align-items: baseline; justify-content: space-between; }
        .label {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 14.5px;
          color: #0e1b24;
        }
        .optional {
          font-family: "DM Sans", sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #9aa7b0;
          margin-left: 4px;
        }
        .counter {
          font-size: 12px;
          color: #9aa7b0;
          font-variant-numeric: tabular-nums;
        }
        .counter.over { color: #d92d20; }

        /* Inputs */
        .input {
          width: 100%;
          background: #fff;
          border: 1px solid #dbe3e9;
          border-radius: 12px;
          padding: 13px 14px;
          font-family: "DM Sans", sans-serif;
          font-size: 15px;
          color: #0e1b24;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input::placeholder { color: #a4b0b8; }
        .input:focus {
          border-color: #30C9E8;
          box-shadow: 0 0 0 3px rgba(48,201,232,0.15);
        }
        .textarea { resize: vertical; line-height: 1.55; min-height: 110px; }

        .select-wrap { position: relative; }
        .select {
          appearance: none;
          -webkit-appearance: none;
          padding-right: 40px;
          cursor: pointer;
        }
        .select-chevron {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7c86;
          pointer-events: none;
        }

        .hint { font-size: 12.5px; color: #b06a00; }

        /* Chips */
        .chips { display: flex; flex-wrap: wrap; gap: 9px; }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #dbe3e9;
          border-radius: 999px;
          padding: 9px 15px;
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #3d4c55;
          cursor: pointer;
          transition: all 0.15s;
        }
        .chip:hover { border-color: #30C9E8; }
        .chip-on {
          background: #30C9E8;
          border-color: #30C9E8;
          color: #fff;
          font-weight: 600;
        }

        /* Dropzone */
        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: #fff;
          border: 1.5px dashed #c2d0d9;
          border-radius: 14px;
          padding: 22px;
          cursor: pointer;
          color: #6b7c86;
          transition: border-color 0.15s, background 0.15s;
        }
        .dropzone:hover { border-color: #30C9E8; background: #f0fbfd; }
        .dz-main {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #0e1b24;
          margin-top: 4px;
        }
        .dz-sub { font-size: 12px; color: #9aa7b0; }

        .file-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #fff;
          border: 1px solid #dbe3e9;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .file-name {
          font-size: 14px;
          color: #0e1b24;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-remove {
          background: #f0f3f5;
          border: none;
          color: #6b7c86;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
          transition: background 0.15s, color 0.15s;
        }
        .file-remove:hover { background: #fdecec; color: #d92d20; }

        /* Submit */
        .submit {
          width: 100%;
          background: #30C9E8;
          color: #fff;
          border: none;
          padding: 15px;
          border-radius: 999px;
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s, opacity 0.15s;
        }
        .submit:hover:not(:disabled) { background: #1fb4d4; }
        .submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .submit-error { margin: -10px 0 0; color: #b42318; font-size: 13px; line-height: 1.4; text-align: center; }

        .privacy-note {
          font-size: 12px;
          color: #8a99a3;
          text-align: center;
          line-height: 1.5;
          margin-top: -6px;
        }
      `}</style>
    </div>
  );
}
