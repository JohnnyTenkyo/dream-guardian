"""Seed shop items from the generated items/frames manifest."""
import json
from pathlib import Path

from sqlmodel import Session, select

from .db import engine
from .models import ShopItem


def seed_shop():
    candidates = [
        Path(__file__).resolve().parent / "assets" / "items.json",
        Path(__file__).resolve().parents[2] / "frontend/public/items/manifest.json",
    ]
    manifest = next((p for p in candidates if p.exists()), None)
    if manifest is None:
        print("[seed] no manifest.json found, skipping")
        return
    with open(manifest, "r", encoding="utf-8") as f:
        data = json.load(f)
    with Session(engine) as s:
        for g in data.get("gems", []):
            existing = s.exec(select(ShopItem).where(ShopItem.slug == g["slug"])).first()
            if existing:
                continue
            s.add(ShopItem(
                slug=g["slug"], name=g["name"], type="gem",
                price=g["price"], atk=g["atk"], image=g["image"], enabled=True,
            ))
        for fr in data.get("frames", []):
            existing = s.exec(select(ShopItem).where(ShopItem.slug == fr["slug"])).first()
            if existing:
                continue
            s.add(ShopItem(
                slug=fr["slug"], name=fr["name"], type="frame",
                price=fr["price"], atk=0, image=fr["image"], enabled=True,
            ))
        s.commit()
    print("[seed] shop items seeded")
