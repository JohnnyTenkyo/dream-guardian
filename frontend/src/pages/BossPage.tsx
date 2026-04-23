import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiUrl, ApiError } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";

interface Boss { slug: string; name: string; hp: number; image: string; defeated_this_week: boolean; }
interface Battle { victory: boolean; boss: string; gem_atk: number; boss_hp: number; coins_awarded: number; already_defeated?: boolean; }

export default function BossPage() {
  const [boss, setBoss] = useState<Boss | null>(null);
  const [result, setResult] = useState<Battle | null>(null);
  const [err, setErr] = useState("");
  const { refreshMe, status } = useGame();
  const nav = useNavigate();

  useEffect(() => { api<Boss>("/api/boss/current").then(setBoss).catch((e: ApiError) => setErr(e.message)); }, []);

  async function fight() {
    setErr("");
    try {
      const r = await api<Battle>("/api/boss/battle", { method: "POST" });
      setResult(r);
      if (r.victory) { refreshMe(); }
    } catch (e) { setErr((e as ApiError).message); }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-3 flex-1">
        <button className="pixel-btn !py-1 !px-2 text-xs mb-2" onClick={() => nav(-1)}>&lt; 返回</button>
        <div className="pixel-font text-sm text-gold mb-2">⚔ 周日 Boss 战</div>
        {!status?.boss_open && (
          <div className="vt-font text-white/70 mb-2">每周日 12:00 后开放（当前时区）</div>
        )}
        {err && <div className="text-danger vt-font">{err}</div>}
        {boss && (
          <div className="flex flex-col items-center mt-4">
            <img src={apiUrl(boss.image)} alt="" className="w-48 h-48 object-contain drop-shadow-[0_0_12px_rgba(255,80,80,0.6)]" />
            <div className="pixel-font text-lg text-white mt-2">{boss.name}</div>
            <div className="vt-font text-sm text-danger">HP {boss.hp}</div>
            {boss.defeated_this_week ? (
              <div className="vt-font text-gold mt-4">本周已击败，下周再战！</div>
            ) : (
              <button
                className="pixel-btn danger mt-4 text-lg"
                onClick={fight}
                disabled={!status?.boss_open}
              >⚔ 发起挑战</button>
            )}
            {result && (
              <div className="mt-4 panel p-2 w-full text-center">
                {result.already_defeated ? (
                  <div className="vt-font text-gold">本周已击败</div>
                ) : result.victory ? (
                  <div>
                    <div className="pixel-font text-lg text-gold">胜利！</div>
                    <div className="vt-font">你的宝石攻击力 {result.gem_atk} ≥ Boss 血量 {result.boss_hp}</div>
                    <div className="vt-font text-gold">+{result.coins_awarded} 金币</div>
                  </div>
                ) : (
                  <div>
                    <div className="pixel-font text-lg text-danger">失败</div>
                    <div className="vt-font">宝石攻击力 {result.gem_atk} &lt; Boss 血量 {result.boss_hp}</div>
                    <div className="vt-font text-white/70">去商店买更强的宝石吧</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
