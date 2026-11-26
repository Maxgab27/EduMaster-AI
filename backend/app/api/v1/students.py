import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete

from app.core.database import get_db
from app.models.student import StudentMetricModel
from app.schemas.inference import StudentInferenceInput
from app.services.pytorch_engine import inference_engine

router = APIRouter(prefix="/students", tags=["Gestión de Estudiantes & Riesgo"])


class BatchStudentInput(BaseModel):
    student_id: str
    name: str
    course: str = "Modelado Secuencial con GRU & LSTM"
    cohort: str = "2026-II"
    unexcused_absences: int = Field(default=0, ge=0)
    late_submissions_30d: int = Field(default=0, ge=0)
    sessions_14d: int = Field(default=8, ge=0)
    avg_quiz_score: float = Field(default=14.0, ge=0.0, le=20.0)
    hours_active_weekly: float = Field(default=6.0, ge=0.0)


class BatchImportRequest(BaseModel):
    cohort: str = "2026-II"
    students: List[BatchStudentInput]


SAMPLE_COHORT_20 = [
    {"student_id": "std-001", "name": "Mateo Vargas Ramos", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 5, "late_submissions_30d": 4, "sessions_14d": 2, "avg_quiz_score": 9.5, "hours_active_weekly": 2.0},
    {"student_id": "std-002", "name": "Elena Paredes Silva", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 6, "late_submissions_30d": 3, "sessions_14d": 1, "avg_quiz_score": 8.0, "hours_active_weekly": 1.5},
    {"student_id": "std-003", "name": "Carlos Mendoza Quispe", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 4, "late_submissions_30d": 3, "sessions_14d": 3, "avg_quiz_score": 10.5, "hours_active_weekly": 3.0},
    {"student_id": "std-004", "name": "Diego Huamán Castro", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 5, "late_submissions_30d": 5, "sessions_14d": 2, "avg_quiz_score": 7.5, "hours_active_weekly": 1.8},
    {"student_id": "std-005", "name": "Lucía Benítez Flores", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 4, "late_submissions_30d": 4, "sessions_14d": 3, "avg_quiz_score": 11.0, "hours_active_weekly": 2.5},
    {"student_id": "std-006", "name": "Valeria Quispe Morales", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 2, "late_submissions_30d": 2, "sessions_14d": 4, "avg_quiz_score": 11.8, "hours_active_weekly": 4.5},
    {"student_id": "std-007", "name": "Jorge Alarcón Ríos", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 3, "late_submissions_30d": 2, "sessions_14d": 5, "avg_quiz_score": 12.0, "hours_active_weekly": 5.0},
    {"student_id": "std-008", "name": "Camila Torres Salazar", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 2, "late_submissions_30d": 1, "sessions_14d": 6, "avg_quiz_score": 12.5, "hours_active_weekly": 5.5},
    {"student_id": "std-009", "name": "Gabriel Espinoza Vega", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 3, "late_submissions_30d": 1, "sessions_14d": 4, "avg_quiz_score": 13.0, "hours_active_weekly": 4.0},
    {"student_id": "std-010", "name": "Andrea Chávez Rojas", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 2, "late_submissions_30d": 3, "sessions_14d": 5, "avg_quiz_score": 11.5, "hours_active_weekly": 4.8},
    {"student_id": "std-011", "name": "Rodrigo Navarro Paz", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 2, "late_submissions_30d": 2, "sessions_14d": 6, "avg_quiz_score": 13.2, "hours_active_weekly": 5.2},
    {"student_id": "std-012", "name": "Natalia Fuentes Cruz", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 3, "late_submissions_30d": 2, "sessions_14d": 4, "avg_quiz_score": 12.2, "hours_active_weekly": 4.2},
    {"student_id": "std-013", "name": "Sofía Ramírez Vargas", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 0, "late_submissions_30d": 0, "sessions_14d": 15, "avg_quiz_score": 18.5, "hours_active_weekly": 10.0},
    {"student_id": "std-014", "name": "Álvaro Benítez Silva", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 0, "late_submissions_30d": 0, "sessions_14d": 14, "avg_quiz_score": 17.5, "hours_active_weekly": 9.5},
    {"student_id": "std-015", "name": "Martín Cárdenas Gil", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 1, "late_submissions_30d": 0, "sessions_14d": 12, "avg_quiz_score": 16.0, "hours_active_weekly": 8.0},
    {"student_id": "std-016", "name": "Claudia Miranda Solís", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 0, "late_submissions_30d": 1, "sessions_14d": 11, "avg_quiz_score": 15.5, "hours_active_weekly": 7.5},
    {"student_id": "std-017", "name": "Fernando Vidal Lozano", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 1, "late_submissions_30d": 0, "sessions_14d": 13, "avg_quiz_score": 16.5, "hours_active_weekly": 8.5},
    {"student_id": "std-018", "name": "Patricia Guerrero Meza", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 0, "late_submissions_30d": 0, "sessions_14d": 16, "avg_quiz_score": 19.0, "hours_active_weekly": 11.0},
    {"student_id": "std-019", "name": "Kevin Romero Soto", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 1, "late_submissions_30d": 1, "sessions_14d": 10, "avg_quiz_score": 14.8, "hours_active_weekly": 7.0},
    {"student_id": "std-020", "name": "Diana Cáceres Peña", "course": "Modelado Secuencial con GRU & LSTM", "cohort": "2026-II", "unexcused_absences": 0, "late_submissions_30d": 0, "sessions_14d": 18, "avg_quiz_score": 19.5, "hours_active_weekly": 12.0},
]


