from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models import InventoryItem, ShopItem, User
from ..schemas import ShopItemOut
from ..security import get_current_user

router = APIRouter(prefix="/api/shop", tags=["shop"])


@router.get("", response_model=list[ShopItemOut])
def list_items(session: Session = Depends(get_session)):
    rows = session.exec(select(ShopItem).where(ShopItem.enabled == True)).all()  # noqa: E712
    return [ShopItemOut(**r.model_dump()) for r in rows]


@router.post("/buy/{slug}")
def buy_item(
    slug: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    item = session.exec(select(ShopItem).where(ShopItem.slug == slug)).first()
    if not item or not item.enabled:
        raise HTTPException(404, "商品不存在")
    if user.coins < item.price:
        raise HTTPException(400, "金币不足")
    user.coins -= item.price
    inv = InventoryItem(user_id=user.id, item_slug=item.slug, item_type=item.type, qty=1)
    session.add(inv)
    session.add(user)
    session.commit()
    return {"ok": True, "coins": user.coins}


@router.get("/inventory")
def inventory(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    rows = session.exec(select(InventoryItem).where(InventoryItem.user_id == user.id)).all()
    # Enrich with shop item info
    out = []
    for r in rows:
        item = session.exec(select(ShopItem).where(ShopItem.slug == r.item_slug)).first()
        if not item:
            continue
        out.append({
            "slug": r.item_slug,
            "type": r.item_type,
            "name": item.name,
            "image": item.image,
            "atk": item.atk,
        })
    return out
