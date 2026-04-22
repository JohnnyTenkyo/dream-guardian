import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";

interface ShopItem {
  slug: string; name: string; type: string; price: number; atk: number; image: string; enabled: boolean;
}

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [toast, setToast] = useState("");
  const { user, refreshMe } = useGame();

  useEffect(() => { api<ShopItem[]>("/api/shop").then(setItems); }, []);

  async function buy(slug: string) {
    try {
      await api(`/api/shop/buy/${slug}`, { method: "POST" });
      setToast("购买成功");
      await refreshMe();
    } catch (e) { setToast((e as ApiError).message); }
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-2 grid grid-cols-3 gap-2">
        {items.map((it) => (
          <div key={it.slug} className="border-2 border-black bg-black/40 p-2 text-center">
            <img src={apiUrl(it.image)} alt={it.name} className="w-full h-20 object-contain mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
            <div className="pixel-font text-[10px] text-white/80 mb-1 min-h-[28px]">{it.name}</div>
            <div className="vt-font text-sm text-gold mb-1">💰{it.price} {it.atk ? `· +${it.atk}ATK` : ""}</div>
            <button
              className={`pixel-btn !py-1 !px-2 text-xs w-full ${user && user.coins >= it.price ? "primary" : ""}`}
              onClick={() => buy(it.slug)}
              disabled={!user || user.coins < it.price}
            >购买</button>
          </div>
        ))}
      </div>
      {toast && <div className="mx-2 mt-2 panel p-2 vt-font text-center text-gold">{toast}</div>}
      <BottomNav />
    </div>
  );
}
