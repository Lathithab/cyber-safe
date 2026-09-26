"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";

const STORAGE_BUCKET = "scam-examples";
const EMPTY_DRAFT = {
  slug: "",
  category: "",
  title: "",
  summary: "",
  warning_signs_text: "",
  recommended_action: "",
  example_image_path: "",
  published: false,
};

function guideToDraft(guide) {
  return {
    slug: guide.slug,
    category: guide.category || "",
    title: guide.title || "",
    summary: guide.summary || "",
    warning_signs_text: (guide.warning_signs || []).join("\n"),
    recommended_action: guide.recommended_action || "",
    example_image_path: guide.example_image_path || "",
    published: Boolean(guide.published),
  };
}

function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("/") || /^https?:\/\//i.test(path)) return path;
  if (!supabase) return "";
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function isStorageImagePath(path) {
  return Boolean(path) && !path.startsWith("/") && !/^https?:\/\//i.test(path);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminScamGuidesPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const initialSelectionSet = useRef(false);
  const [guides, setGuides] = useState([]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setAccess("unavailable");
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setAccess(!error && profile?.role === "admin" ? "allowed" : "denied");
    }

    verifyAdmin();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (access !== "allowed" || !supabase) return;
    let active = true;

    async function loadGuides() {
      setIsLoadingGuides(true);
      const { data, error } = await supabase
        .from("scam_guides")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (!active) return;
      if (error) {
        console.error("Could not load admin scam guides:", error);
        setErrorMessage("Could not load guides. Run the scam_guides migration in this Supabase project and confirm admin access.");
      } else {
        const rows = data || [];
        setGuides(rows);
        if (!initialSelectionSet.current && rows.length) {
          setSelectedSlug(rows[0].slug);
          setDraft(guideToDraft(rows[0]));
        }
        initialSelectionSet.current = true;
      }
      setIsLoadingGuides(false);
    }

    loadGuides();
    return () => { active = false; };
  }, [access]);

  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile]);

  const previewUrl = selectedFile ? filePreviewUrl : getImageUrl(draft.example_image_path);

  function startNewGuide() {
    setSelectedSlug("");
    setDraft({ ...EMPTY_DRAFT });
    setSelectedFile(null);
    setErrorMessage("");
    setSuccessMessage("");
    setFileError("");
  }

  function selectGuide(guide) {
    setSelectedSlug(guide.slug);
    setDraft(guideToDraft(guide));
    setSelectedFile(null);
    setErrorMessage("");
    setSuccessMessage("");
    setFileError("");
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setFileError("");
    setSuccessMessage("");
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  function clearImage() {
    setSelectedFile(null);
    setDraft((current) => ({ ...current, example_image_path: "" }));
    setSuccessMessage("");
  }

  async function saveGuide(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFileError("");

    const slug = selectedSlug || slugify(draft.title);
    if (!slug || !draft.title.trim() || !draft.category.trim() || !draft.summary.trim() || !draft.recommended_action.trim()) {
      setErrorMessage("Add a title, category, summary, and recommended action before saving.");
      return;
    }

    setIsSaving(true);
    let uploadedPath = "";
    const previousImagePath = guides.find((guide) => guide.slug === selectedSlug)?.example_image_path || "";

    try {
      if (selectedFile) {
        const extensionByType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
        const uniqueName = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        uploadedPath = `${slug}/${uniqueName}.${extensionByType[selectedFile.type]}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(uploadedPath, selectedFile, { contentType: selectedFile.type, cacheControl: "3600", upsert: false });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const payload = {
        slug,
        category: draft.category.trim(),
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        warning_signs: draft.warning_signs_text.split("\n").map((sign) => sign.trim()).filter(Boolean),
        recommended_action: draft.recommended_action.trim(),
        example_image_path: uploadedPath || draft.example_image_path || null,
        published: draft.published,
        updated_at: new Date().toISOString(),
      };

      const query = selectedSlug
        ? supabase.from("scam_guides").update(payload).eq("slug", selectedSlug)
        : supabase.from("scam_guides").insert({ ...payload, sort_order: guides.length ? Math.max(...guides.map((guide) => guide.sort_order || 0)) + 1 : 1 });
      const { data, error } = await query.select().single();
      if (error) throw new Error(error.message);

      const imageWasRemoved = Boolean(previousImagePath) && !uploadedPath && !draft.example_image_path;
      const imageWasReplaced = Boolean(previousImagePath) && Boolean(uploadedPath);
      if ((imageWasRemoved || imageWasReplaced) && isStorageImagePath(previousImagePath)) {
        const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove([previousImagePath]);
        if (removeError) console.warn("The guide saved, but the previous example image could not be removed:", removeError);
      }

      const { data: refreshed, error: refreshError } = await supabase
        .from("scam_guides")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });
      if (!refreshError) setGuides(refreshed || []);
      setSelectedSlug(data.slug);
      setDraft(guideToDraft(data));
      setSelectedFile(null);
      setSuccessMessage(data.published ? "Guide saved and published." : "Guide saved as a draft.");
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]);
      }
      console.error("Could not save scam guide:", error);
      setErrorMessage(error.message || "Could not save this guide. Check your database and storage policies.");
    } finally {
      setIsSaving(false);
    }
  }

  if (access !== "allowed") {
    return (
      <main className="scam-admin-gate">
        <section className="scam-admin-gate-card" aria-live="polite">
          <h1>{access === "checking" ? "Checking admin access" : access === "denied" ? "Admin access required" : "Admin dashboard unavailable"}</h1>
          <p>{access === "checking" ? "Please wait while we verify your account." : access === "denied" ? "This account does not have the Platform Admin role." : "Configure Supabase and sign in with an administrator account."}</p>
          {access === "denied" && <button type="button" onClick={() => router.replace("/feed")}>Return to community feed</button>}
          {access === "unavailable" && <button type="button" onClick={() => router.replace("/login")}>Go to login</button>}
        </section>
        <style>{adminScamStyles}</style>
      </main>
    );
  }

  return (
    <main className="scam-admin-layout">
      <header className="scam-admin-header">
        <div>
          <button type="button" className="back-link" onClick={() => router.push("/admin")}>← Platform Admin</button>
          <p className="scam-admin-eyebrow">Content management</p>
          <h1>Scam Library guides</h1>
          <p>Create, edit, preview, and publish the guides shown to learners.</p>
        </div>
        <button className="new-guide-button" type="button" onClick={startNewGuide}>＋ New guide</button>
      </header>

      <div className="scam-admin-workspace">
        <aside className="guide-list-panel">
          <div className="guide-list-heading"><h2>Guides</h2><span>{guides.length}</span></div>
          {isLoadingGuides && <p className="guide-list-status">Loading guides…</p>}
          {!isLoadingGuides && !guides.length && !errorMessage && <p className="guide-list-status">No guides yet. Create your first guide.</p>}
          <div className="guide-list">
            {guides.map((guide) => (
              <button key={guide.slug} type="button" className={selectedSlug === guide.slug ? "guide-list-item selected" : "guide-list-item"} onClick={() => selectGuide(guide)}>
                <span className="guide-list-category">{guide.category}</span>
                <strong>{guide.title}</strong>
                <span className={guide.published ? "publish-state published" : "publish-state"}>{guide.published ? "Published" : "Draft"}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="guide-editor">
          <div className="editor-heading">
            <div><p className="scam-admin-eyebrow">{selectedSlug ? "Edit guide" : "New guide"}</p><h2>{draft.title || "Untitled guide"}</h2></div>
            {selectedSlug && <span className="slug-label">/{selectedSlug}</span>}
          </div>

          {errorMessage && <p className="editor-message error-message" role="alert">{errorMessage}</p>}
          {successMessage && <p className="editor-message success-message" role="status">{successMessage}</p>}

          <form onSubmit={saveGuide}>
            <div className="editor-fields">
              <label>Guide title<input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} maxLength={120} /></label>
              <label>Category<input required value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} maxLength={60} placeholder="e.g. Banking" /></label>
              <label className="wide-field">Short description<textarea required rows={3} value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} maxLength={500} /></label>
              <label className="wide-field">Warning signs <span className="field-hint">Enter one warning sign per line.</span><textarea rows={5} value={draft.warning_signs_text} onChange={(event) => updateDraft("warning_signs_text", event.target.value)} placeholder={"The message creates urgency.\nThe link does not match the official website."} /></label>
              <label className="wide-field">What to do<textarea required rows={3} value={draft.recommended_action} onChange={(event) => updateDraft("recommended_action", event.target.value)} maxLength={1000} /></label>
              <div className="wide-field image-field">
                <span className="field-label">Example image</span>
                <p className="field-hint">JPG, PNG, or WebP · up to 5 MB. Uploaded examples are publicly viewable with published guides.</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                {fileError && <p className="editor-message error-message" role="alert">{fileError}</p>}
                {(draft.example_image_path || selectedFile) && <button className="remove-image-button" type="button" onClick={clearImage}>Remove example image</button>}
              </div>
              <label className="publish-toggle">
                <input type="checkbox" checked={draft.published} onChange={(event) => updateDraft("published", event.target.checked)} />
                <span><strong>Published</strong><small>Published guides are visible in the public Scam Library.</small></span>
              </label>
            </div>

            <div className="editor-actions">
              <button type="button" className="cancel-button" onClick={() => {
                const selectedGuide = guides.find((guide) => guide.slug === selectedSlug);
                if (selectedGuide) selectGuide(selectedGuide);
                else startNewGuide();
              }}>Discard changes</button>
              <button type="submit" className="save-button" disabled={isSaving || Boolean(fileError)}>{isSaving ? "Saving…" : draft.published ? "Save and publish" : "Save draft"}</button>
            </div>
          </form>

          <section className="guide-preview" aria-label="Live guide preview">
            <div className="preview-heading"><div><p className="scam-admin-eyebrow">Preview</p><h2>{draft.title || "Guide title"}</h2></div><span>{draft.category || "Category"}</span></div>
            <p className="preview-summary">{draft.summary || "The guide description will appear here."}</p>
            {previewUrl && <img className="preview-image" src={previewUrl} alt={draft.title ? `Example image for ${draft.title}` : "Scam guide example preview"} />}
            <div className="preview-columns">
              <div><h3>Warning signs</h3><ul>{draft.warning_signs_text.split("\n").map((sign) => sign.trim()).filter(Boolean).map((sign) => <li key={sign}>{sign}</li>)}</ul></div>
              <div><h3>What to do</h3><p>{draft.recommended_action || "Recommended action will appear here."}</p></div>
            </div>
          </section>
        </section>
      </div>
      <style>{adminScamStyles}</style>
    </main>
  );
}

const adminScamStyles = `
  * { box-sizing: border-box; }
  .scam-admin-layout { min-height: 100vh; padding: 38px clamp(18px, 4vw, 56px) 56px; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .scam-admin-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; max-width: 1500px; margin: 0 auto 26px; padding-bottom: 24px; border-bottom: 1px solid #dce5ef; }
  .back-link { display: block; margin: 0 0 19px; padding: 0; border: 0; background: transparent; color: #159eba; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
  .scam-admin-eyebrow { margin: 0 0 6px; color: #20b6d8; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .scam-admin-header h1 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: clamp(30px, 3vw, 42px); letter-spacing: -1.5px; }
  .scam-admin-header > div > p:last-child { margin: 10px 0 0; color: #65738a; font-size: 16px; }
  .new-guide-button, .save-button { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 17px; border: 0; border-radius: 12px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; white-space: nowrap; }
  .new-guide-button:hover, .save-button:hover { background: #20b6d8; }
  .scam-admin-workspace { display: grid; grid-template-columns: minmax(230px, 290px) minmax(0, 1fr); gap: 20px; max-width: 1500px; margin: 0 auto; align-items: start; }
  .guide-list-panel, .guide-editor { min-width: 0; padding: 21px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; }
  .guide-list-panel { position: sticky; top: 20px; max-height: calc(100vh - 40px); overflow-y: auto; }
  .guide-list-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .guide-list-heading h2, .editor-heading h2, .preview-heading h2 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 20px; }
  .guide-list-heading span { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 7px; border-radius: 999px; background: #e6faff; color: #159eba; font-size: 12px; font-weight: 800; }
  .guide-list { display: grid; gap: 7px; }
  .guide-list-item { display: grid; gap: 5px; width: 100%; padding: 12px; border: 1px solid transparent; border-radius: 12px; background: transparent; color: #121a32; cursor: pointer; text-align: left; }
  .guide-list-item:hover { background: #f6f9fd; }
  .guide-list-item.selected { border-color: #bdebf4; background: #effbfe; }
  .guide-list-category { color: #159eba; font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
  .guide-list-item strong { font-family: "Syne", Arial, sans-serif; font-size: 14px; line-height: 1.3; }
  .publish-state { color: #8a6670; font-size: 11px; font-weight: 800; }
  .publish-state.published { color: #13835b; }
  .editor-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 15px; margin-bottom: 17px; }
  .editor-heading h2 { font-size: 23px; }
  .slug-label { color: #78869a; font-family: monospace; font-size: 12px; }
  .editor-message { margin: 0 0 14px; padding: 11px 13px; border-radius: 10px; font-size: 13px; line-height: 1.45; }
  .error-message { border: 1px solid #ffc1c3; background: #fff4f4; color: #b52f38; }
  .success-message { border: 1px solid #b9e8d3; background: #f0fbf5; color: #16704f; }
  .editor-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
  .editor-fields > label, .image-field { display: grid; gap: 7px; color: #26324a; font-size: 13px; font-weight: 800; }
  .editor-fields input:not([type="checkbox"]), .editor-fields textarea { width: 100%; padding: 11px 12px; border: 1px solid #dce5ef; border-radius: 10px; outline: none; background: #fff; color: #121a32; font: inherit; font-size: 14px; font-weight: 400; line-height: 1.45; }
  .editor-fields input:focus, .editor-fields textarea:focus { border-color: #31c7e6; box-shadow: 0 0 0 3px rgba(49, 199, 230, .13); }
  .editor-fields textarea { resize: vertical; }
  .wide-field { grid-column: 1 / -1; }
  .field-hint { color: #79879a; font-size: 12px; font-weight: 400; line-height: 1.4; }
  .field-label { color: #26324a; font-size: 13px; font-weight: 800; }
  .image-field input[type="file"] { width: 100%; padding: 10px; border: 1px dashed #b8c8d9; border-radius: 10px; color: #536179; font-size: 13px; }
  .remove-image-button { justify-self: start; padding: 0; border: 0; background: transparent; color: #c43e48; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
  .publish-toggle { display: flex !important; align-items: center; gap: 11px !important; grid-column: 1 / -1; padding: 13px; border: 1px solid #dce5ef; border-radius: 12px; background: #fbfdff; cursor: pointer; }
  .publish-toggle input { width: 18px; height: 18px; accent-color: #20b6d8; }
  .publish-toggle span, .publish-toggle strong, .publish-toggle small { display: block; }
  .publish-toggle strong { color: #121a32; font-size: 13px; }
  .publish-toggle small { margin-top: 3px; color: #79879a; font-size: 12px; font-weight: 400; }
  .editor-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  .cancel-button { min-height: 44px; padding: 0 14px; border: 1px solid #dce5ef; border-radius: 11px; background: #fff; color: #536179; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; }
  .save-button:disabled { cursor: wait; opacity: .6; }
  .guide-preview { margin-top: 23px; padding: 20px; border: 1px solid #dce5ef; border-radius: 15px; background: #f9fbfe; }
  .preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .preview-heading h2 { font-size: 19px; }
  .preview-heading > span { flex: 0 0 auto; padding: 6px 9px; border-radius: 999px; background: #e6faff; color: #159eba; font-size: 11px; font-weight: 800; }
  .preview-summary { margin: 9px 0 15px; color: #65738a; font-size: 14px; line-height: 1.5; }
  .preview-image { display: block; max-width: 100%; max-height: 380px; margin: 0 auto 16px; border-radius: 10px; object-fit: contain; }
  .preview-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .preview-columns > div { padding: 14px; border: 1px solid #e3eaf2; border-radius: 12px; background: #fff; }
  .preview-columns h3 { margin: 0 0 8px; font-family: "Syne", Arial, sans-serif; font-size: 14px; }
  .preview-columns ul, .preview-columns p { margin: 0; padding-left: 17px; color: #536179; font-size: 13px; line-height: 1.5; }
  .preview-columns p { padding: 0; }
  .guide-list-status { color: #79879a; font-size: 13px; line-height: 1.5; }
  .scam-admin-gate { display: grid; place-items: center; min-height: 100vh; padding: 24px; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .scam-admin-gate-card { width: min(100%, 480px); padding: 32px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; text-align: center; }
  .scam-admin-gate-card h1 { margin: 0 0 9px; font-family: "Syne", Arial, sans-serif; font-size: 24px; }
  .scam-admin-gate-card p { color: #65738a; font-size: 14px; line-height: 1.5; }
  .scam-admin-gate-card button { margin-top: 18px; padding: 11px 15px; border: 0; border-radius: 10px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; }
  @media (max-width: 900px) { .scam-admin-workspace { grid-template-columns: 1fr; } .guide-list-panel { position: static; max-height: none; } .guide-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 600px) { .scam-admin-layout { padding: 24px 14px 35px; } .scam-admin-header { align-items: flex-start; flex-direction: column; } .guide-list { grid-template-columns: 1fr; } .editor-fields, .preview-columns { grid-template-columns: 1fr; } .wide-field, .publish-toggle { grid-column: 1; } .editor-heading { align-items: flex-start; flex-direction: column; } .editor-actions { flex-direction: column-reverse; } .editor-actions button { width: 100%; } }
`;
