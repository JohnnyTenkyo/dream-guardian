import { useEffect, useState } from "react";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";

interface InvItem { slug: string; type: string; name: string; image: string; atk: number; }

export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const { user, refreshMe } = useGame();

  useEffect(() => { api<InvItem[]>("/api/shop/inventory").then(setItems); }, []);

  async function equip(type: string, slug: string) {
    const patch: Record<string, string | null> = {};
    if (type === "gem") patch.equipped_gem = slug;
    else if (type === "frame") patch.equipped_frame = slug;
    await api("/api/profile", { method: "PATCH", body: patch });
    await refreshMe();
  }
  async function unequip(type: string) {
    const patch: Record<string, string | null> = {};
    if (type === "gem") patch.equipped_gem = null;
    else if (type === "frame") patch.equipped_frame = null;
    await api("/api/profile", { method: "PATCH", body: patch });
    await refreshMe();
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-2">
        <div className="pixel-font text-xs text-gold mb-2">🎒 我的背包</div>
        {items.length === 0 && <div className="vt-font text-white/60 p-4 text-center">空空如也，去商店逛逛吧</div>}
        <div className="grid grid-cols-3 gap-2">
          {items.map((it, i) => {
            const equipped = (it.type === "gem" && user?.equipped_gem === it.slug) || (it.type === "frame" && user?.equipped_frame === it.slug);
            return (
              <div key={i} className="border-2 border-black bg-black/40 p-2 text-center">
                <img src={apiUrl(it.image)} alt="" className="w-full h-20 object-contain mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                <div className="pixel-font text-[10px] text-white/80 mb-1 min-h-[28px]">{it.name}</div>
                {equipped ? (
                  <button className="pixel-btn !py-1 !px-2 text-xs w-full" onClick={() => unequip(it.type)}>卸下</button>
                ) : (
                  <button className="pixel-btn primary !py-1 !px-2 text-xs w-full" onClick={() => equip(it.type, it.slug)}>穿戴</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
