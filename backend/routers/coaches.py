from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from database import get_db
from sql_models import Coach, Program, Call
from schemas import Coach as CoachSchema, CoachBase

router = APIRouter(prefix="/coaches", tags=["coaches"])

@router.get("", response_model=List[CoachSchema])
def list_coaches(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Coach)
    if search:
        stmt = stmt.where(Coach.name.ilike(f"%{search}%"))
    return db.execute(stmt).scalars().all()

@router.get("/{coach_id}", response_model=CoachSchema)
def get_coach(coach_id: str, db: Session = Depends(get_db)):
    coach = db.get(Coach, coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    return coach

@router.post("", response_model=CoachSchema)
def create_coach(payload: CoachBase, db: Session = Depends(get_db)):
    coach = Coach(name=payload.name, specialty=payload.specialty, bio=payload.bio)
    db.add(coach)
    db.commit()
    db.refresh(coach)
    return coach

@router.put("/{coach_id}", response_model=CoachSchema)
def update_coach(coach_id: str, payload: CoachBase, db: Session = Depends(get_db)):
    coach = db.get(Coach, coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    coach.name = payload.name
    coach.specialty = payload.specialty
    coach.bio = payload.bio
    db.commit()
    db.refresh(coach)
    return coach

@router.delete("/{coach_id}")
def delete_coach(coach_id: str, db: Session = Depends(get_db)):
    coach = db.get(Coach, coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    program_count = db.execute(select(Program).where(Program.coach_id == coach_id)).scalars().first()
    if program_count:
        raise HTTPException(status_code=400, detail="Cannot delete coach with existing programs. Remove associated programs first.")
    call_count = db.execute(select(Call).where(Call.coach_id == coach_id)).scalars().first()
    if call_count:
        raise HTTPException(status_code=400, detail="Cannot delete coach with existing calls. Remove associated calls first.")
    db.delete(coach)
    db.commit()
    return {"ok": True}
