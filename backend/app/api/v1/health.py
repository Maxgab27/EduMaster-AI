from fastapi import APIRouter

from app.core.config import settings
from app.services.pytorch_engine import HAS_TORCH

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Estado real del servicio: motor, base y modo de datos."""
    database_url = settings.DATABASE_URL.lower()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "mode": "DEMO",
        "dataset": "sintético",
        "engine": "torch" if HAS_TORCH else "numpy-fallback",
        "database": "sqlite" if "sqlite" in database_url else "postgres",
        "protocol": "HTTP/1.1",
        "note": "Demostración académica: sin datos institucionales ni autenticación real.",
    }
