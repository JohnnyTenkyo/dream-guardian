import { useEffect, useState } from "react";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";

interface Row {
  username: string; nickname: string; title: string; coins: number; streak: number;
  character: string; frame: string | null;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { api<Row[]>("/api/leaderboard").then(setRows); }, []);
  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-2">
        <div className="pixel-font text-xs text-gold mb-2">🏆 金币排行榜</div>
        <ol className="space-y-1">
          {rows.map((r, i) => (
            <li key={r.username} className="flex items-center gap-2 p-1 bg-black/40 border-2 border-black">
              <div className={`w-7 text-center pixel-font text-xs ${i < 3 ? "text-gold" : "text-white/60"}`}>{i + 1}</div>
              <div className="relative w-10 h-10 border-2 border-black bg-black flex items-center justify-center">
                {r.frame && <img src={apiUrl(r.frame)} alt="" className="absolute inset-0 w-full h-full object-contain" />}
                <img src={apiUrl(`/characters/${r.character}/${r.character}_walk.webp`)} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1">
                <div className="pixel-font text-xs">{r.nickname || r.username}</div>
                <div className="vt-font text-xs text-white/60">{r.title} · 🔥{r.streak}天</div>
              </div>
              <div className="pixel-font text-xs text-gold">💰{r.coins}</div>
            </li>
          ))}
          {rows.length === 0 && <div className="vt-font text-center text-white/60 p-4">暂无数据</div>}
        </ol>
      </div>
      <BottomNav />
    </div>
  );
}
