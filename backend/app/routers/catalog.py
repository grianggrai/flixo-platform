from fastapi import APIRouter, HTTPException
import httpx
from app.db import get_supabase_config

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/series")
async def list_series():
    base_url, api_key = get_supabase_config()
    headers = {"apikey": api_key, "Authorization": f"Bearer {api_key}"}
    params = {
        "select": "id,title,slug,synopsis,genre,poster_path,created_at,episodes(id,episode_number,title,duration_seconds,is_free,coin_price)",
        "status": "eq.published",
        "rights_verified": "eq.true",
        "order": "created_at.desc",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{base_url}/rest/v1/series", headers=headers, params=params)
            response.raise_for_status()
        return {"items": response.json(), "source": "supabase"}
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Catalog service is temporarily unavailable.")


@router.get("/series/{slug}")
async def get_series(slug: str):
    base_url, api_key = get_supabase_config()
    headers = {"apikey": api_key, "Authorization": f"Bearer {api_key}"}
    params = {
        "select": "id,title,slug,synopsis,genre,poster_path,created_at,episodes(id,episode_number,title,duration_seconds,is_free,coin_price)",
        "slug": f"eq.{slug}",
        "status": "eq.published",
        "rights_verified": "eq.true",
        "limit": "1",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{base_url}/rest/v1/series", headers=headers, params=params)
            response.raise_for_status()
            items = response.json()
        if not items:
            raise HTTPException(status_code=404, detail="Series not found.")
        return items[0]
    except HTTPException:
        raise
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Catalog service is temporarily unavailable.")
