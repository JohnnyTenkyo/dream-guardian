"""
Process character GIFs:
- Clean near-white edges to transparent
- Anti-alias alpha edges (soft matte)
- Add white glow halo
- Unify foot baseline (align bottom)
- Output 192x192 PNG frames + animated WebP

Usage: python process_characters.py <input_root> <output_root>
"""
import os
import sys
from pathlib import Path
from PIL import Image, ImageSequence, ImageFilter, ImageChops
import json

# Character name normalization: raw-folder/file prefix -> slug used by the app
NAME_MAP = {
    "\u6d1b\u514b\u4eba\u0045\u0058\u0045": "rockman",       # 洛克人EXE
    "\u7a81\u51fb\u81ea\u7531\u9ad8\u8fbe": "gundam",         # 突击自由高达
    "snoopy": "snoopy",
    "\u8df3\u8df3\u864e": "tigger",                           # 跳跳虎
    "\u84dd\u732b\u004d\u006f\u0072\u0074\u0079": "morty",   # 蓝猫Morty
    "\u91d1\u6bdb\u004c\u0055\u0043\u004b\u0059": "lucky",   # 金毛LUCKY
    "\u8721\u7b14\u5c0f\u65b0": "shinchan",                  # 蜡笔小新
    "\u76ae\u5361\u4e18": "pikachu",                          # 皮卡丘
    "\u987d\u76ae\u8c79": "pinkpanther",                     # 顽皮豹
}

# Display name (Chinese) used by the UI
DISPLAY_NAME = {
    "rockman": "洛克人EXE",
    "gundam": "突击自由高达",
    "snoopy": "Snoopy",
    "tigger": "跳跳虎",
    "morty": "灰色蓝猫Morty",
    "lucky": "金毛Lucky",
    "shinchan": "蜡笔小新",
    "pikachu": "皮卡丘",
    "pinkpanther": "顽皮豹",
}

ACTIONS = ["walk", "run", "sleep", "workout", "read", "work", "garden", "ipad", "music"]

TARGET_SIZE = 192  # final canvas size


def to_rgba(im):
    if im.mode == "P":
        # Preserve palette transparency
        return im.convert("RGBA")
    if im.mode != "RGBA":
        return im.convert("RGBA")
    return im.copy()


def kill_white_bg(rgba, tol=18):
    """Turn near-white pixels fully transparent and soft-matte the edge."""
    r, g, b, a = rgba.split()
    # A pixel is "white" if min channel >= 255 - tol
    import numpy as np
    arr = np.array(rgba)
    rgb = arr[..., :3]
    alpha = arr[..., 3]
    min_rgb = rgb.min(axis=-1)
    # Full white -> transparent
    white_mask = min_rgb >= (255 - tol)
    alpha = np.where(white_mask, 0, alpha)
    # Near-white (not pure) -> soften alpha proportionally
    near = (min_rgb >= (230)) & (~white_mask) & (alpha > 0)
    soften = ((255 - min_rgb).astype(np.int32) * 255 // max(1, 255 - 230)).clip(0, 255)
    alpha = np.where(near, np.minimum(alpha, soften.astype(alpha.dtype)), alpha)
    arr[..., 3] = alpha
    return Image.fromarray(arr, mode="RGBA")


def trim(rgba):
    """Crop to visible alpha."""
    alpha = rgba.split()[-1]
    bbox = alpha.getbbox()
    if bbox is None:
        return rgba
    return rgba.crop(bbox)


def add_glow(rgba, radius=6, strength=160):
    """Add a soft white glow based on alpha silhouette."""
    alpha = rgba.split()[-1]
    # Dilate-ish with gaussian blur
    glow_alpha = alpha.filter(ImageFilter.GaussianBlur(radius=radius))
    # Scale intensity
    import numpy as np
    ga = np.array(glow_alpha, dtype=np.int32) * strength // 255
    ga = ga.clip(0, 255).astype("uint8")
    glow = Image.new("RGBA", rgba.size, (255, 255, 255, 0))
    glow.putalpha(Image.fromarray(ga))
    # Compose: glow under sprite
    out = Image.alpha_composite(glow, rgba)
    return out


def fit_canvas(rgba, size, baseline_from_bottom_pct=0.08):
    """Place sprite into a `size x size` transparent canvas, bottom-aligned."""
    w, h = rgba.size
    max_dim = size - 16  # padding for glow
    scale = min(max_dim / w, max_dim / h)
    new_w, new_h = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    sprite = rgba.resize((new_w, new_h), Image.NEAREST)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # horizontal center
    px = (size - new_w) // 2
    # baseline: bottom anchored with a small padding
    py = size - new_h - int(size * baseline_from_bottom_pct)
    canvas.alpha_composite(sprite, dest=(px, py))
    return canvas


def process_gif(in_path, out_dir, slug, action):
    im = Image.open(in_path)
    frames = []
    durations = []
    for fr in ImageSequence.Iterator(im):
        frame = to_rgba(fr)
        frame = kill_white_bg(frame)
        frame = trim(frame)
        frame = add_glow(frame, radius=5, strength=150)
        frame = fit_canvas(frame, TARGET_SIZE)
        frames.append(frame)
        durations.append(fr.info.get("duration", 120))
    os.makedirs(out_dir, exist_ok=True)
    # Save PNG frames (for Sprite-sheet-less use) only first frame as preview
    # Save animated WebP for efficient web use
    out_webp = os.path.join(out_dir, f"{slug}_{action}.webp")
    frames[0].save(
        out_webp,
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=durations,
        disposal=2,
        format="WEBP",
        lossless=True,
        quality=100,
    )
    # Also GIF fallback
    out_gif = os.path.join(out_dir, f"{slug}_{action}.gif")
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=durations,
        disposal=2,
        transparency=0,
        format="GIF",
        optimize=False,
    )
    return out_webp


def main():
    in_root = Path(sys.argv[1])
    out_root = Path(sys.argv[2])
    manifest = {"characters": []}
    for folder in sorted(in_root.iterdir()):
        if not folder.is_dir():
            continue
        raw_name = folder.name
        slug = NAME_MAP.get(raw_name)
        if slug is None:
            print(f"[skip] unknown folder: {raw_name}")
            continue
        char_out = out_root / slug
        char_out.mkdir(parents=True, exist_ok=True)
        anims = {}
        for gif in sorted(folder.glob("*.gif")):
            stem = gif.stem
            # Extract action (handle both "raw_action" and "rawraw_action" patterns)
            action = None
            for a in ACTIONS:
                if stem.endswith(f"_{a}") or stem.endswith(a):
                    action = a
                    break
            if action is None:
                print(f"[skip] no action match: {gif.name}")
                continue
            out = process_gif(gif, char_out, slug, action)
            anims[action] = f"/characters/{slug}/{slug}_{action}.webp"
            print(f"  -> {slug}/{action}")
        manifest["characters"].append({
            "slug": slug,
            "name": DISPLAY_NAME[slug],
            "animations": anims,
        })
    out_root.mkdir(parents=True, exist_ok=True)
    with open(out_root / "characters.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("done.")


if __name__ == "__main__":
    main()
