import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.health import router as health_router
from app.api.v1.inference import router as inference_router
from app.api.v1.grades import router as grades_router
from app.api.v1.audit import router as audit_router
from app.api.v1.students import router as students_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("edumaster.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando motor EduMaster.ai Enterprise API...")
    try:
        await init_db()
        logger.info("Tablas y esquemas de base de datos verificados exitosamente.")
    except Exception as e:
        logger.error(f"Error inicializando base de datos: {e}")
    yield
    logger.info("Apagando motor EduMaster.ai Enterprise API.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API oficial de EduMaster.ai Enterprise para el Caso de Uso: "
        "Detección Temprana de Riesgo de Abandono (PyTorch MTL) e Intervención "
        "Formativa Docente (SpeedGrader Human-in-the-Loop & Ley 29733)."
    ),
    lifespan=lifespan
)

# Configuración de CORS para enlaces seguros con Vercel y localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
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


@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "case_of_use": "Detección de Abandono Estudiantil & SpeedGrader Docente (Ley 29733)"
    }
