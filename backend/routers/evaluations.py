from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import json
import logging
from uuid import UUID
from database import get_db
from sql_models import Call, CallStatus, Evaluation, DimensionScore
from schemas import Evaluation as EvaluationSchema
from services.ai_evaluator import run_evaluation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("", response_model=List[EvaluationSchema])
def list_evaluations(call_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Evaluation)
    if call_id:
        stmt = stmt.where(Evaluation.call_id == call_id)
    return db.execute(stmt).scalars().all()


@router.post("", response_model=EvaluationSchema)
def create_evaluation(call_id: str = Query(...), db: Session = Depends(get_db)):
    try:
        call_uuid = UUID(call_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Call not found")
    
    call = db.get(Call, call_uuid)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    if call.status == CallStatus.evaluated:
        existing = db.execute(select(Evaluation).where(Evaluation.call_id == call_uuid)).scalar_one_or_none()
        if existing:
            return existing

    try:
        result = run_evaluation(call.transcript or "", call_type=call.type.value)
    except RuntimeError as exc:
        logger.error("Evaluation failed for call %s: %s", call_id, exc)
        raise HTTPException(status_code=502, detail="We couldn't evaluate this call right now. Please try again.") from exc
    except Exception as exc:
        logger.error("Unexpected evaluation error for call %s: %s", call_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="We couldn't evaluate this call right now. Please try again.") from exc

    evaluation = Evaluation(
        call_id=call_uuid,
        overall_score=result["overall_score"],
        summary=result["summary"],
        strengths=json.dumps(result.get("strengths", [])),
        improvement_areas=json.dumps(result.get("improvement_areas", [])),
        recommendations=json.dumps(result.get("recommendations", [])),
        raw_response=str(result["dimensions"]),
    )
    db.add(evaluation)
    db.flush()
    for dim in result["dimensions"]:
        score = DimensionScore(
            evaluation_id=evaluation.id,
            dimension=dim["dimension"],
            score=dim["score"],
            feedback=dim["feedback"],
            evidence=dim.get("evidence"),
        )
        db.add(score)
    call.status = CallStatus.evaluated
    db.commit()
    db.refresh(evaluation)
    return evaluation


@router.get("/{evaluation_id}", response_model=EvaluationSchema)
def get_evaluation(evaluation_id: str, db: Session = Depends(get_db)):
    evaluation = db.get(Evaluation, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation


@router.get("/call/{call_id}", response_model=EvaluationSchema)
def get_evaluation_for_call(call_id: str, db: Session = Depends(get_db)):
    evaluation = db.execute(select(Evaluation).where(Evaluation.call_id == call_id)).scalar_one_or_none()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation
