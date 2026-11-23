from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.student import StudentMetricModel

router = APIRouter(prefix="/students", tags=["Gestión de Estudiantes & Riesgo"])


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

    # Si la base de datos está vacía en primer inicio, sembrar datos de cohorte
    if not students:
        sample_students = [
            StudentMetricModel(
                student_id="std-402",
                name="Carlos Mendoza Ramos",
                course="Modelado Secuencial con GRU & LSTM",
                cohort="2026-II",
                current_score=10.5,
                sessions_14d=2,
                late_submissions_30d=3,
                unexcused_absences=4,
                dropout_risk_score=0.485,
                risk_level="Crítico"
            ),
            StudentMetricModel(
                student_id="std-109",
                name="Valeria Quispe Huamán",
                course="Modelado Secuencial con GRU & LSTM",
                cohort="2026-II",
                current_score=11.2,
                sessions_14d=4,
                late_submissions_30d=2,
                unexcused_absences=2,
                dropout_risk_score=0.285,
                risk_level="Moderado"
            ),
            StudentMetricModel(
                student_id="std-088",
                name="Álvaro Benítez Silva",
                course="Modelado Secuencial con GRU & LSTM",
                cohort="2026-II",
                current_score=17.5,
                sessions_14d=14,
                late_submissions_30d=0,
                unexcused_absences=0,
                dropout_risk_score=0.042,
                risk_level="Bajo"
            )
        ]
        for s in sample_students:
            db.add(s)
        await db.commit()
        students = sample_students

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