async def seed_cohort_students(db: AsyncSession, cohort: str = "2026-II"):
    """Inserta la cohorte de 20 estudiantes evaluando en tiempo real con la red neuronal."""
    for s in SAMPLE_COHORT_20:
        pred = inference_engine.predict_dropout_risk(StudentInferenceInput(
            student_id=s["student_id"],
            sessions_14d=s["sessions_14d"],
            late_submissions_30d=s["late_submissions_30d"],
            unexcused_absences=s["unexcused_absences"],
            avg_quiz_score=s["avg_quiz_score"],
            hours_active_weekly=s["hours_active_weekly"]
        ))
        record = StudentMetricModel(
            student_id=s["student_id"],
            name=s["name"],
            course=s["course"],
            cohort=cohort,
            current_score=s["avg_quiz_score"],
            sessions_14d=s["sessions_14d"],
            late_submissions_30d=s["late_submissions_30d"],
            unexcused_absences=s["unexcused_absences"],
            dropout_risk_score=pred.probability,
            risk_level=pred.risk_level
        )
        db.add(record)
    await db.commit()


@router.get("/at-risk")
async def get_at_risk_students(
    cohort: str = "2026-II",
    db: AsyncSession = Depends(get_db)
):
    """Retorna los estudiantes de la cohorte ordenados por probabilidad de abandono descendente."""
    query = (
        select(StudentMetricModel)
        .where(StudentMetricModel.cohort == cohort)
        .order_by(desc(StudentMetricModel.dropout_risk_score))
    )
    result = await db.execute(query)
    students = result.scalars().all()

    # Si la base de datos está vacía, sembrar la cohorte completa de 20 estudiantes
    if not students:
        await seed_cohort_students(db, cohort)
        result = await db.execute(query)
        students = result.scalars().all()

    return [
        {
            "student_id": s.student_id,
            "name": s.name,
            "course": s.course,
            "cohort": s.cohort,
            "current_score": s.current_score,
            "sessions_14d": s.sessions_14d,
            "late_submissions_30d": s.late_submissions_30d,
            "unexcused_absences": s.unexcused_absences,
            "dropout_risk_score": s.dropout_risk_score,
            "risk_level": s.risk_level,
            "last_evaluated_at": s.last_evaluated_at.isoformat()
        }
        for s in students
    ]


@router.post("/batch-inference")
async def batch_inference_students(
    payload: BatchImportRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Importa y evalúa en lote un dataset de estudiantes a través del motor de Machine Learning.
    Calcula probabilidades de abandono y clasifica en tiempo real.
    """
    start_time = time.perf_counter()
    evaluated_list = []
    critical_count = 0
    moderate_count = 0
    low_count = 0

    try:
        for item in payload.students:
            pred = inference_engine.predict_dropout_risk(StudentInferenceInput(
                student_id=item.student_id,
                sessions_14d=item.sessions_14d,
                late_submissions_30d=item.late_submissions_30d,
                unexcused_absences=item.unexcused_absences,
                avg_quiz_score=item.avg_quiz_score,
                hours_active_weekly=item.hours_active_weekly
            ))

            if pred.risk_level == "Crítico":
                critical_count += 1
            elif pred.risk_level == "Moderado":
                moderate_count += 1
            else:
                low_count += 1

            # Actualizar o insertar en BD
            query = select(StudentMetricModel).where(StudentMetricModel.student_id == item.student_id)
            res = await db.execute(query)
            record = res.scalar_one_or_none()

            if record:
                record.dropout_risk_score = pred.probability
                record.risk_level = pred.risk_level
                record.current_score = item.avg_quiz_score
                record.sessions_14d = item.sessions_14d
                record.late_submissions_30d = item.late_submissions_30d
                record.unexcused_absences = item.unexcused_absences
            else:
                new_rec = StudentMetricModel(
                    student_id=item.student_id,
                    name=item.name,
                    course=item.course,
                    cohort=payload.cohort,
                    current_score=item.avg_quiz_score,
                    sessions_14d=item.sessions_14d,
                    late_submissions_30d=item.late_submissions_30d,
                    unexcused_absences=item.unexcused_absences,
                    dropout_risk_score=pred.probability,
                    risk_level=pred.risk_level
                )
                db.add(new_rec)

            evaluated_list.append({
                "student_id": item.student_id,
                "name": item.name,
                "course": item.course,
                "current_score": item.avg_quiz_score,
                "sessions_14d": item.sessions_14d,
                "late_submissions_30d": item.late_submissions_30d,
                "unexcused_absences": item.unexcused_absences,
                "dropout_risk_score": pred.probability,
                "risk_level": pred.risk_level,
                "dominant_factors": pred.dominant_factors,
                "suggested_action": pred.recommended_pedagogical_action,
                "brier_score": pred.calibrated_brier_score
            })

        await db.commit()
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Ordenar por riesgo descendente
        evaluated_list.sort(key=lambda x: x["dropout_risk_score"], reverse=True)

        return {
            "status": "success",
            "total_processed": len(evaluated_list),
            "inference_time_ms": elapsed_ms,
            "critical_count": critical_count,
            "moderate_count": moderate_count,
            "low_count": low_count,
            "students": evaluated_list
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en inferencia batch: {str(e)}")


@router.post("/reset-demo-cohort")
async def reset_demo_cohort(
    cohort: str = "2026-II",
    db: AsyncSession = Depends(get_db)
):
    """Restablece la cohorte DEMO a los 20 estudiantes de prueba con inferencia limpia."""
    await db.execute(delete(StudentMetricModel).where(StudentMetricModel.cohort == cohort))
    await seed_cohort_students(db, cohort)
    return {"status": "ok", "message": f"Cohorte {cohort} restablecida con 20 estudiantes evaluados."}

