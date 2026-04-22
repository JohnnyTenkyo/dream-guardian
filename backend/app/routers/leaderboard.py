from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..models import ShopItem, User

router = APIRouter(prefix="/api", tags=["leaderboard"])


@router.get("/leaderboard")
def leaderboard(session: Session = Depends(get_session)):
    rows = session.exec(select(User).order_by(User.coins.desc()).limit(100)).all()
    result = []
    for u in rows:
        frame_img = None
        if u.equipped_frame:
            f = session.exec(select(ShopItem).where(ShopItem.slug == u.equipped_frame)).first()
            if f:
                frame_img = f.image
        result.append({
            "username": u.username,
            "nickname": u.nickname,
            "title": u.title,
            "coins": u.coins,
            "streak": u.streak,
            "character": u.active_character,
            "frame": frame_img,
        })
    return result
