import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
function monthMatrix(year, month) {
    const first = new Date(year, month, 1);
    const dow = first.getDay(); // 0..6 (Sun)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < dow; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(d);
    while (cells.length % 7 !== 0)
        cells.push(null);
    return cells;
}
export default function SleepRecordsPage() {
    const [rows, setRows] = useState([]);
    const [ym, setYm] = useState(() => {
        const d = new Date();
        return { y: d.getFullYear(), m: d.getMonth() };
    });
    const nav = useNavigate();
    useEffect(() => { api("/api/checkins").then(setRows); }, []);
    const byDate = useMemo(() => {
        const m = {};
        for (const r of rows)
            m[r.date] = r;
        return m;
    }, [rows]);
    const cells = monthMatrix(ym.y, ym.m);
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs mb-2", onClick: () => nav(-1), children: "< \u8FD4\u56DE" }), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => setYm(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }), children: "\u25C0" }), _jsxs("div", { className: "pixel-font text-sm text-gold", children: ["\uD83D\uDCCA ", ym.y, " \u5E74 ", ym.m + 1, " \u6708"] }), _jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => setYm(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }), children: "\u25B6" })] }), _jsx("div", { className: "grid grid-cols-7 gap-0.5 text-center pixel-font text-[10px] text-white/60 mb-1", children: ["日", "一", "二", "三", "四", "五", "六"].map((d) => (_jsx("div", { className: "py-1 bg-black/40 border border-black/60", children: d }, d))) }), _jsx("div", { className: "grid grid-cols-7 gap-0.5", children: cells.map((d, i) => {
                            const ds = d
                                ? `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
                                : "";
                            const rec = d ? byDate[ds] : undefined;
                            const bad = rec && rec.energy < 0;
                            return (_jsx("div", { className: `aspect-square border-2 border-black flex flex-col items-center justify-center ${d ? "bg-black/40" : "bg-transparent border-transparent"}`, children: d && (_jsxs(_Fragment, { children: [_jsx("div", { className: "vt-font text-xs text-white/70", children: d }), rec && (_jsx("div", { className: `vt-font text-[11px] ${bad ? "text-danger" : "text-gold"}`, children: rec.time }))] })) }, i));
                        }) })] }), _jsx(BottomNav, {})] }));
}
