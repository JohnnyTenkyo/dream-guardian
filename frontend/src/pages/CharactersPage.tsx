import { useNavigate } from "react-router-dom";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";

export default function CharactersPage() {
  const { manifest, user, refreshMe } = useGame();
  const nav = useNavigate();

  async function pick(slug: string) {
    await api("/api/profile", { method: "PATCH", body: { active_character: slug } });
    await refreshMe();
  }
  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-2">
        <button className="pixel-btn !py-1 !px-2 text-xs mb-2" onClick={() => nav(-1)}>&lt; 返回</button>
        <div className="pixel-font text-xs text-gold mb-2">🧑 选择角色</div>
        <div className="grid grid-cols-3 gap-2">
          {(manifest?.characters ?? []).map((c) => {
            const active = user?.active_character === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => pick(c.slug)}
                className={`border-2 border-black bg-black/40 p-2 text-center ${active ? "ring-2 ring-gold" : ""}`}
              >
                <img src={apiUrl(c.animations.walk)} alt="" className="w-full h-24 object-contain" />
                <div className="pixel-font text-[10px] text-white mt-1">{c.name}</div>
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
