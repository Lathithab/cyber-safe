"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../../../../lib/supabase";
import { getModuleBadge } from "../../../../lib/moduleBadges";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  // Answers the learner has submitted so far, sent to the server for grading.
  const [answers, setAnswers] = useState([]);
  // The server's verdict on the current question (correct answer + explanation).
  const [feedback, setFeedback] = useState(null);
  // The server's final grade for the whole quiz.
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      if (!isSupabaseConfigured) {
        setLoadError("Supabase is not configured.");
        setIsLoading(false);
        return;
      }

      // Load the quiz
      const { data: quizData, error: quizError } = await supabase
        .from("Quizz")
        .select("*")
        .eq("module_id", params.module_id)
        .single();

      if (quizError) {
        console.error(
          "Error loading quiz:",
          JSON.stringify(quizError, null, 2)
        );
        setLoadError("We could not load this quiz.");
        setIsLoading(false);
        return;
      }

      // Load the questions
      const { data: questionData, error: questionError } = await supabase
        .from("quiz_questions_public")
        .select("id, quizz_id, question, options, order_index")
        .eq("quizz_id", quizData.id)
        .order("order_index", { ascending: true });

      if (questionError) {
        console.error(
          "Error loading questions:",
          JSON.stringify(questionError, null, 2)
        );
        setLoadError("We could not load the quiz questions.");
        setIsLoading(false);
        return;
      }

      setQuiz(quizData);
      setQuestions(questionData || []);

      const { data: moduleData } = await supabase
        .from("modules")
        .select("title")
        .eq("id", params.module_id)
        .maybeSingle();
      setModuleTitle(moduleData?.title || "Learning Module");
      setIsLoading(false);
    }

    if (params.module_id) {
      loadQuiz();
    }
  }, [params.module_id]);

  function handleAnswerSelect(index) {
    if (submitted) return;

    setSelectedAnswer(index);
  }

  // Grading happens in the database: the browser never sees the correct answer
  // until it has committed to one.
  async function handleSubmit() {
    if (selectedAnswer === null || isChecking) return;

    const question = questions[currentQuestion];
    setIsChecking(true);

    const { data, error } = await supabase.rpc("check_quiz_answer", {
      p_question_id: question.id,
      p_selected_index: selectedAnswer,
    });

    setIsChecking(false);

    if (error) {
      console.error("Error checking answer:", error.message);
      setLoadError("We could not check your answer. Please sign in and try again.");
      return;
    }

    setFeedback(data);
    setAnswers((previous) => [
      ...previous,
      { question_id: question.id, selected_index: selectedAnswer },
    ]);
    // Display-only running score. The saved score is calculated by the server.
    if (data.is_correct) setScore((previousScore) => previousScore + 1);
    setSubmitted(true);
  }

  async function handleNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previousQuestion) => previousQuestion + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setFeedback(null);
      return;
    }

    // Last question: ask the server to grade the quiz and save the result.
    setIsSavingCompletion(true);
    const { data, error } = await supabase.rpc("submit_quiz", {
      p_module_id: params.module_id,
      p_answers: answers,
    });
    setIsSavingCompletion(false);

    if (error) {
      console.error("Error submitting quiz:", error.message);
      setCompletionMessage("Sign in to save your module completion and badge.");
    } else {
      setResult(data);
      setCompletionMessage(
        data.passed
          ? `Badge earned: ${getModuleBadge({ title: moduleTitle }).title}`
          : `Score at least ${data.pass_mark}% to complete this module and earn its badge. Review the module and try again.`
      );
    }
    setIsComplete(true);
  }

  function handleRestart() {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setFeedback(null);
    setAnswers([]);
    setResult(null);
    setCompletionMessage("");
    setScore(0);
    setIsComplete(false);
  }

  if (isLoading) {
    return (
      <main style={styles.page}>
        <p>Loading quiz...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={styles.page}>
        <p style={styles.error}>{loadError}</p>
      </main>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <main style={styles.page}>
        <p style={styles.error}>No quiz questions were found.</p>
      </main>
    );
  }

  if (isComplete) {
    const percentage =
      result?.score_percent ?? Math.round((score / questions.length) * 100);

    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Quiz Complete!</h1>

          <p style={styles.description}>{quiz.Description}</p>

          <div style={styles.scoreBox}>
            <p style={styles.scoreNumber}>
              {result?.correct_count ?? score}/{result?.total_questions ?? questions.length}
            </p>
            <p style={styles.scorePercentage}>{percentage}%</p>
          </div>

          <p style={styles.resultText}>
            {percentage >= 80
              ? "Excellent work! You have a strong understanding of this topic."
              : percentage >= 60
              ? "Good effort! You understand the basics, but there is still room to improve."
              : "Keep practising. Review the module and try the quiz again."}
          </p>

          <p role="status" aria-live="polite" style={styles.badgeMessage}>
            {isSavingCompletion ? "Saving your module badge…" : completionMessage}
          </p>

          <div style={styles.resultButtons}>
  <button
    type="button"
    onClick={handleRestart}
    style={styles.button}
  >
    Retake Quiz
  </button>

  <button
    type="button"
    onClick={() => router.push("/learn")}
    style={styles.homeButton}
  >
    Back to Learn
  </button>
</div>
        </div>
      </main>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{quiz.Title}</h1>

        <p style={styles.description}>{quiz.Description}</p>

        <div style={styles.progressSection}>
          <div style={styles.progressTop}>
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div style={styles.progressBackground}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <h2 style={styles.question}>{question.question}</h2>

        <div style={styles.options}>
          {question.options.map((option, index) => {
            let background = "#ffffff";
            let border = "2px solid #d7dee8";

            if (submitted && feedback) {
              if (index === feedback.correct_index) {
                background = "#dff7e8";
                border = "2px solid #35a85b";
              } else if (
                index === selectedAnswer &&
                index !== feedback.correct_index
              ) {
                background = "#ffe3e3";
                border = "2px solid #d94b4b";
              }
            } else if (index === selectedAnswer) {
              background = "#e3f7fc";
              border = "2px solid #eb630f";
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                style={{
                  ...styles.option,
                  background,
                  border,
                }}
              >
                <span style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {submitted && feedback && (
          <div
            style={{
              ...styles.explanation,
              background:
                feedback.is_correct
                  ? "#dff7e8"
                  : "#fff1d9",
            }}
          >
            <strong>
              {feedback.is_correct
                ? "Correct!"
                : "Not quite."}
            </strong>

            <p>{feedback.explanation}</p>
          </div>
        )}

        <div style={styles.actions}>
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isChecking}
              style={{
                ...styles.button,
                opacity: selectedAnswer === null || isChecking ? 0.5 : 1,
                cursor:
                  selectedAnswer === null || isChecking ? "not-allowed" : "pointer",
              }}
            >
              {isChecking ? "Checking…" : "Submit Answer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSavingCompletion}
              style={styles.button}
            >
              {currentQuestion === questions.length - 1
                ? "See Results"
                : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "#faf7f2",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "800px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 8px 30px rgba(16, 32, 57, 0.08)",
  },

  title: {
    margin: "0 0 10px",
    color: "#102039",
    fontSize: "30px",
  },

  description: {
    color: "#5f6f82",
    marginBottom: "30px",
  },

  progressSection: {
    marginBottom: "35px",
  },

  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    color: "#5f6f82",
    fontSize: "14px",
    fontWeight: "600",
  },

  progressBackground: {
    height: "8px",
    background: "#e6ecf2",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#eb630f",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  question: {
    color: "#102039",
    fontSize: "22px",
    lineHeight: "1.4",
    marginBottom: "25px",
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  option: {
    width: "100%",
    padding: "17px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    color: "#102039",
    fontSize: "16px",
    cursor: "pointer",
  },

  optionLetter: {
    minWidth: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#eef3f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  explanation: {
    marginTop: "25px",
    padding: "18px",
    borderRadius: "13px",
    color: "#26384d",
    lineHeight: "1.5",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "30px",
  },

  button: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "13px",
    background: "#eb630f",
    color: "#102039",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "16px",
  },

  scoreBox: {
    textAlign: "center",
    padding: "30px",
    margin: "30px 0",
    background: "#faf7f2",
    borderRadius: "16px",
  },

  scoreNumber: {
    margin: "0",
    fontSize: "42px",
    fontWeight: "800",
    color: "#102039",
  },

  scorePercentage: {
    margin: "5px 0 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#31a8c4",
  },

  resultText: {
    color: "#4f6072",
    lineHeight: "1.6",
    marginBottom: "30px",
  },

  badgeMessage: {
    minHeight: "24px",
    margin: "-12px 0 24px",
    color: "#c24f0c",
    fontWeight: "700",
    textAlign: "center",
  },

  error: {
    color: "#c0392b",
    fontWeight: "600",
  },
  resultButtons: {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap",
},

homeButton: {
  padding: "14px 22px",
  border: "2px solid #eb630f",
  borderRadius: "13px",
  background: "#ffffff",
  color: "#102039",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "16px",
},
};
