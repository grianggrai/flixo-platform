from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.auth import CurrentUser, require_roles
from app.db import rest_request, rpc_request

router = APIRouter(prefix="/creator", tags=["creator"])


class SeriesSubmission(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=3, max_length=180, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    synopsis: str = Field(min_length=20, max_length=5000)
    genre: str = Field(min_length=2, max_length=80)
    rights_declaration: bool

    @field_validator("title", "synopsis", "genre")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()


@router.get("/series")
async def my_series(
    user: CurrentUser = Depends(require_roles("creator")),
    authorization: str = Header(...),
):
    token = authorization.split(" ", 1)[1]
    items = await rest_request(
        "GET", "series", access_token=token,
        params={"select": "id,title,slug,synopsis,genre,status,created_at",
                "creator_id": f"eq.{user.id}", "order": "created_at.desc"},
    )
    return {"items": items or []}


@router.post("/series", status_code=201)
async def submit_series(
    body: SeriesSubmission,
    user: CurrentUser = Depends(require_roles("creator")),
    authorization: str = Header(...),
):
    if not body.rights_declaration:
        raise HTTPException(status_code=400, detail="Rights declaration is required.")
    token = authorization.split(" ", 1)[1]
    result = await rpc_request(
        "submit_flixo_series", access_token=token,
        payload={"p_title": body.title, "p_slug": body.slug,
                 "p_synopsis": body.synopsis, "p_genre": body.genre},
    )
    return {"id": result, "status": "pending", "message": "Series submitted for editorial review."}
