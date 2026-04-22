from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from ..db import get_session
from ..game import TIMEZONES, energy_at, is_sunday_boss_open, now_in_tz, sleep_button_available, tz_key_of
from ..models import User
from ..schemas import StatusOut, UpdateProfileIn, UserOut
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["profile"])


@router.get("/status", response_model=StatusOut)
def get_status(user: User = Depends(get_current_user)):
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    return StatusOut(
        tz_key=tz_key,
        timezone_name=TIMEZONES[tz_key][1],
        local_time=now.isoformat(),
        energy=energy_at(now),
        sleep_button=sleep_button_available(now),
        boss_open=is_sunday_boss_open(now),
    )


@router.patch("/profile", response_model=UserOut)
def update_profile(
    data: UpdateProfileIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if data.timezone is not None:
        if data.timezone not in [tz for (tz, _) in TIMEZONES.values()]:
            raise HTTPException(400, "不支持的时区")
        user.timezone = data.timezone
    for field in [
        "nickname", "title", "active_character", "active_activity",
        "mood", "equipped_gem", "equipped_frame", "gender",
    ]:
        v = getattr(data, field)
        if v is not None:
            setattr(user, field, v)
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserOut(
        id=user.id,
        username=user.username,
        nickname=user.nickname,
        title=user.title,
        coins=user.coins,
        streak=user.streak,
        active_character=user.active_character,
        active_activity=user.active_activity,
        mood=user.mood,
        equipped_gem=user.equipped_gem,
        equipped_frame=user.equipped_frame,
        timezone=user.timezone,
        gender=user.gender,
    )
