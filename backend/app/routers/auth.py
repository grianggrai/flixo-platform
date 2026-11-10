from fastapi import APIRouter, Depends
from app.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=CurrentUser)
async def me(user: CurrentUser = Depends(get_current_user)):
    return user
