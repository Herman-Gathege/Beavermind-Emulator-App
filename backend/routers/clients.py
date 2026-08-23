from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from database import get_db
from sql_models import Client, Program, Call
from schemas import Client as ClientSchema, ClientBase

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("", response_model=List[ClientSchema])
def list_clients(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Client)
    if search:
        stmt = stmt.where(Client.name.ilike(f"%{search}%"))
    return db.execute(stmt).scalars().all()

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=ClientSchema)
def create_client(payload: ClientBase, db: Session = Depends(get_db)):
    client = Client(name=payload.name, organization=payload.organization)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(client_id: str, payload: ClientBase, db: Session = Depends(get_db)):
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.name = payload.name
    client.organization = payload.organization
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    program_count = db.execute(select(Program).where(Program.client_id == client_id)).scalars().first()
    if program_count:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing programs. Remove associated programs first.")
    call_count = db.execute(select(Call).where(Call.client_id == client_id)).scalars().first()
    if call_count:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing calls. Remove associated calls first.")
    db.delete(client)
    db.commit()
    return {"ok": True}
