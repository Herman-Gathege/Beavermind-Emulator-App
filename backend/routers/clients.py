from ..database import get_db
from ..models import Client
from ..schemas import Client as ClientSchema

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("", response_model=ClientSchema)
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
