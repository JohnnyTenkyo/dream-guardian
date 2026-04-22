import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import init_db
from .routers import admin, auth, boss, checkin, leaderboard, period, profile, shop
from .seed import seed_shop


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="0.1.0")

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins != ["*"] else ["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        init_db()
        seed_shop()

    @app.get("/api/health")
    def health():
        return {"ok": True, "app": settings.app_name}

    @app.get("/api/manifest")
    def manifest():
        manifest_path = Path(__file__).resolve().parents[2] / "frontend/public"
        chars = manifest_path / "characters/characters.json"
        items = manifest_path / "items/manifest.json"
        data = {"characters": [], "gems": [], "frames": [], "bosses": []}
        if chars.exists():
            with open(chars, "r", encoding="utf-8") as f:
                data["characters"] = json.load(f).get("characters", [])
        if items.exists():
            with open(items, "r", encoding="utf-8") as f:
                obj = json.load(f)
                data["gems"] = obj.get("gems", [])
                data["frames"] = obj.get("frames", [])
                data["bosses"] = obj.get("bosses", [])
        return data

    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(checkin.router)
    app.include_router(shop.router)
    app.include_router(leaderboard.router)
    app.include_router(boss.router)
    app.include_router(period.router)
    app.include_router(admin.router)

    # Serve uploads
    (settings.upload_dir).mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")

    return app


app = create_app()
