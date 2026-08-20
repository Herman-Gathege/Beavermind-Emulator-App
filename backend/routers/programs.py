from ..database import get_db
from ..models import Program, Coach, Client
from ..schemas import Program as ProgramSchema

router = APIRouter(prefix="/programs", tags=["programs"])

@router.get("", response_model=ProgramSchema)
def list_programs(coach_id: Optional[str] = Query(None), client_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Program)
    if coach_id:
        stmt = stmt.where(Program.coach_id == coach_id)
    if client_id:
        stmt = stmt.where(Program.client_id == client_id)
    return db.execute(stmt).scalars().all()

@router.get("/{program_id}", response_model=ProgramSchema)
def get_program(program_id: str, db: Session = Depends(get_db)):
    program = db.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program
