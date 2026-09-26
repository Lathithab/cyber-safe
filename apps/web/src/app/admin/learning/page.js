"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";
import DashboardNavIcon from "../../components/DashboardNavIcon";
import LogoutButton from "../../components/LogoutButton";
import { DASHBOARD_NAV } from "../../components/dashboardNav";

const EMPTY_MODULE = {
  slug: "",
  title: "",
  description: "",
  content: "",
  difficulty: "Beginner",
  category: "",
  order_index: 1,
  estimated_minutes: 10,
  published: false,
};

const EMPTY_QUESTION = {
  question: "",
  options: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
};

function moduleDraft(module) {
  if (!module) return { ...EMPTY_MODULE };
  return {
    id: module.id,
    slug: module.slug || "",
    title: module.title || "",
    description: module.description || "",
    content: module.content || "",
    difficulty: module.difficulty || "Beginner",
    category: module.category || "",
    order_index: module.order_index ?? 0,
    estimated_minutes: module.estimated_minutes ?? 10,
    published: Boolean(module.published),
  };
}

function questionDraft(question) {
  return {
    question: question.question || "",
    options: Array.isArray(question.options)
      ? [...question.options.slice(0, 4), ...Array(Math.max(0, 4 - question.options.length)).fill("")]
      : ["", "", "", ""],
    correct_index: Number.isInteger(question.correct_index) ? question.correct_index : 0,
    explanation: question.explanation || "",
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminLearningPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [moduleForm, setModuleForm] = useState({ ...EMPTY_MODULE });
  const [quizForm, setQuizForm] = useState({ title: "", tier: "Beginner", description: "" });
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const loadModules = useCallback(async (preferredId = "") => {
    if (!supabase) return;
    setIsLoadingModules(true);
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("order_index", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("Could not load admin learning modules:", error);
      setErrorMessage("Could not load modules. Confirm the learning tables and admin RLS migration have been applied.");
      setIsLoadingModules(false);
      return;
    }

    const rows = data || [];
    setModules(rows);
    const nextId = preferredId || rows[0]?.id || "";
    if (nextId && rows.some((module) => module.id === nextId)) setSelectedModuleId(nextId);
    setIsLoadingModules(false);
  }, [selectedModuleId]);

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
      if (!error && profile?.role === "admin") setAccess("allowed");
      else setAccess("denied");
    }

    verifyAdmin();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (access === "allowed") loadModules();
  }, [access, loadModules]);

  useEffect(() => {
    if (!selectedModuleId || !supabase) return;
    let active = true;

    async function loadQuiz() {
      setIsLoadingQuiz(true);
      setErrorMessage("");
      const { data: module, error: moduleError } = await supabase
        .from("modules")
        .select("*")
        .eq("id", selectedModuleId)
        .single();
      if (!active) return;
      if (moduleError) {
        setErrorMessage(`Could not load this module: ${moduleError.message}`);
        setIsLoadingQuiz(false);
        return;
      }

      const { data: quiz, error: quizError } = await supabase
        .from("Quizz")
        .select("*")
        .eq("module_id", selectedModuleId)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (quizError) {
        setErrorMessage(`Could not load this quiz: ${quizError.message}`);
        setIsLoadingQuiz(false);
        return;
      }

      setModuleForm(moduleDraft(module));
      if (!quiz) {
        setQuizForm({ title: `${module.title} Quiz`, tier: module.difficulty || "Beginner", description: `Test your understanding of ${module.title}.` });
        setQuestions([{ ...EMPTY_QUESTION }]);
        setIsLoadingQuiz(false);
        return;
      }

      const { data: questionRows, error: questionError } = await supabase
        .from("quiz_questions")
        .select("question, options, correct_index, explanation, order_index")
        .eq("quizz_id", quiz.id)
        .order("order_index", { ascending: true });
      if (!active) return;
      if (questionError) {
        setErrorMessage(`Could not load quiz questions: ${questionError.message}`);
      } else {
        setQuizForm({
          title: quiz.Title || "",
          tier: quiz.Tier || module.difficulty || "Beginner",
          description: quiz.Description || "",
        });
        const savedQuestions = (questionRows || []).map(questionDraft);
        setQuestions(savedQuestions.length ? savedQuestions : [{ ...EMPTY_QUESTION }]);
      }
      setIsLoadingQuiz(false);
    }

    loadQuiz();
    return () => { active = false; };
  }, [selectedModuleId]);

  const visibleModules = modules.filter((module) =>
    `${module.title} ${module.category} ${module.slug}`.toLowerCase().includes(moduleFilter.toLowerCase())
  );

  function startNewModule() {
    setSelectedModuleId("");
    setIsLoadingQuiz(false);
    setModuleForm({ ...EMPTY_MODULE, order_index: modules.length + 1 });
    setQuizForm({ title: "", tier: "Beginner", description: "" });
    setQuestions([{ ...EMPTY_QUESTION }]);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function editModule(module) {
    setSelectedModuleId(module.id);
    setIsLoadingQuiz(true);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function updateModule(field, value) {
    setModuleForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
  }

  function updateQuestion(questionIndex, field, value) {
    setQuestions((current) => current.map((question, index) => index === questionIndex
      ? { ...question, [field]: value }
      : question));
    setSuccessMessage("");
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((current) => current.map((question, index) => index === questionIndex
      ? { ...question, options: question.options.map((option, itemIndex) => itemIndex === optionIndex ? value : option) }
      : question));
    setSuccessMessage("");
  }

  function addQuestion() {
    setQuestions((current) => [...current, { ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }]);
  }

  function removeQuestion(questionIndex) {
    setQuestions((current) => current.length > 1 ? current.filter((_, index) => index !== questionIndex) : current);
  }

  async function saveLearningContent(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const slug = moduleForm.slug.trim() || slugify(moduleForm.title);
    if (!slug || !moduleForm.title.trim() || !moduleForm.description.trim() || !moduleForm.content.trim() || !moduleForm.category.trim()) {
      setErrorMessage("Complete the module title, slug, category, description, and lesson content.");
      return;
    }
    if (!quizForm.title.trim() || !quizForm.description.trim() || !quizForm.tier.trim()) {
      setErrorMessage("Complete the quiz title, tier, and description.");
      return;
    }
    const incompleteQuestion = questions.findIndex((question) =>
      !question.question.trim() || question.options.some((option) => !option.trim())
    );
    if (incompleteQuestion !== -1) {
      setErrorMessage(`Complete the question and all four answer options for Question ${incompleteQuestion + 1}.`);
      return;
    }

    setIsSaving(true);
    try {
      const { data: savedModuleId, error } = await supabase.rpc("admin_save_learning_content", {
        p_module: {
          ...moduleForm,
          slug,
          title: moduleForm.title.trim(),
          description: moduleForm.description.trim(),
          content: moduleForm.content.trim(),
          category: moduleForm.category.trim(),
          difficulty: moduleForm.difficulty.trim(),
          order_index: Number(moduleForm.order_index) || 0,
          estimated_minutes: Number(moduleForm.estimated_minutes) || 5,
        },
        p_quiz: {
          title: quizForm.title.trim(),
          tier: quizForm.tier.trim(),
          description: quizForm.description.trim(),
        },
        p_questions: questions.map((question) => ({
          question: question.question.trim(),
          options: question.options.map((option) => option.trim()),
          correct_index: Number(question.correct_index),
          explanation: question.explanation.trim(),
        })),
      });
      if (error) throw new Error(error.message);

      await loadModules(savedModuleId);
      setSelectedModuleId(savedModuleId);
      setSuccessMessage(moduleForm.published ? "Module and quiz saved and published." : "Module and quiz saved as a draft.");
    } catch (error) {
      console.error("Could not save learning content:", error);
      setErrorMessage(error.message || "Could not save this module and quiz.");
    } finally {
      setIsSaving(false);
    }
  }

  if (access !== "allowed") {
    return (
      <main className="learning-admin-gate">
        <section className="learning-admin-gate-card" aria-live="polite">
          <h1>{access === "checking" ? "Checking admin access" : access === "denied" ? "Admin access required" : "Admin dashboard unavailable"}</h1>
          <p>{access === "checking" ? "Please wait while we verify your account." : access === "denied" ? "This account does not have the Platform Admin role." : "Configure Supabase and sign in with an administrator account."}</p>
          {access === "denied" && <button type="button" onClick={() => router.replace("/feed")}>Return to community feed</button>}
          {access === "unavailable" && <button type="button" onClick={() => router.replace("/login")}>Go to login</button>}
        </section>
        <style>{learningAdminStyles}</style>
      </main>
    );
  }

  return (
    <main className="learning-admin-dashboard">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => router.push("/")}>
          <span className="brand-icon"><DashboardNavIcon name="admin" size={27} /></span>
          <span><strong>CyberSafe</strong><small>South Africa</small></span>
        </button>
        <nav className="side-nav" aria-label="Dashboard navigation">
          {DASHBOARD_NAV.map(([label, route, icon]) => (
            <button key={label} className={`side-link ${route === "/admin" ? "active" : ""}`} type="button" onClick={() => router.push(route)}>
              <DashboardNavIcon name={icon} size={24} /><span>{label}</span>
            </button>
          ))}
          <button className="side-link platform-admin-nav active" type="button" onClick={() => router.push("/admin")}>
            <DashboardNavIcon name="admin" size={24} /><span>Platform Admin</span>
          </button>
        </nav>
        <LogoutButton />
      </aside>

      <section className="learning-admin-content">
        <header className="learning-admin-header">
          <div>
            <button type="button" className="learning-back-link" onClick={() => router.push("/admin")}>← Platform Admin</button>
            <p className="learning-admin-eyebrow">Learning Academy</p>
            <h1>Modules and quizzes</h1>
            <p>Create and maintain lesson content and its quiz. Unpublish a module to hide it from learners without deleting their progress.</p>
          </div>
          <button type="button" className="learning-new-button" onClick={startNewModule}>＋ New module</button>
        </header>

        <div className="learning-admin-workspace">
          <aside className="learning-module-list">
            <div className="learning-list-heading"><h2>Modules</h2><span>{modules.length}</span></div>
            <input className="learning-search" aria-label="Search modules" placeholder="Search modules" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} />
            {isLoadingModules && <p className="learning-list-status">Loading modules…</p>}
            {!isLoadingModules && !visibleModules.length && <p className="learning-list-status">No matching modules.</p>}
            <div className="learning-module-items">
              {visibleModules.map((module) => (
                <button key={module.id} type="button" className={`learning-module-item ${selectedModuleId === module.id ? "selected" : ""}`} onClick={() => editModule(module)}>
                  <span>{module.category || "Uncategorised"}</span>
                  <strong>{module.title}</strong>
                  <small className={module.published ? "module-published" : ""}>{module.published ? "Published" : "Draft"}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="learning-editor">
            <div className="learning-editor-heading">
              <div><p className="learning-admin-eyebrow">{moduleForm.id ? "Edit module" : "Create module"}</p><h2>{moduleForm.title || "Untitled module"}</h2></div>
              {moduleForm.slug && <code>/{moduleForm.slug}</code>}
            </div>
            {errorMessage && <p className="learning-feedback learning-error" role="alert">{errorMessage}</p>}
            {successMessage && <p className="learning-feedback learning-success" role="status">{successMessage}</p>}
            {isLoadingQuiz && <p className="learning-list-status">Loading module and quiz…</p>}

            <form onSubmit={saveLearningContent}>
              <fieldset disabled={isSaving || isLoadingQuiz}>
                <legend>Module details</legend>
                <div className="learning-form-grid">
                  <label>Module title<input required maxLength={150} value={moduleForm.title} onChange={(event) => {
                    const title = event.target.value;
                    setModuleForm((current) => ({ ...current, title, ...(!current.id ? { slug: slugify(title) } : {}) }));
                    setSuccessMessage("");
                  }} /></label>
                  <label>URL slug<input required maxLength={150} value={moduleForm.slug} onChange={(event) => updateModule("slug", slugify(event.target.value))} placeholder="e.g. password-security" /></label>
                  <label>Category<input required maxLength={80} value={moduleForm.category} onChange={(event) => updateModule("category", event.target.value)} placeholder="e.g. Banking" /></label>
                  <label>Difficulty<input required maxLength={40} value={moduleForm.difficulty} onChange={(event) => updateModule("difficulty", event.target.value)} placeholder="e.g. Beginner" /></label>
                  <label>Estimated minutes<input required type="number" min="1" max="600" value={moduleForm.estimated_minutes} onChange={(event) => updateModule("estimated_minutes", event.target.value)} /></label>
                  <label>Display order<input required type="number" min="0" value={moduleForm.order_index} onChange={(event) => updateModule("order_index", event.target.value)} /></label>
                  <label className="learning-wide-field">Short description<textarea required rows={3} maxLength={500} value={moduleForm.description} onChange={(event) => updateModule("description", event.target.value)} /></label>
                  <label className="learning-wide-field">Lesson content<textarea required rows={12} value={moduleForm.content} onChange={(event) => updateModule("content", event.target.value)} placeholder="Write the lesson content learners will read." /></label>
                </div>
                <label className="learning-publish-toggle">
                  <input type="checkbox" checked={moduleForm.published} onChange={(event) => updateModule("published", event.target.checked)} />
                  <span><strong>Visible to learners</strong><small>Unpublished modules remain editable here and do not appear in Learn Security.</small></span>
                </label>
              </fieldset>

              <fieldset disabled={isSaving || isLoadingQuiz} className="quiz-editor-fieldset">
                <legend>Quiz</legend>
                <div className="learning-form-grid">
                  <label>Quiz title<input required maxLength={150} value={quizForm.title} onChange={(event) => setQuizForm((current) => ({ ...current, title: event.target.value }))} /></label>
                  <label>Quiz tier<input required maxLength={40} value={quizForm.tier} onChange={(event) => setQuizForm((current) => ({ ...current, tier: event.target.value }))} placeholder="Must match a Supabase Tier enum value" /></label>
                  <label className="learning-wide-field">Quiz description<textarea required rows={2} maxLength={500} value={quizForm.description} onChange={(event) => setQuizForm((current) => ({ ...current, description: event.target.value }))} /></label>
                </div>

                <div className="learning-questions-heading"><h3>Questions</h3><span>{questions.length} total</span></div>
                <div className="learning-question-list">
                  {questions.map((question, questionIndex) => (
                    <section className="learning-question-card" key={`question-${questionIndex}`}>
                      <div className="learning-question-title"><h4>Question {questionIndex + 1}</h4>{questions.length > 1 && <button type="button" onClick={() => removeQuestion(questionIndex)}>Remove</button>}</div>
                      <label>Question text<textarea required rows={2} value={question.question} onChange={(event) => updateQuestion(questionIndex, "question", event.target.value)} /></label>
                      <div className="learning-option-grid">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex}>Option {String.fromCharCode(65 + optionIndex)}<input required value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} /></label>
                        ))}
                      </div>
                      <label>Correct answer<select value={question.correct_index} onChange={(event) => updateQuestion(questionIndex, "correct_index", Number(event.target.value))}>
                        {question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>{String.fromCharCode(65 + optionIndex)}</option>)}
                      </select></label>
                      <label>Explanation shown after answering<textarea rows={2} value={question.explanation} onChange={(event) => updateQuestion(questionIndex, "explanation", event.target.value)} /></label>
                    </section>
                  ))}
                </div>
                <button type="button" className="learning-add-question" onClick={addQuestion}>＋ Add question</button>
              </fieldset>

              <div className="learning-save-row">
                <p>Saving replaces this quiz’s question set in one database transaction.</p>
                <button className="learning-save-button" type="submit" disabled={isSaving || isLoadingQuiz}>{isSaving ? "Saving…" : moduleForm.published ? "Save and publish" : "Save draft"}</button>
              </div>
            </form>
          </section>
        </div>
      </section>
      <style>{learningAdminStyles}</style>
    </main>
  );
}

