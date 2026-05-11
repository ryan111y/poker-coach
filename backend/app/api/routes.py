from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["poker"])

@router.get("/health")
async def health():
    return {"status": "ok"}
