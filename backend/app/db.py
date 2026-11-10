import os
import httpx
from fastapi import HTTPException


def get_supabase_config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Supabase is not configured.")
    return url, key


async def rest_request(
    method: str,
    path: str,
    *,
    access_token: str | None = None,
    params: dict | None = None,
    payload: dict | None = None,
):
    base_url, api_key = get_supabase_config()
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {access_token}" if access_token else f"Bearer {api_key}",
        "Accept": "application/json",
    }
    if payload is not None:
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=12.0) as client:
        response = await client.request(
            method,
            f"{base_url}/rest/v1/{path.lstrip('/')}",
            headers=headers,
            params=params,
            json=payload,
        )

    if response.status_code >= 400:
        # Do not forward raw PostgREST internals or secrets to the client.
        raise HTTPException(status_code=502, detail="Supabase data request failed.")
    return response.json() if response.content else None


async def rpc_request(name: str, *, access_token: str, payload: dict):
    return await rest_request("POST", f"rpc/{name}", access_token=access_token, payload=payload)
