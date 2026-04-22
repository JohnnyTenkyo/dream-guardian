import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";

interface Row { date: string; time: string; energy: number; coins_delta: number; }

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const dow = first.getDay(); // 0..6 (Sun)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < dow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function SleepRecordsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const nav = useNavigate();

  useEffect(() => { api<Row[]>("/api/checkins").then(setRows); }, []);

  const byDate = useMemo(() => {
    const m: Record<string, Row> = {};
    for (const r of rows) m[r.date] = r;
    return m;
  }, [rows]);

  const cells = monthMatrix(ym.y, ym.m);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-2">
        <button className="pixel-btn !py-1 !px-2 text-xs mb-2" onClick={() => nav(-1)}>&lt; 返回</button>
        <div className="flex items-center justify-between mb-2">
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => setYm(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })}>◀</button>
          <div className="pixel-font text-sm text-gold">📊 {ym.y} 年 {ym.m + 1} 月</div>
          <button className="pixel-btn !py-1 !px-2 text-xs" onClick={() => setYm(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })}>▶</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center pixel-font text-[10px] text-white/60 mb-1">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="py-1 bg-black/40 border border-black/60">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((d, i) => {
            const ds = d
              ? `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
              : "";
            const rec = d ? byDate[ds] : undefined;
            const bad = rec && rec.energy < 0;
            return (
              <div
                key={i}
                className={`aspect-square border-2 border-black flex flex-col items-center justify-center ${
                  d ? "bg-black/40" : "bg-transparent border-transparent"
                }`}
              >
                {d && (
                  <>
                    <div className="vt-font text-xs text-white/70">{d}</div>
                    {rec && (
                      <div className={`vt-font text-[11px] ${bad ? "text-danger" : "text-gold"}`}>{rec.time}</div>
                    )}
                  </>
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
