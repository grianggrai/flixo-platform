from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/wallet", tags=["wallet"])

class UnlockRequest(BaseModel):
    episode_id: str
    idempotency_key: str = Field(min_length=8, max_length=128)

@router.get("")
def wallet_status():
    raise HTTPException(status_code=501, detail="Wallet is disabled until Supabase Auth and ledger integration are configured.")

@router.post("/unlock")
def unlock_episode(_request: UnlockRequest):
    # Deliberately fail closed: no demo balance mutation or real-money operation.
    raise HTTPException(status_code=501, detail="Episode unlock is disabled until authenticated transactional ledger is implemented.")
