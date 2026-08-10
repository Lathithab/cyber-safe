"""
Incident reports / community feed moderation.

Any logged-in user can submit a report. Reports start as "pending" and
are NOT shown in the public feed yet. An admin/teacher must review and
approve a report before it appears, or reject it if it's spam/misleading.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from database import get_supabase
from deps import CurrentUser, get_current_user, require_role
from schemas import ModerationDecision, ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreate, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()

    row = {
        "author_id": None if payload.is_anonymous else user.id,
        "display_name": "Anonymous" if payload.is_anonymous else (user.email or "Learner"),
        "description": payload.description,
        "location": payload.location,
        "issues": payload.issues,
        "image_url": payload.image_url,
        "status": "pending",
    }

    result = supabase.table("posts").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not save report")

    return result.data[0]


@router.get("/mine", response_model=list[ReportOut])
def list_my_reports(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/pending", response_model=list[ReportOut])
def list_pending_reports(user: CurrentUser = Depends(require_role("admin", "teacher"))):
    supabase = get_supabase()
    result = (
        supabase.table("posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.patch("/{report_id}/moderate", response_model=ReportOut)
def moderate_report(
    report_id: str,
    decision: ModerationDecision,
    user: CurrentUser = Depends(require_role("admin", "teacher")),
):
    supabase = get_supabase()
    result = (
        supabase.table("posts")
        .update({"status": decision.status})
        .eq("id", report_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return result.data[0]