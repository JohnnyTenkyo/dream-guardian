import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..game import is_sunday_boss_open, now_in_tz, tz_key_of, week_key
from ..models import BossDefeat, ShopItem, User
from ..schemas import BattleResult, BossOut
from ..security import get_current_user

router = APIRouter(prefix="/api/boss", tags=["boss"])


def _load_bosses():
    manifest = Path(__file__).resolve().parents[3] / "frontend/public/items/manifest.json"
    if not manifest.exists():
        return []
    try:
        with open(manifest, "r", encoding="utf-8") as f:
            return json.load(f).get("bosses", [])
    except Exception:
        return []


def _current_boss(local_now):
    bosses = _load_bosses()
    if not bosses:
        return None
    # 20 weekly rotation by ISO week number
    iso = local_now.isocalendar()
    idx = (iso[1] - 1) % len(bosses)
    return bosses[idx]


@router.get("/current", response_model=BossOut)
def current(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    boss = _current_boss(now)
    if not boss:
        raise HTTPException(500, "Boss 数据未初始化")
    wk = week_key(now)
    already = session.exec(
        select(BossDefeat).where(BossDefeat.user_id == user.id, BossDefeat.week_key == wk)
    ).first()
    return BossOut(
        slug=boss["slug"],
        name=boss["name"],
        hp=boss["hp"],
        image=boss["image"],
        defeated_this_week=already is not None,
    )


@router.post("/battle", response_model=BattleResult)
def battle(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tz_key = tz_key_of(user.timezone)
    now = now_in_tz(tz_key)
    if not is_sunday_boss_open(now):
        raise HTTPException(400, "Boss 战仅周日 12:00 后开放")
    boss = _current_boss(now)
    if not boss:
        raise HTTPException(500, "Boss 数据未初始化")
    wk = week_key(now)
    already = session.exec(
        select(BossDefeat).where(BossDefeat.user_id == user.id, BossDefeat.week_key == wk)
    ).first()
    if already:
        return BattleResult(
            victory=True, boss=boss["name"], gem_atk=0, boss_hp=boss["hp"],
            coins_awarded=0, already_defeated=True,
        )
    gem_atk = 0
    if user.equipped_gem:
        gem = session.exec(select(ShopItem).where(ShopItem.slug == user.equipped_gem)).first()
        if gem:
            gem_atk = gem.atk
    victory = gem_atk >= boss["hp"]
    coins = 0
    if victory:
        coins = boss["hp"] * 5 + 20
        user.coins += coins
        session.add(user)
        rec = BossDefeat(user_id=user.id, boss_slug=boss["slug"], week_key=wk, coins_awarded=coins)
        session.add(rec)
        session.commit()
    return BattleResult(
        victory=victory, boss=boss["name"], gem_atk=gem_atk, boss_hp=boss["hp"],
        coins_awarded=coins,
    )
