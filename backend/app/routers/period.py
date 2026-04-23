from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..models import PeriodEvent, User
from ..schemas import PeriodIn
from ..security import get_current_user

router = APIRouter(prefix="/api/period", tags=["period"])


@router.get("")
def list_events(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    events = session.exec(
        select(PeriodEvent).where(PeriodEvent.user_id == user.id).order_by(PeriodEvent.date.asc())
    ).all()
    return [{"date": e.date, "kind": e.kind} for e in events]


@router.post("")
def set_event(
    data: PeriodIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # replace existing event on that day
    existing = session.exec(
        select(PeriodEvent).where(PeriodEvent.user_id == user.id, PeriodEvent.date == data.date)
    ).first()
    if existing:
        existing.kind = data.kind
        session.add(existing)
    else:
        session.add(PeriodEvent(user_id=user.id, date=data.date, kind=data.kind))
    session.commit()
    return {"ok": True}


@router.delete("/{date}")
def delete_event(
    date: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(PeriodEvent).where(PeriodEvent.user_id == user.id, PeriodEvent.date == date)
    ).first()
    if existing:
        session.delete(existing)
        session.commit()
    return {"ok": True}


@router.get("/cycles")
def cycles(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    events = session.exec(
        select(PeriodEvent).where(PeriodEvent.user_id == user.id).order_by(PeriodEvent.date.asc())
    ).all()
    # Pair start->end chronologically
    cycles = []
    current_start = None
    for e in events:
        if e.kind == "start":
            current_start = e.date
        elif e.kind == "end" and current_start:
            cycles.append({"start": current_start, "end": e.date})
            current_start = None
    return cycles