const learningAdminStyles = `
  * { box-sizing: border-box; }
  .learning-admin-dashboard { min-height: 100vh; display: grid; grid-template-columns: 300px minmax(0, 1fr); background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .learning-admin-dashboard > .sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 24px 22px; border-right: 1px solid #e2e9f2; background: #fff; }
  .learning-admin-dashboard .brand { display: flex; align-items: center; gap: 13px; border: 0; padding: 0; background: transparent; color: #121a32; cursor: pointer; text-align: left; }
  .learning-admin-dashboard .brand-icon { display: grid; place-items: center; flex: 0 0 49px; width: 49px; height: 49px; border-radius: 13px; background: #e6faff; color: #31c7e6; }
  .learning-admin-dashboard .brand strong { display: block; font-family: "Syne", Arial, sans-serif; font-size: 24px; }
  .learning-admin-dashboard .brand small { display: block; margin-top: 3px; color: #31c7e6; font-size: 13px; font-weight: 700; }
  .learning-admin-dashboard .side-nav { display: grid; gap: 6px; margin-top: 30px; }
  .learning-admin-dashboard .side-link { display: flex; align-items: center; gap: 13px; width: 100%; min-height: 46px; padding: 11px 13px; border: 0; border-radius: 12px; background: transparent; color: #536179; cursor: pointer; font: inherit; font-size: 16px; text-align: left; }
  .learning-admin-dashboard .side-link.active { background: #e5f9fd; color: #121a32; font-weight: 800; }
  .learning-admin-dashboard .side-link.active svg { color: #31c7e6; }
  .learning-admin-dashboard .platform-admin-nav { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e9f2; }
  .learning-admin-content { min-width: 0; padding: 36px clamp(18px, 3.6vw, 54px) 56px; }
  .learning-admin-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; max-width: 1500px; margin: 0 auto 25px; padding-bottom: 23px; border-bottom: 1px solid #dce5ef; }
  .learning-back-link { display: block; margin: 0 0 17px; padding: 0; border: 0; background: transparent; color: #159eba; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; }
  .learning-admin-eyebrow { margin: 0 0 6px; color: #20b6d8; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .learning-admin-header h1 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: clamp(30px, 3vw, 42px); letter-spacing: -1.4px; }
  .learning-admin-header > div > p:last-child { max-width: 820px; margin: 10px 0 0; color: #65738a; font-size: 15px; line-height: 1.5; }
  .learning-new-button, .learning-save-button { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 17px; border: 0; border-radius: 12px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; white-space: nowrap; }
  .learning-admin-workspace { display: grid; grid-template-columns: minmax(220px, 275px) minmax(0, 1fr); gap: 18px; max-width: 1500px; margin: 0 auto; align-items: start; }
  .learning-module-list, .learning-editor { min-width: 0; padding: 20px; border: 1px solid #dce5ef; border-radius: 17px; background: #fff; }
  .learning-module-list { position: sticky; top: 18px; max-height: calc(100vh - 36px); overflow-y: auto; }
  .learning-list-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .learning-list-heading h2, .learning-editor-heading h2 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 20px; }
  .learning-list-heading > span { display: grid; place-items: center; min-width: 28px; height: 28px; border-radius: 999px; background: #e6faff; color: #159eba; font-size: 12px; font-weight: 800; }
  .learning-search { width: 100%; margin-bottom: 12px; padding: 10px 11px; border: 1px solid #dce5ef; border-radius: 9px; color: #121a32; font: inherit; font-size: 13px; }
  .learning-module-items { display: grid; gap: 7px; }
  .learning-module-item { display: grid; gap: 5px; width: 100%; padding: 11px; border: 1px solid transparent; border-radius: 11px; background: transparent; color: #121a32; cursor: pointer; text-align: left; }
  .learning-module-item:hover { background: #f6f9fd; }
  .learning-module-item.selected { border-color: #bdebf4; background: #effbfe; }
  .learning-module-item > span { color: #159eba; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
  .learning-module-item > strong { font-family: "Syne", Arial, sans-serif; font-size: 14px; line-height: 1.35; }
  .learning-module-item > small { color: #9b6067; font-size: 11px; font-weight: 800; }
  .learning-module-item > small.module-published { color: #13835b; }
  .learning-editor-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
  .learning-editor-heading h2 { font-size: 23px; }
  .learning-editor-heading code { color: #79879a; font-size: 12px; }
  .learning-feedback { margin: 0 0 15px; padding: 11px 13px; border-radius: 10px; font-size: 13px; line-height: 1.45; }
  .learning-error { border: 1px solid #ffc1c3; background: #fff4f4; color: #b52f38; }
  .learning-success { border: 1px solid #b9e8d3; background: #f0fbf5; color: #16704f; }
  .learning-editor fieldset { min-width: 0; margin: 0 0 19px; padding: 16px; border: 1px solid #dce5ef; border-radius: 13px; }
  .learning-editor legend { padding: 0 7px; color: #121a32; font-family: "Syne", Arial, sans-serif; font-size: 16px; font-weight: 800; }
  .learning-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
  .learning-form-grid > label, .learning-question-card > label, .learning-option-grid > label { display: grid; gap: 6px; color: #26324a; font-size: 12px; font-weight: 800; }
  .learning-editor input:not([type="checkbox"]), .learning-editor textarea, .learning-editor select { width: 100%; min-height: 42px; padding: 10px 11px; border: 1px solid #dce5ef; border-radius: 9px; outline: none; background: #fff; color: #121a32; font: inherit; font-size: 13px; font-weight: 400; line-height: 1.45; }
  .learning-editor textarea { resize: vertical; }
  .learning-editor input:focus, .learning-editor textarea:focus, .learning-editor select:focus { border-color: #31c7e6; box-shadow: 0 0 0 3px rgba(49, 199, 230, .13); }
  .learning-wide-field { grid-column: 1 / -1; }
  .learning-publish-toggle { display: flex; align-items: center; gap: 11px; margin-top: 14px; padding: 12px; border: 1px solid #dce5ef; border-radius: 11px; background: #fbfdff; cursor: pointer; }
  .learning-publish-toggle input { width: 18px; height: 18px; accent-color: #20b6d8; }
  .learning-publish-toggle strong, .learning-publish-toggle small { display: block; }
  .learning-publish-toggle strong { font-size: 13px; }
  .learning-publish-toggle small { margin-top: 3px; color: #79879a; font-size: 11px; font-weight: 400; line-height: 1.4; }
  .learning-questions-heading { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 10px; }
  .learning-questions-heading h3 { margin: 0; font-family: "Syne", Arial, sans-serif; font-size: 16px; }
  .learning-questions-heading span { color: #79879a; font-size: 12px; }
  .learning-question-list { display: grid; gap: 12px; }
  .learning-question-card { display: grid; gap: 11px; min-width: 0; padding: 14px; border: 1px solid #e3eaf2; border-radius: 12px; background: #fbfdff; }
  .learning-question-title { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .learning-question-title h4 { margin: 0; color: #159eba; font-family: "Syne", Arial, sans-serif; font-size: 14px; }
  .learning-question-title button { border: 0; background: transparent; color: #c43e48; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
  .learning-option-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .learning-add-question { min-height: 40px; margin-top: 12px; padding: 0 13px; border: 1px dashed #9bb5c7; border-radius: 9px; background: #fff; color: #159eba; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; }
  .learning-save-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
  .learning-save-row p { color: #79879a; font-size: 12px; line-height: 1.4; }
  .learning-save-button:disabled { cursor: wait; opacity: .6; }
  .learning-list-status { margin: 12px 0; color: #79879a; font-size: 12px; line-height: 1.45; }
  .learning-admin-gate { display: grid; place-items: center; min-height: 100vh; padding: 24px; background: #f6f9fd; color: #121a32; font-family: "DM Sans", Arial, sans-serif; }
  .learning-admin-gate-card { width: min(100%, 480px); padding: 30px; border: 1px solid #dce5ef; border-radius: 18px; background: #fff; text-align: center; }
  .learning-admin-gate-card h1 { margin: 0 0 9px; font-family: "Syne", Arial, sans-serif; font-size: 24px; }
  .learning-admin-gate-card p { color: #65738a; font-size: 14px; line-height: 1.5; }
  .learning-admin-gate-card button { margin-top: 16px; padding: 11px 15px; border: 0; border-radius: 10px; background: #31c7e6; color: #102039; cursor: pointer; font: inherit; font-weight: 800; }
  @media (max-width: 1050px) { .learning-admin-dashboard { grid-template-columns: 255px minmax(0, 1fr); } .learning-admin-dashboard > .sidebar { padding-inline: 16px; } .learning-admin-workspace { grid-template-columns: minmax(190px, 230px) minmax(0, 1fr); } .learning-admin-content { padding-inline: 22px; } }
  @media (max-width: 800px) { .learning-admin-dashboard { display: block; } .learning-admin-dashboard > .sidebar { position: static; width: 100%; height: auto; padding: 16px; border-right: 0; border-bottom: 1px solid #e2e9f2; } .learning-admin-dashboard .brand { margin-bottom: 14px; } .learning-admin-dashboard .side-nav { display: flex; overflow-x: auto; margin: 0; } .learning-admin-dashboard .side-link { width: auto; min-width: max-content; min-height: 42px; padding: 9px 11px; font-size: 13px; } .learning-admin-content { padding: 24px 16px 42px; } .learning-admin-workspace { grid-template-columns: 1fr; } .learning-module-list { position: static; max-height: none; } .learning-module-items { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .learning-admin-content { padding-inline: 12px; } .learning-admin-header { align-items: flex-start; flex-direction: column; } .learning-new-button { width: 100%; } .learning-module-items, .learning-form-grid, .learning-option-grid { grid-template-columns: 1fr; } .learning-wide-field { grid-column: 1; } .learning-editor { padding: 14px; } .learning-editor fieldset { padding: 12px; } .learning-save-row { align-items: stretch; flex-direction: column; } .learning-save-button { width: 100%; } }
`;
