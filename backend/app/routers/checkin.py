from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..game import date_key, energy_at, now_in_tz, time_key, tz_key_of
from ..models import CheckIn, SleepSession, User
from ..schemas import CheckInOut, SleepEndOut, SleepStartOut
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["checkin"])


@router.post("/checkin", response_model=CheckInOut)
def checkin(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    today = date_key(now)
    # Only one checkin per tz-day
    existing = session.exec(
        select(CheckIn).where(CheckIn.user_id == user.id, CheckIn.date == today)
    ).first()
    if existing:
        raise HTTPException(400, "今天已打卡")
    energy = energy_at(now)
    coins_delta = energy  # 1:1, can be negative
    # Streak: +1 if yesterday checked, else reset to 1
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    if user.last_checkin_date == yesterday:
        user.streak += 1
    else:
        user.streak = 1
    user.last_checkin_date = today
    user.coins = max(0, user.coins + coins_delta)
    rec = CheckIn(
        user_id=user.id,
        date=today,
        check_time=time_key(now),
        energy=energy,
        coins_delta=coins_delta,
        tz=user.timezone,
    )
    session.add(rec)
    session.add(user)
    session.commit()
    return CheckInOut(
        energy=energy,
        coins_delta=coins_delta,
        new_coins=user.coins,
        new_streak=user.streak,
        date=today,
        time=time_key(now),
    )


@router.get("/checkins")
def list_checkins(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(CheckIn).where(CheckIn.user_id == user.id).order_by(CheckIn.date.desc()).limit(400)
    ).all()
    return [{"date": r.date, "time": r.check_time, "energy": r.energy, "coins_delta": r.coins_delta} for r in rows]


@router.post("/sleep/start", response_model=SleepStartOut)
def sleep_start(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    s = SleepSession(user_id=user.id, start_at=now)
    session.add(s)
    session.commit()
    session.refresh(s)
    return SleepStartOut(session_id=s.id, start_at=now.isoformat())


@router.post("/sleep/end/{session_id}", response_model=SleepEndOut)
def sleep_end(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    s = session.get(SleepSession, session_id)
    if not s or s.user_id != user.id:
        raise HTTPException(404, "未找到睡眠会话")
    if s.end_at:
        raise HTTPException(400, "该会话已结束")
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    delta = int((now - s.start_at.astimezone(now.tzinfo)).total_seconds() // 60)
    s.end_at = now
    s.duration_min = max(0, delta)
    full = 8 * 60
    pct = min(100, int(s.duration_min * 100 / full)) if s.duration_min < full else 100
    session.add(s)
    session.commit()
    return SleepEndOut(energy_restored_pct=pct, earnings_ratio_pct=pct, duration_min=s.duration_min)
