"""
Aggregate analytics for teachers/admins - module completion rates,
average quiz scores, and moderation queue size.
"""

from fastapi import APIRouter, Depends

from database import get_supabase
from deps import require_role
from schemas import AnalyticsOverview, ModuleCompletionStat

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview, dependencies=[Depends(require_role("admin", "teacher"))])
def get_overview():
    supabase = get_supabase()

    profiles = supabase.table("profiles").select("id", count="exact").eq("role", "learner").execute()
    reports = supabase.table("posts").select("id", count="exact").execute()
    pending_reports = supabase.table("posts").select("id", count="exact").eq("status", "pending").execute()
    progress = supabase.table("user_progress").select("module_id, quiz_score, status").execute()
    modules = supabase.table("modules").select("id, title").execute()

    progress_rows = progress.data or []
    module_titles = {m["id"]: m["title"] for m in (modules.data or [])}

    stats_by_module: dict[str, list[float]] = {}
    for row in progress_rows:
        if row.get("status") == "completed":
            stats_by_module.setdefault(row["module_id"], []).append(row.get("quiz_score") or 0)

    module_completion = [
        ModuleCompletionStat(
            module_id=module_id,
            title=module_titles.get(module_id, "Unknown module"),
            completions=len(scores),
            average_score=round(sum(scores) / len(scores), 1) if scores else None,
        )
        for module_id, scores in stats_by_module.items()
    ]

    all_scores = [s for scores in stats_by_module.values() for s in scores]
    average_quiz_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else None

    return AnalyticsOverview(
        total_learners=profiles.count or 0,
        total_reports=reports.count or 0,
        pending_reports=pending_reports.count or 0,
        average_quiz_score=average_quiz_score,
        module_completion=module_completion,
    )