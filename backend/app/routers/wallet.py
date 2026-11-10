from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/wallet", tags=["wallet"])

class UnlockRequest(BaseModel):
    episode_id: str
    idempotency_key: str = Field(min_length=8, max_length=128)

@router.get("")
async def wallet_status(_user: CurrentUser = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="Wallet is disabled until atomic ledger and transaction tests are deployed.")

@router.post("/unlock")
async def unlock_episode(_request: UnlockRequest, _user: CurrentUser = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="Episode unlock is disabled until atomic ledger and entitlement checks are deployed.")
