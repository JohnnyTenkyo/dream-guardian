import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BottomNav from "../components/BottomNav";
import SakuraLayer from "../components/SakuraLayer";
import TopBar from "../components/TopBar";

interface Event { date: string; kind: "start" | "end"; }
interface Cycle { start: string; end: string; }

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const dow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < dow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PeriodCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [ym, setYm] = useState(() => {
    const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [dialog, setDialog] = useState<string | null>(null);
  const nav = useNavigate();

  async function reload() {
    const [es, cs] = await Promise.all([
      api<Event[]>("/api/period"),
      api<Cycle[]>("/api/period/cycles"),
    ]);
    setEvents(es); setCycles(cs);
  }
  useEffect(() => { reload(); }, []);

  const cells = monthMatrix(ym.y, ym.m);

  const ranges = useMemo(() => {
    const ranges: { start: string; end: string }[] = [...cycles];
    let openStart: string | null = null;
    for (const e of [...events].sort((a, b) => a.date.localeCompare(b.date))) {
      if (e.kind === "start") openStart = e.date;
      else if (e.kind === "end" && openStart) openStart = null;
    }
    if (openStart) ranges.push({ start: openStart, end: openStart });
    return ranges;
  }, [cycles, events]);

  function inRange(date: string) {
    return ranges.some((r) => date >= r.start && date <= r.end);
  }
  function kindOf(date: string): "start" | "end" | null {
    const e = events.find((x) => x.date === date);
    return e ? e.kind : null;
  }

  async function setKind(date: string, kind: "start" | "end") {
    await api("/api/period", { method: "POST", body: { date, kind } });
    setDialog(null);
    reload();
  }
  async function clearDay(date: string) {
    await api(`/api/period/${date}`, { method: "DELETE" });
    setDialog(null);
    reload();
  }

  return (
    <div className="relative flex-1 flex flex-col">
      <SakuraLayer />
      <TopBar />
      <div className="mx-2 mt-2 panel p-2" style={{ background: "rgba(70,30,50,0.6)" }}>
        <button className="pixel-btn !py-1 !px-2 text-xs mb-2" onClick={() => nav(-1)}>&lt; 返回</button>
        <div className="flex items-center justify-between mb-2">
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => setYm(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })}>◀</button>
          <div className="pixel-font text-sm" style={{ color: "#FFB7C5" }}>🌸 樱花日历 · {ym.y} 年 {ym.m + 1} 月</div>
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => setYm(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })}>▶</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center pixel-font text-[10px] text-white/60 mb-1">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="py-1 bg-black/40 border border-black/60">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square" />;
            const ds = `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const inR = inRange(ds);
            const k = kindOf(ds);
            return (
              <button
                key={i}
                onClick={() => setDialog(ds)}
                className={`aspect-square border-2 border-black flex flex-col items-center justify-center ${
                  inR ? "" : "bg-black/40"
                }`}
                style={{ background: inR ? "#FFB7C5" : undefined, color: inR ? "#3b1d2b" : undefined }}
              >
                <div className="vt-font text-xs">{d}</div>
                {k === "start" && <div className="text-[10px]">🌸起</div>}
                {k === "end" && <div className="text-[10px]">🌸止</div>}
              </button>
            );
          })}
        </div>
        <div className="mt-3 pixel-font text-xs" style={{ color: "#FFB7C5" }}>🌸 历史周期记录</div>
        <ul className="vt-font text-sm text-white/80">
          {cycles.map((c) => (
            <li key={c.start}>• {c.start} – {c.end}（{dayDiff(c.start, c.end)}天）</li>
          ))}
          {cycles.length === 0 && <li className="text-white/50">暂无记录</li>}
        </ul>
      </div>
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60">
          <div className="panel m-2 p-3 w-full max-w-sm" style={{ background: "rgba(90,40,70,0.95)" }}>
            <div className="pixel-font text-sm text-white mb-2">确认日期设置</div>
            <div className="vt-font text-white/80 mb-3">将 <span className="text-gold">{dialog}</span> 设置为：</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="pixel-btn sakura" onClick={() => setKind(dialog, "start")}>🌸 经期开始</button>
              <button className="pixel-btn sakura" onClick={() => setKind(dialog, "end")}>🌸 经期结束</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="pixel-btn" onClick={() => clearDay(dialog)}>清除</button>
              <button className="pixel-btn" onClick={() => setDialog(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function dayDiff(a: string, b: string) {
  const da = new Date(a); const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (24 * 3600 * 1000)) + 1;
}
