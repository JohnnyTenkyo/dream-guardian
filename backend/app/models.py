from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=32)
    password_hash: str
    nickname: str = Field(default="", max_length=32)
    title: str = Field(default="新手守护者", max_length=32)
    coins: int = Field(default=0)
    streak: int = Field(default=0)
    last_checkin_date: Optional[str] = Field(default=None)  # YYYY-MM-DD in the user-selected timezone
    timezone: str = Field(default="Asia/Shanghai")
    active_character: str = Field(default="snoopy")
    active_activity: str = Field(default="walk")
    mood: str = Field(default="happy")
    equipped_gem: Optional[str] = Field(default=None)
    equipped_frame: Optional[str] = Field(default=None)
    gender: str = Field(default="other")  # for menstrual calendar visibility
    created_at: datetime = Field(default_factory=utc_now)


class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    item_slug: str = Field(index=True, max_length=64)
    item_type: str = Field(max_length=16)  # gem | frame | character | other
    qty: int = Field(default=1)
    created_at: datetime = Field(default_factory=utc_now)


class ShopItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True, max_length=64)
    name: str
    type: str = Field(max_length=16)  # gem | frame
    price: int = Field(default=10)
    atk: int = Field(default=0)
    image: str = Field(default="")
    enabled: bool = Field(default=True)


class CheckIn(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    date: str = Field(index=True, max_length=10)  # YYYY-MM-DD in user timezone
    check_time: str = Field(max_length=5)  # HH:MM sleep time in user timezone
    energy: int  # energy at checkin time (can be negative)
    coins_delta: int
    tz: str
    created_at: datetime = Field(default_factory=utc_now)


class SleepSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    start_at: datetime
    end_at: Optional[datetime] = None
    duration_min: Optional[int] = None


class PeriodEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    date: str = Field(max_length=10)  # YYYY-MM-DD
    kind: str = Field(max_length=8)  # start | end


class BossDefeat(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    boss_slug: str = Field(max_length=64)
    week_key: str = Field(max_length=10, index=True)  # YYYY-Www
    coins_awarded: int
    created_at: datetime = Field(default_factory=utc_now)
