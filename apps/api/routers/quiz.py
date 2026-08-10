"""
Cyber-risk quiz scoring engine and learning-progress tracking.

The frontend only ever receives questions (no `correct_index`); grading
happens here on the server so answers can't be read from dev tools.
"""

from fastapi import APIRouter, Depends, HTTPException

from database import get_supabase
from deps import CurrentUser, get_current_user
from schemas import QuizResult, QuizSubmission

router = APIRouter(prefix="/quiz", tags=["quiz"])

PASS_THRESHOLD_PERCENT = 70.0


@router.get("/{module_id}/questions")
def get_quiz_questions(module_id: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("quiz_questions")
        .select("id, question, options")
        .eq("module_id", module_id)
        .order("order_index")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No quiz questions found for this module")
    return result.data


@router.post("/{module_id}/submit", response_model=QuizResult)
def submit_quiz(module_id: str, submission: QuizSubmission, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()

    questions_result = (
        supabase.table("quiz_questions")
        .select("id, correct_index")
        .eq("module_id", module_id)
        .execute()
    )
    questions = questions_result.data or []
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz questions found for this module")

    correct_by_id = {q["id"]: q["correct_index"] for q in questions}
    answers_by_id = {a.question_id: a.selected_index for a in submission.answers}

    correct_count = sum(
        1 for qid, correct_idx in correct_by_id.items() if answers_by_id.get(qid) == correct_idx
    )
    total_questions = len(correct_by_id)
    score_percent = round((correct_count / total_questions) * 100, 1) if total_questions else 0.0
    passed = score_percent >= PASS_THRESHOLD_PERCENT

    supabase.table("user_progress").upsert(
        {
            "user_id": user.id,
            "module_id": module_id,
            "status": "completed" if passed else "in_progress",
            "quiz_score": score_percent,
            "completed_at": "now()" if passed else None,
        },
        on_conflict="user_id,module_id",
    ).execute()

    recommended_next_module_id = None
    if passed:
        current_module = (
            supabase.table("modules").select("order_index").eq("id", module_id).maybe_single().execute()
        )
        if current_module and current_module.data:
            next_module = (
                supabase.table("modules")
                .select("id")
                .gt("order_index", current_module.data["order_index"])
                .order("order_index")
                .limit(1)
                .execute()
            )
            if next_module.data:
                recommended_next_module_id = next_module.data[0]["id"]

    return QuizResult(
        module_id=module_id,
        score_percent=score_percent,
        correct_count=correct_count,
        total_questions=total_questions,
        passed=passed,
        recommended_next_module_id=recommended_next_module_id,
    )