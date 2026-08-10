"""
Authentication & role-based access control.

"""

from dataclasses import dataclass

import jwt
from fastapi import Depends, Header, HTTPException, status

from config import settings
from database import get_supabase


@dataclass
class CurrentUser:
    id: str
    email: str | None
    role: str


def _extract_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected: Bearer <token>",
        )
    return authorization.split(" ", 1)[1]


def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    token = _extract_token(authorization)

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user id")

    supabase = get_supabase()
    result = (
        supabase.table("profiles")
        .select("role")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    role = (result.data or {}).get("role", "learner") if result else "learner"

    return CurrentUser(id=user_id, email=payload.get("email"), role=role)


def require_role(*allowed_roles: str):
    """Use as `Depends(require_role("admin", "teacher"))` on restricted routes."""

    def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return user

    return dependency