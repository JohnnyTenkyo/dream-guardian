"""Game logic: energy curve, time-zone helpers, check-in math."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

TIMEZONES = {
    "beijing": ("Asia/Shanghai", "北京"),
    "us_east": ("America/New_York", "美东"),
    "japan": ("Asia/Tokyo", "日本"),
    "germany": ("Europe/Berlin", "德国"),
}


def tz_of(key: str) -> ZoneInfo:
    name = TIMEZONES.get(key, TIMEZONES["beijing"])[0]
    return ZoneInfo(name)


def tz_key_of(name: str) -> str:
    for k, (tz, _) in TIMEZONES.items():
        if tz == name:
            return k
    return "beijing"


def now_in_tz(tz_key: str) -> datetime:
    return datetime.now(tz_of(tz_key))


def energy_at(local_now: datetime) -> int:
    """Energy curve:
    07:00–24:00: 100% -> 5% linearly (drops to 5% at 24:00)
    24:00 (00:00) ->   5%
    00:30     ->   0%
    00:30–07:00:  0% -> -100% linearly
    """
    t = local_now.hour * 60 + local_now.minute + local_now.second / 60.0
    d_start = 7 * 60  # 07:00
    d_end = 24 * 60   # 24:00 (exclusive)
    if d_start <= t < d_end:
        # 100% at 7:00, 5% at 24:00
        span = d_end - d_start  # 1020 min
        pct = 100 - (100 - 5) * (t - d_start) / span
        return round(pct)
    # 24:00 onward (t = 0..7*60)
    if 0 <= t < 30:
        # 5% at 0:00 -> 0% at 0:30
        return round(5 - 5 * (t / 30))
    if 30 <= t < 7 * 60:
        # 0% at 0:30 -> -100% at 7:00
        return round(0 - 100 * (t - 30) / (7 * 60 - 30))
    return 100


@dataclass
class CheckInResult:
    checked_in: bool
    energy: int
    coins_delta: int
    new_coins: int
    new_streak: int
    date_key: str
    time_key: str


def date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def time_key(dt: datetime) -> str:
    return dt.strftime("%H:%M")


def week_key(dt: datetime) -> str:
    iso = dt.isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def sleep_button_available(local_now: datetime) -> bool:
    """21:00 – 04:00 next day."""
    h = local_now.hour
    return h >= 21 or h < 4


def wake_restore(start: datetime, end: datetime) -> tuple[int, int]:
    """Given sleep start/end (tz-aware), return (energy_percentage, earnings_ratio_pct).

    Full 8h -> 100% restore & 100% earnings kept. Less than 8h -> proportional both.
    """
    delta_min = max(0, int((end - start).total_seconds() // 60))
    full_min = 8 * 60
    if delta_min >= full_min:
        return 100, 100
    pct = int(delta_min * 100 / full_min)
    return pct, pct


def is_sunday_boss_open(local_now: datetime) -> bool:
    # Sunday (Monday=0 ... Sunday=6) at 12:00+
    return local_now.weekday() == 6 and local_now.hour >= 12
