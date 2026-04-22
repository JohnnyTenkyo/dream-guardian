"""Generate procedural pixel art for gems, avatar frames, and bosses."""
import os
import json
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np


def add_white_glow(rgba, radius=5, strength=160):
    alpha = rgba.split()[-1]
    glow_alpha = alpha.filter(ImageFilter.GaussianBlur(radius=radius))
    ga = np.array(glow_alpha, dtype=np.int32) * strength // 255
    ga = ga.clip(0, 255).astype("uint8")
    glow = Image.new("RGBA", rgba.size, (255, 255, 255, 0))
    glow.putalpha(Image.fromarray(ga))
    return Image.alpha_composite(glow, rgba)


def pixel_grid(size, cells, color_fn):
    """Paint an image by cells (cells x cells grid scaled to size)."""
    cell = size // cells
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    for cy in range(cells):
        for cx in range(cells):
            color = color_fn(cx, cy, cells)
            if color is None:
                continue
            x0, y0 = cx * cell, cy * cell
            x1, y1 = x0 + cell, y0 + cell
            draw.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
    return im


def gem_shape(palette, cells=16):
    """Return color_fn for a diamond-cut gem."""
    base, dark, light, spark = palette
    def fn(x, y, n):
        cx, cy = (n - 1) / 2.0, (n - 1) / 2.0
        # Diamond constraint
        dist = abs(x - cx) + abs(y - cy)
        R = n * 0.48
        if dist > R:
            return None
        if dist > R - 1:
            return dark
        # top-left highlight
        if (x < cx) and (y < cy) and dist < R - 2 and random.random() < 0.7:
            return light
        # sparkle pixel
        if dist < R / 3 and random.random() < 0.08:
            return spark
        return base
    return fn


def make_gem(name, palette, atk, out_dir, size=128):
    """palette: (base, dark, light, spark, display_name)."""
    random.seed(hash(name) & 0xffffffff)
    im = pixel_grid(size, 16, gem_shape(palette[:4]))
    im = add_white_glow(im, radius=4, strength=180)
    out = Path(out_dir) / f"{name}.png"
    im.save(out)
    return {
        "slug": name,
        "name": f"{palette[4]}宝石 +{atk}ATK",
        "atk": atk,
        "price": atk * 10,
        "image": f"/items/{name}.png",
        "type": "gem",
    }


