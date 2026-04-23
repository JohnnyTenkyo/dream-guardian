from typing import Optional

from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=4, max_length=64)
    nickname: Optional[str] = None
    gender: Optional[str] = "other"


class LoginIn(BaseModel):
    username: str
    password: str


class ChangePasswordIn(BaseModel):
    old_password: str
    new_password: str = Field(min_length=4, max_length=64)


class UpdateProfileIn(BaseModel):
    nickname: Optional[str] = None
    title: Optional[str] = None
    timezone: Optional[str] = None
    active_character: Optional[str] = None
    active_activity: Optional[str] = None
    mood: Optional[str] = None
    equipped_gem: Optional[str] = None
    equipped_frame: Optional[str] = None
    gender: Optional[str] = None


class TokenOut(BaseModel):
    token: str
    is_admin: bool = False


class StatusOut(BaseModel):
    tz_key: str
    timezone_name: str
    local_time: str
    energy: int
    sleep_button: bool
    boss_open: bool


class UserOut(BaseModel):
    id: int
    username: str
    nickname: str
    title: str
    coins: int
    streak: int
    active_character: str
    active_activity: str
    mood: str
    equipped_gem: Optional[str]
    equipped_frame: Optional[str]
    timezone: str
    gender: str


class CheckInOut(BaseModel):
    energy: int
    coins_delta: int
    new_coins: int
    new_streak: int
    date: str
    time: str


class SleepStartOut(BaseModel):
    session_id: int
    start_at: str


class SleepEndOut(BaseModel):
    energy_restored_pct: int
    earnings_ratio_pct: int
    duration_min: int


class PeriodIn(BaseModel):
    date: str  # YYYY-MM-DD
    kind: str  # start | end


class ShopItemOut(BaseModel):
    slug: str
    name: str
    type: str
    price: int
    atk: int
    image: str
    enabled: bool


class AdminShopItemIn(BaseModel):
    slug: str
    name: str
    type: str
    price: int
    atk: int = 0
    image: str = ""
    enabled: bool = True


class BossOut(BaseModel):
    slug: str
    name: str
    hp: int
    image: str
    defeated_this_week: bool


class BattleResult(BaseModel):
    victory: bool
    boss: str
    gem_atk: int
    boss_hp: int
    coins_awarded: int
    already_defeated: bool = False
