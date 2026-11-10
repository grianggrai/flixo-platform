from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field

from app.auth import CurrentUser, require_roles
from app.db import rest_request, rpc_request

router = APIRouter(prefix="/admin", tags=["admin"])


class ReviewDecision(BaseModel):
    decision: str = Field(pattern="^(approved|rejected|revision)$")
    reason: str | None = Field(default=None, max_length=3000)


@router.get("/reviews")
async def review_queue(
    _user: CurrentUser = Depends(require_roles("editor", "admin")),
    authorization: str = Header(...),
):
    token = authorization.split(" ", 1)[1]
    items = await rest_request(
        "GET", "series", access_token=token,
        params={"select": "id,title,slug,synopsis,genre,status,rights_verified,created_at,creator_id",
                "status": "eq.pending", "order": "created_at.asc"},
    )
    return {"items": items or []}


@router.post("/reviews/{series_id}")
async def review_series(
    series_id: str,
    body: ReviewDecision,
    _user: CurrentUser = Depends(require_roles("editor", "admin")),
    authorization: str = Header(...),
):
    token = authorization.split(" ", 1)[1]
    result = await rpc_request(
        "review_flixo_series", access_token=token,
        payload={"p_series_id": series_id, "p_decision": body.decision, "p_reason": body.reason},
    )
    return result
