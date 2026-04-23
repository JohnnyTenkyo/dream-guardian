from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..config import settings
from ..db import get_session
from ..models import User
from ..schemas import ChangePasswordIn, LoginIn, RegisterIn, TokenOut, UserOut
from ..security import create_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(data: RegisterIn, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.username == data.username)).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "用户名已存在")
    if data.username == settings.admin_username:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "该用户名被保留")
    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        nickname=data.nickname or data.username,
        gender=data.gender or "other",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_token(user.username, is_admin=False)
    return TokenOut(token=token, is_admin=False)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, session: Session = Depends(get_session)):
    # Admin shortcut (no db user row is created for admin)
    if data.username == settings.admin_username and data.password == settings.admin_password:
        return TokenOut(token=create_token(settings.admin_username, is_admin=True), is_admin=True)

    user = session.exec(select(User).where(User.username == data.username)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "用户名或密码错误")
    return TokenOut(token=create_token(user.username, is_admin=False), is_admin=False)


@router.post("/admin_login", response_model=TokenOut)
def admin_login(data: LoginIn):
    if data.username == settings.admin_username and data.password == settings.admin_password:
        return TokenOut(token=create_token(settings.admin_username, is_admin=True), is_admin=True)
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "管理员凭证错误")


@router.post("/change_password")
def change_password(
    data: ChangePasswordIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "旧密码错误")
    user.password_hash = hash_password(data.new_password)
    session.add(user)
    session.commit()
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
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
