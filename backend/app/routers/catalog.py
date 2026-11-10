from fastapi import APIRouter
router = APIRouter(prefix="/catalog", tags=["catalog"])

SAMPLE = [
    {"slug": "rak-rai-ceo", "title": "รักร้าย CEO", "genre": "Romance · Drama", "episodes": 24, "status": "sample"},
    {"slug": "ngaow-krachok", "title": "เงากระจก", "genre": "Thriller · Mystery", "episodes": 16, "status": "sample"},
]

@router.get("/series")
def list_series():
    # Replace with a Supabase query that filters status='published' before launch.
    return {"items": SAMPLE, "source": "sample"}
