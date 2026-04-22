import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BottomNav from "../components/BottomNav";
import SakuraLayer from "../components/SakuraLayer";
import TopBar from "../components/TopBar";
function monthMatrix(year, month) {
    const first = new Date(year, month, 1);
    const dow = first.getDay();
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
export default function PeriodCalendarPage() {
    const [events, setEvents] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [ym, setYm] = useState(() => {
        const d = new Date();
        return { y: d.getFullYear(), m: d.getMonth() };
    });
    const [dialog, setDialog] = useState(null);
    const nav = useNavigate();
    async function reload() {
        const [es, cs] = await Promise.all([
            api("/api/period"),
            api("/api/period/cycles"),
        ]);
        setEvents(es);
        setCycles(cs);
    }
    useEffect(() => { reload(); }, []);
    const cells = monthMatrix(ym.y, ym.m);
    const ranges = useMemo(() => {
        const ranges = [...cycles];
        let openStart = null;
        for (const e of [...events].sort((a, b) => a.date.localeCompare(b.date))) {
            if (e.kind === "start")
                openStart = e.date;
            else if (e.kind === "end" && openStart)
                openStart = null;
        }
        if (openStart)
            ranges.push({ start: openStart, end: openStart });
        return ranges;
    }, [cycles, events]);
    function inRange(date) {
        return ranges.some((r) => date >= r.start && date <= r.end);
    }
    function kindOf(date) {
        const e = events.find((x) => x.date === date);
        return e ? e.kind : null;
    }
    async function setKind(date, kind) {
        await api("/api/period", { method: "POST", body: { date, kind } });
        setDialog(null);
        reload();
    }
    async function clearDay(date) {
        await api(`/api/period/${date}`, { method: "DELETE" });
        setDialog(null);
        reload();
    }
    return (_jsxs("div", { className: "relative flex-1 flex flex-col", children: [_jsx(SakuraLayer, {}), _jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2", style: { background: "rgba(70,30,50,0.6)" }, children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs mb-2", onClick: () => nav(-1), children: "< \u8FD4\u56DE" }), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => setYm(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }), children: "\u25C0" }), _jsxs("div", { className: "pixel-font text-sm", style: { color: "#FFB7C5" }, children: ["\uD83C\uDF38 \u6A31\u82B1\u65E5\u5386 \u00B7 ", ym.y, " \u5E74 ", ym.m + 1, " \u6708"] }), _jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => setYm(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }), children: "\u25B6" })] }), _jsx("div", { className: "grid grid-cols-7 gap-0.5 text-center pixel-font text-[10px] text-white/60 mb-1", children: ["日", "一", "二", "三", "四", "五", "六"].map((d) => (_jsx("div", { className: "py-1 bg-black/40 border border-black/60", children: d }, d))) }), _jsx("div", { className: "grid grid-cols-7 gap-0.5", children: cells.map((d, i) => {
                            if (!d)
                                return _jsx("div", { className: "aspect-square" }, i);
                            const ds = `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                            const inR = inRange(ds);
                            const k = kindOf(ds);
                            return (_jsxs("button", { onClick: () => setDialog(ds), className: `aspect-square border-2 border-black flex flex-col items-center justify-center ${inR ? "" : "bg-black/40"}`, style: { background: inR ? "#FFB7C5" : undefined, color: inR ? "#3b1d2b" : undefined }, children: [_jsx("div", { className: "vt-font text-xs", children: d }), k === "start" && _jsx("div", { className: "text-[10px]", children: "\uD83C\uDF38\u8D77" }), k === "end" && _jsx("div", { className: "text-[10px]", children: "\uD83C\uDF38\u6B62" })] }, i));
                        }) }), _jsx("div", { className: "mt-3 pixel-font text-xs", style: { color: "#FFB7C5" }, children: "\uD83C\uDF38 \u5386\u53F2\u5468\u671F\u8BB0\u5F55" }), _jsxs("ul", { className: "vt-font text-sm text-white/80", children: [cycles.map((c) => (_jsxs("li", { children: ["\u2022 ", c.start, " \u2013 ", c.end, "\uFF08", dayDiff(c.start, c.end), "\u5929\uFF09"] }, c.start))), cycles.length === 0 && _jsx("li", { className: "text-white/50", children: "\u6682\u65E0\u8BB0\u5F55" })] })] }), dialog && (_jsx("div", { className: "fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60", children: _jsxs("div", { className: "panel m-2 p-3 w-full max-w-sm", style: { background: "rgba(90,40,70,0.95)" }, children: [_jsx("div", { className: "pixel-font text-sm text-white mb-2", children: "\u786E\u8BA4\u65E5\u671F\u8BBE\u7F6E" }), _jsxs("div", { className: "vt-font text-white/80 mb-3", children: ["\u5C06 ", _jsx("span", { className: "text-gold", children: dialog }), " \u8BBE\u7F6E\u4E3A\uFF1A"] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { className: "pixel-btn sakura", onClick: () => setKind(dialog, "start"), children: "\uD83C\uDF38 \u7ECF\u671F\u5F00\u59CB" }), _jsx("button", { className: "pixel-btn sakura", onClick: () => setKind(dialog, "end"), children: "\uD83C\uDF38 \u7ECF\u671F\u7ED3\u675F" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [_jsx("button", { className: "pixel-btn", onClick: () => clearDay(dialog), children: "\u6E05\u9664" }), _jsx("button", { className: "pixel-btn", onClick: () => setDialog(null), children: "\u53D6\u6D88" })] })] }) })), _jsx(BottomNav, {})] }));
}
function dayDiff(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return Math.round((db.getTime() - da.getTime()) / (24 * 3600 * 1000)) + 1;
}
