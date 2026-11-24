import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.health import router as health_router
from app.api.v1.inference import router as inference_router
from app.api.v1.grades import router as grades_router
from app.api.v1.audit import router as audit_router
from app.api.v1.students import router as students_router
from app.api.v1.compat import router as compat_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("edumaster.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando API EduMaster.ai (modo DEMO)...")
    try:
        await init_db()
        logger.info("Tablas y esquemas de base de datos verificados exitosamente.")
    except Exception as e:
        logger.error(f"Error inicializando base de datos: {e}")
    yield
    logger.info("Apagando API EduMaster.ai.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API del caso de uso EduMaster.ai: Detección de Riesgo de Abandono "
        "(motor NumPy/Torch según disponibilidad) e Intervención Formativa Docente "
        "(SpeedGrader con firma SHA-256 y auditoría). "
        "Demostración académica con datos sintéticos, sin autenticación real."
    ),
    lifespan=lifespan
)

# Configuración de CORS para enlaces seguros con Vercel y localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    # Incluye orígenes de la red local (192.168.x.x, 10.x.x.x y 172.16-31.x.x)
    # para probar el QR de certificados desde un celular en la misma Wi-Fi.
    allow_origin_regex=(
        r"(https://.*\.vercel\.app|"
        r"https://.*\.railway\.app|"
        r"https://.*\.up\.railway\.app|"
        r"http://(localhost|127\.0\.0\.1|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):(5173|4173))"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(health_router)
app.include_router(inference_router, prefix=settings.API_V1_STR)
app.include_router(grades_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(compat_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "DEMO",
        "docs": "/docs",
        "health": "/health",
        "case_of_use": "Detección de Abandono Estudiantil & SpeedGrader Docente (Ley 29733)"
    }
