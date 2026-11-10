import os
from typing import Callable
from uuid import UUID

import httpx
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel


class CurrentUser(BaseModel):
    id: str
    email: str | None = None
    role: str
    status: str


def _supabase_config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured.",
        )
    return url, key


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required.")

    access_token = authorization.split(" ", 1)[1].strip()
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required.")

    base_url, api_key = _supabase_config()
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            auth_response = await client.get(f"{base_url}/auth/v1/user", headers=headers)
            if auth_response.status_code in (401, 403):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")
            auth_response.raise_for_status()
            auth_user = auth_response.json()
            user_id = str(UUID(auth_user["id"]))

            profile_response = await client.get(
                f"{base_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}", "select": "role,status"},
                headers={**headers, "Accept": "application/vnd.pgrst.object+json"},
            )
            if profile_response.status_code in (401, 403):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profile access denied.")
            if profile_response.status_code == 406:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active profile not found.")
            profile_response.raise_for_status()
            profile = profile_response.json()
    except HTTPException:
        raise
    except (httpx.HTTPError, KeyError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication provider unavailable.")

    user_status = profile.get("status")
    if user_status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or inactive.")

    role = profile.get("role")
    if role not in {"viewer", "creator", "editor", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account role is invalid.")

    return CurrentUser(id=user_id, email=auth_user.get("email"), role=role, status=user_status)


def require_roles(*allowed_roles: str) -> Callable:
    async def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role.")
        return user
    return dependency
