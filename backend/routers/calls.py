from ..database import get_db
from ..models import Call, CallType, CallStatus, Coach, Client, Program
from ..schemas import Call as CallSchema

router = APIRouter(prefix="/calls", tags=["calls"])

@router.get("", response_model=CallSchema)
def list_calls(
    coach_id: Optional[str] = Query(None),
    client_id: Optional[str] = Query(None),
    program_id: Optional[str] = Query(None),
    type: Optional[CallType] = Query(None),
    db: Session = Depends(get_db)
):
    stmt = select(Call)
    if coach_id:
        stmt = stmt.where(Call.coach_id == coach_id)
    if client_id:
        stmt = stmt.where(Call.client_id == client_id)
    if program_id:
        stmt = stmt.where(Call.program_id == program_id)
    if type:
        stmt = stmt.where(Call.type == type)
    return db.execute(stmt).scalars().all()

@router.get("/{call_id}", response_model=CallSchema)
def get_call(call_id: str, db: Session = Depends(get_db)):
    call = db.get(Call, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call
