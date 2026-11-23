from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.student import StudentMetricModel
from app.schemas.inference import StudentInferenceInput, DropoutRiskPrediction
from app.services.pytorch_engine import inference_engine

router = APIRouter(prefix="/inference", tags=["Inferencia PyTorch MTL"])


@router.post("/dropout-risk", response_model=DropoutRiskPrediction)
async def predict_dropout_risk(
    payload: StudentInferenceInput,
    db: AsyncSession = Depends(get_db)
):
    """
    Ejecuta la inferencia de la Cabeza C (Dropout Risk) de la red neuronal multitarea.
    Calcula probabilidad de deserción calibrada y persiste la métrica actualizada.
    """
    try:
        prediction = inference_engine.predict_dropout_risk(payload)

        # Actualizar o insertar en la tabla student_metrics
        query = select(StudentMetricModel).where(StudentMetricModel.student_id == payload.student_id)
        result = await db.execute(query)
        student_record = result.scalar_one_or_none()

        if student_record:
            student_record.dropout_risk_score = prediction.probability
            student_record.risk_level = prediction.risk_level
            student_record.sessions_14d = payload.sessions_14d
            student_record.late_submissions_30d = payload.late_submissions_30d
            student_record.unexcused_absences = payload.unexcused_absences
            student_record.current_score = payload.avg_quiz_score
        else:
            new_record = StudentMetricModel(
                student_id=payload.student_id,
                name=f"Estudiante {payload.student_id}",
                course="Modelado Secuencial con GRU & LSTM",
                cohort="2026-II",
                current_score=payload.avg_quiz_score,
                sessions_14d=payload.sessions_14d,
                late_submissions_30d=payload.late_submissions_30d,
                unexcused_absences=payload.unexcused_absences,
                dropout_risk_score=prediction.probability,
                risk_level=prediction.risk_level
            )
            db.add(new_record)

        await db.commit()
        return prediction

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en inferencia PyTorch: {str(e)}")
