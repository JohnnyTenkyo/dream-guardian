import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
export default function LeaderboardPage() {
    const [rows, setRows] = useState([]);
    useEffect(() => { api("/api/leaderboard").then(setRows); }, []);
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2", children: [_jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\uD83C\uDFC6 \u91D1\u5E01\u6392\u884C\u699C" }), _jsxs("ol", { className: "space-y-1", children: [rows.map((r, i) => (_jsxs("li", { className: "flex items-center gap-2 p-1 bg-black/40 border-2 border-black", children: [_jsx("div", { className: `w-7 text-center pixel-font text-xs ${i < 3 ? "text-gold" : "text-white/60"}`, children: i + 1 }), _jsxs("div", { className: "relative w-10 h-10 border-2 border-black bg-black flex items-center justify-center", children: [r.frame && _jsx("img", { src: apiUrl(r.frame), alt: "", className: "absolute inset-0 w-full h-full object-contain" }), _jsx("img", { src: apiUrl(`/characters/${r.character}/${r.character}_walk.webp`), alt: "", className: "w-8 h-8 object-contain" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "pixel-font text-xs", children: r.nickname || r.username }), _jsxs("div", { className: "vt-font text-xs text-white/60", children: [r.title, " \u00B7 \uD83D\uDD25", r.streak, "\u5929"] })] }), _jsxs("div", { className: "pixel-font text-xs text-gold", children: ["\uD83D\uDCB0", r.coins] })] }, r.username))), rows.length === 0 && _jsx("div", { className: "vt-font text-center text-white/60 p-4", children: "\u6682\u65E0\u6570\u636E" })] })] }), _jsx(BottomNav, {})] }));
}