def make_avatar_frame(name, palette, price, out_dir, size=128):
    random.seed(hash(name) & 0xffffffff)
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    # Outer border
    border_color = palette[0]
    corner_color = palette[1]
    accent = palette[2]
    thick = max(4, size // 16)
    # Draw square with pixel-blocky style
    draw.rectangle([0, 0, size - 1, thick - 1], fill=border_color)  # top
    draw.rectangle([0, size - thick, size - 1, size - 1], fill=border_color)  # bottom
    draw.rectangle([0, 0, thick - 1, size - 1], fill=border_color)  # left
    draw.rectangle([size - thick, 0, size - 1, size - 1], fill=border_color)  # right
    # Corners embellishment
    for (cx, cy) in [(0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1)]:
        dx = thick * 2
        x0 = max(0, cx - dx if cx > 0 else 0)
        y0 = max(0, cy - dx if cy > 0 else 0)
        x1 = min(size - 1, cx + dx if cx == 0 else size - 1)
        y1 = min(size - 1, cy + dx if cy == 0 else size - 1)
        draw.rectangle([x0, y0, x1, y1], outline=corner_color, width=thick // 2)
    # Inner line accent
    inset = thick + 3
    draw.rectangle([inset, inset, size - inset - 1, size - inset - 1], outline=accent, width=2)
    im = add_white_glow(im, radius=3, strength=120)
    out = Path(out_dir) / f"{name}.png"
    im.save(out)
    return {
        "slug": name,
        "name": f"{palette[3]}头像框",
        "price": price,
        "image": f"/frames/{name}.png",
        "type": "frame",
    }


def boss_shape(palette, cells=20):
    body, dark, eye, fang = palette
    def fn(x, y, n):
        cx, cy = (n - 1) / 2.0, (n - 1) / 2.0
        # Fat circle body
        dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        R = n * 0.42
        if dist > R:
            return None
        if dist > R - 1.2:
            return dark
        # Eyes
        eye_y = cy - n * 0.12
        for ex in (cx - n * 0.18, cx + n * 0.18):
            if abs(x - ex) < 1.2 and abs(y - eye_y) < 1.2:
                return eye
        # Fangs
        if y > cy + n * 0.1 and y < cy + n * 0.22:
            if abs(x - (cx - n * 0.08)) < 0.6 or abs(x - (cx + n * 0.08)) < 0.6:
                return fang
        # Body shading
        if (x < cx) and (y < cy) and random.random() < 0.3:
            return dark
        return body
    return fn


def make_boss(slug, name, palette, hp, out_dir, size=160):
    random.seed(hash(slug) & 0xffffffff)
    im = pixel_grid(size, 20, boss_shape(palette))
    im = add_white_glow(im, radius=4, strength=140)
    out = Path(out_dir) / f"{slug}.png"
    im.save(out)
    return {
        "slug": slug,
        "name": name,
        "hp": hp,
        "image": f"/bosses/{slug}.png",
    }


def main():
    root = Path("/home/ubuntu/repos/dream-guardian/frontend/public")
    (root / "items").mkdir(parents=True, exist_ok=True)
    (root / "frames").mkdir(parents=True, exist_ok=True)
    (root / "bosses").mkdir(parents=True, exist_ok=True)

    # ---- Gems (palettes: base, dark, light, sparkle, displayName) ----
    gem_palettes = [
        ("ruby",       (220, 50, 70, 255),  (140, 20, 35, 255),  (255, 180, 200, 255), (255, 255, 255, 255), "红宝石"),
        ("sapphire",   (60, 110, 230, 255), (20, 40, 140, 255),  (180, 200, 255, 255), (255, 255, 255, 255), "蓝宝石"),
        ("emerald",    (50, 200, 110, 255), (20, 100, 50, 255),  (180, 255, 210, 255), (255, 255, 255, 255), "翡翠"),
        ("topaz",      (255, 200, 50, 255), (180, 120, 10, 255), (255, 240, 180, 255), (255, 255, 255, 255), "黄玉"),
        ("amethyst",   (170, 90, 220, 255), (90, 40, 130, 255),  (230, 200, 255, 255), (255, 255, 255, 255), "紫晶"),
        ("diamond",    (220, 240, 255, 255),(120, 170, 220, 255),(255, 255, 255, 255), (255, 255, 255, 255), "钻石"),
        ("onyx",       (60, 60, 80, 255),   (20, 20, 30, 255),   (140, 140, 160, 255), (255, 255, 255, 255), "玛瑙"),
        ("moonstone",  (200, 220, 230, 255),(120, 150, 170, 255),(255, 255, 255, 255), (255, 240, 200, 255), "月光石"),
    ]
    gems = []
    for i, p in enumerate(gem_palettes):
        atk = [1, 3, 5, 7, 10, 15, 20, 30][i]
        slug = p[0]
        pal = p[1:5] + (p[5],)
        gems.append(make_gem(slug, pal, atk, root / "items"))

    # ---- Avatar frames ----
    frame_palettes = [
        ("frame_wood",   ((139, 90, 43, 255),  (102, 64, 30, 255),  (210, 170, 110, 255), "原木")),
        ("frame_silver", ((190, 195, 210, 255),(120, 130, 150, 255),(230, 235, 245, 255), "白银")),
        ("frame_gold",   ((255, 215, 0, 255),  (180, 150, 0, 255),  (255, 245, 150, 255), "黄金")),
        ("frame_royal",  ((130, 60, 200, 255), (70, 30, 120, 255),  (230, 180, 255, 255), "皇室")),
        ("frame_neon",   ((0, 230, 230, 255),  (0, 130, 150, 255),  (180, 255, 255, 255), "霓虹")),
        ("frame_star",   ((255, 180, 80, 255), (180, 100, 30, 255), (255, 240, 180, 255), "星辰")),
    ]
    frames = []
    for i, (slug, pal) in enumerate(frame_palettes):
        price = [50, 120, 250, 500, 800, 1200][i]
        frames.append(make_avatar_frame(slug, pal, price, root / "frames"))

    # ---- Bosses (20) ----
    boss_defs = [
        ("shadow_slime", "暗影史莱姆", (80, 90, 200, 255),  (30, 40, 120, 255),   (255, 255, 255, 255), (255, 100, 100, 255)),
        ("void_orb",     "虚空球体",   (60, 30, 120, 255),  (20, 10, 60, 255),    (255, 200, 80, 255),  (255, 255, 255, 255)),
        ("fire_demon",   "烈焰恶魔",   (230, 70, 30, 255),  (140, 30, 10, 255),   (255, 255, 180, 255), (255, 255, 255, 255)),
        ("ice_wraith",   "冰霜幽魂",   (180, 230, 255, 255),(100, 150, 200, 255), (80, 50, 200, 255),   (255, 255, 255, 255)),
        ("forest_imp",   "森林小妖",   (90, 180, 60, 255),  (40, 100, 30, 255),   (255, 220, 50, 255),  (255, 255, 255, 255)),
        ("lava_golem",   "熔岩巨人",   (140, 60, 30, 255),  (70, 20, 10, 255),    (255, 180, 50, 255),  (255, 240, 180, 255)),
        ("dream_eater",  "梦境吞噬者", (120, 80, 200, 255), (60, 30, 120, 255),   (255, 255, 180, 255), (255, 100, 255, 255)),
        ("night_bat",    "夜之蝙蝠",   (50, 50, 70, 255),   (20, 20, 30, 255),    (255, 50, 50, 255),   (255, 255, 255, 255)),
        ("moon_serpent", "月蛇",       (200, 210, 230, 255),(120, 130, 170, 255), (80, 220, 80, 255),   (255, 255, 255, 255)),
        ("star_lich",    "星界巫妖",   (180, 120, 220, 255),(90, 50, 120, 255),   (255, 255, 100, 255), (255, 255, 255, 255)),
        ("sleep_gremlin","睡魔",       (180, 150, 80, 255), (90, 70, 30, 255),    (255, 50, 50, 255),   (255, 255, 255, 255)),
        ("crimson_knight","绯红骑士",  (200, 40, 70, 255),  (110, 20, 40, 255),   (255, 230, 100, 255), (255, 255, 255, 255)),
        ("iron_gargoyle","铁翼石像鬼", (150, 150, 150, 255),(80, 80, 90, 255),    (255, 200, 0, 255),   (255, 255, 255, 255)),
        ("rotten_pumpkin","腐烂南瓜",  (230, 130, 30, 255), (140, 70, 15, 255),   (50, 220, 50, 255),   (255, 255, 255, 255)),
        ("ghost_child",  "幽灵孩童",   (230, 230, 250, 255),(150, 150, 180, 255), (180, 50, 50, 255),   (255, 200, 230, 255)),
        ("chaos_blob",   "混沌黏菌",   (220, 60, 130, 255), (130, 20, 60, 255),   (255, 255, 100, 255), (255, 255, 255, 255)),
        ("clock_beast",  "时钟野兽",   (140, 110, 70, 255), (80, 60, 30, 255),    (255, 50, 50, 255),   (255, 255, 255, 255)),
        ("mirror_wraith","镜面幽魂",   (200, 220, 230, 255),(100, 130, 170, 255), (200, 50, 200, 255),  (255, 255, 255, 255)),
        ("dark_phoenix", "暗夜不死鸟", (100, 30, 60, 255),  (50, 10, 20, 255),    (255, 120, 30, 255),  (255, 200, 100, 255)),
        ("final_keeper", "终焉守护者", (50, 10, 30, 255),   (20, 5, 15, 255),     (255, 50, 100, 255),  (255, 255, 255, 255)),
    ]
    bosses = []
    for i, b in enumerate(boss_defs):
        slug, name, *pal = b
        hp = 5 + i * 2  # scales 5..43
        bosses.append(make_boss(slug, name, tuple(pal), hp, root / "bosses"))

    manifest = {"gems": gems, "frames": frames, "bosses": bosses}
    with open(root / "items" / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("Items:", len(gems), "Frames:", len(frames), "Bosses:", len(bosses))


if __name__ == "__main__":
    main()
