"""Pydantic models: define the shape of data going in and out of the API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ReportStatus = Literal["pending", "approved", "rejected"]


class ReportCreate(BaseModel):
    description: str = Field(min_length=10, max_length=2000)
    location: str | None = None
    issues: list[str] = Field(default_factory=list)
    image_url: str | None = None
    is_anonymous: bool = True


class ReportOut(BaseModel):
    id: str
    author_id: str | None
    display_name: str
    description: str
    location: str | None
    issues: list[str]
    image_url: str | None
    status: ReportStatus
    created_at: datetime


class ModerationDecision(BaseModel):
    status: Literal["approved", "rejected"]
    reason: str | None = None


class QuizAnswer(BaseModel):
    question_id: str
    selected_index: int


class QuizSubmission(BaseModel):
    answers: list[QuizAnswer]


class QuizResult(BaseModel):
    module_id: str
    score_percent: float
    correct_count: int
    total_questions: int
    passed: bool
    recommended_next_module_id: str | None = None


class ModuleCompletionStat(BaseModel):
    module_id: str
    title: str
    completions: int
    average_score: float | None


class AnalyticsOverview(BaseModel):
    total_learners: int
    total_reports: int
    pending_reports: int
    average_quiz_score: float | None
    module_completion: list[ModuleCompletionStat]