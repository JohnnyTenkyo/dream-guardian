import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session, select

from ..config import settings
from ..db import get_session
from ..models import ShopItem, User
from ..schemas import AdminShopItemIn
from ..security import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/shop")
def list_all(session: Session = Depends(get_session)):
    return [r.model_dump() for r in session.exec(select(ShopItem)).all()]


@router.post("/shop")
def upsert_item(data: AdminShopItemIn, session: Session = Depends(get_session)):
    item = session.exec(select(ShopItem).where(ShopItem.slug == data.slug)).first()
    if item:
        for k, v in data.model_dump().items():
            setattr(item, k, v)
    else:
        item = ShopItem(**data.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item.model_dump()


@router.delete("/shop/{slug}")
def delete_item(slug: str, session: Session = Depends(get_session)):
    item = session.exec(select(ShopItem).where(ShopItem.slug == slug)).first()
    if item:
        session.delete(item)
        session.commit()
    return {"ok": True}


@router.post("/upload")
async def upload_asset(category: str = Form(...), file: UploadFile = File(...)):
    valid = {"characters", "items", "frames", "bosses", "bg"}
    if category not in valid:
        raise HTTPException(400, "分类无效")
    ext = Path(file.filename or "").suffix.lower()
    if ext not in {".png", ".webp", ".gif", ".jpg", ".jpeg"}:
        raise HTTPException(400, "文件类型不支持")
    target_dir = settings.upload_dir / category
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    target = target_dir / name
    with open(target, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"ok": True, "url": f"/uploads/{category}/{name}"}


@router.get("/users")
def list_users(session: Session = Depends(get_session)):
    users = session.exec(select(User).order_by(User.created_at.desc()).limit(200)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "coins": u.coins,
            "streak": u.streak,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
