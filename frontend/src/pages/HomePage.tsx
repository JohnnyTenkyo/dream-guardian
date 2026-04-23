import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import BottomNav from "../components/BottomNav";
import CharacterStage from "../components/CharacterStage";
import EnergyBar from "../components/EnergyBar";
import TimezoneBar from "../components/TimezoneBar";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";

const ACTIVITIES = [
  ["walk", "🚶 走路"],
  ["run", "🏃 跑步"],
  ["read", "📖 读书"],
  ["work", "💻 工作"],
  ["workout", "🏋️ 健身"],
  ["music", "🎧 听歌"],
  ["ipad", "📱 iPad"],
  ["garden", "🌻 浇花"],
] as const;

const MOODS = ["happy", "tired", "focused", "chill", "excited"] as const;

export default function HomePage() {
  const { user, status, refreshMe, refreshStatus } = useGame();
  const [sleeping, setSleeping] = useState(false);
  const [sleepId, setSleepId] = useState<number | null>(null);
  const [toast, setToast] = useState<string>("");
  const nav = useNavigate();

  async function setActivity(a: string) {
    await api("/api/profile", { method: "PATCH", body: { active_activity: a } });
    await refreshMe();
  }
  async function setMood(m: string) {
    await api("/api/profile", { method: "PATCH", body: { mood: m } });
    await refreshMe();
  }
  async function checkin() {
    try {
      const r = await api<{ coins_delta: number; energy: number; new_coins: number; time: string }>(
        "/api/checkin",
        { method: "POST" },
      );
      setToast(`打卡成功 ${r.time} · 能量 ${r.energy}% · ${r.coins_delta >= 0 ? "+" : ""}${r.coins_delta}金币`);
      await refreshMe();
    } catch (e) {
      setToast((e as ApiError).message || "打卡失败");
    }
    setTimeout(() => setToast(""), 3500);
  }
  async function startSleep() {
    try {
      const r = await api<{ session_id: number }>("/api/sleep/start", { method: "POST" });
      setSleepId(r.session_id);
      setSleeping(true);
    } catch (e) { setToast((e as ApiError).message); }
  }
  async function wake() {
    if (!sleepId) {
      setSleeping(false);
      return;
    }
    try {
      const r = await api<{ duration_min: number; energy_restored_pct: number }>(
        `/api/sleep/end/${sleepId}`,
        { method: "POST" },
      );
      setToast(`唤醒 · 睡眠 ${Math.round(r.duration_min / 60 * 10) / 10}h · 能量恢复 ${r.energy_restored_pct}%`);
    } catch (e) { setToast((e as ApiError).message); }
    setSleeping(false); setSleepId(null);
    refreshStatus();
  }

  if (!user || !status) return <div className="p-4 vt-font">载入中...</div>;

  if (sleeping) {
    return (
      <div className="relative w-full h-full flex flex-col">
        <CharacterStage sleeping />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="pixel-font text-3xl text-gold mb-4">💤 好梦</div>
          <div className="vt-font text-white/80 mb-6">满 8 小时唤醒：能量恢复 100%</div>
          <button className="pixel-btn primary text-xl" onClick={wake}>🌞 唤醒</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <TimezoneBar />
      <div className="panel mx-2 mt-2 p-2 flex items-center justify-between gap-2">
        <button
          className={`pixel-btn ${status.boss_open ? "danger" : ""}`}
          onClick={() => nav("/boss")}
        >⚔ 周日Boss {status.boss_open ? "开放中" : ""}</button>
        <div className="flex gap-1">
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => nav("/inventory")}>📦背包</button>
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => nav("/leaderboard")}>🏆排行</button>
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => nav("/characters")}>🧑换角</button>
        </div>
      </div>

      <CharacterStage />

      <div className="mx-2 mt-2 panel p-2 overflow-x-auto">
        <div className="pixel-font text-xs text-white/60 mb-1">🎯 当前活动</div>
        <div className="flex gap-1 flex-wrap">
          {ACTIVITIES.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setActivity(k)}
              className={`pixel-btn !py-1 !px-2 text-xs ${user.active_activity === k ? "primary" : ""}`}
            >{label}</button>
          ))}
        </div>
        <div className="pixel-font text-xs text-white/60 mt-2 mb-1">💓 心情</div>
        <div className="flex gap-1 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`pixel-btn !py-1 !px-2 text-xs ${user.mood === m ? "primary" : ""}`}
            >{m}</button>
          ))}
        </div>
      </div>

      <EnergyBar value={status.energy} />

      {status.sleep_button && (
        <div className="mx-2 mt-2">
          <button className="pixel-btn primary w-full text-lg" onClick={startSleep}>💤 休息</button>
        </div>
      )}

      <div className="mx-2 mt-2">
        <button className="pixel-btn w-full text-lg" onClick={checkin}>📝 打卡（按能量换金币）</button>
      </div>

      {toast && (
        <div className="mx-2 mt-2 panel p-2 vt-font text-center text-gold animate-flicker">{toast}</div>
      )}

      <BottomNav />
    </div>
  );
}
