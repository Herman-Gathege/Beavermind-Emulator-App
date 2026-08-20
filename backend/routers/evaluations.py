from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from ..database import get_db
from ..models import Call, CallStatus, Evaluation, DimensionScore
from ..schemas import Evaluation as EvaluationSchema
from services.ai_evaluator import run_evaluation

router = APIRouter(prefix="/evaluations", tags=["evaluations"])

@router.post("", response_model=EvaluationSchema)
def create_evaluation(call_id: str, db: Session = Depends(get_db)):
    call = db.get(Call, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    if call.status == CallStatus.evaluated:
        existing = db.execute(select(Evaluation).where(Evaluation.call_id == call_id)).scalar_one_or_none()
        if existing:
            return existing

    result = run_evaluation(call.transcript or "")
    evaluation = Evaluation(
        call_id=call_id,
        overall_score=result["overall_score"],
        summary=result["summary"],
        raw_response=str(result["dimensions"])
    )
    db.add(evaluation)
    db.flush()
    for dim in result["dimensions"]:
        score = DimensionScore(
            evaluation_id=evaluation.id,
            dimension=dim["dimension"],
            score=dim["score"],
            feedback=dim["feedback"],
            evidence=dim.get("evidence")
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
