import { jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useGame } from "../state/game";
const BASE = [
    { to: "/inventory", label: "🎒背包" },
    { to: "/shop", label: "🛒商店" },
    { to: "/leaderboard", label: "🏆排行" },
    { to: "/records", label: "📊记录" },
];
export default function BottomNav() {
    const { user } = useGame();
    const tabs = [...BASE];
    if (user?.gender === "female")
        tabs.push({ to: "/period", label: "🌸经期" });
    tabs.push({ to: "/settings", label: "⚙设置" });
    return (_jsx("div", { className: "panel mx-2 mb-2 mt-auto p-1 grid gap-1", style: { gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }, children: tabs.map((t) => (_jsx(NavLink, { to: t.to, className: ({ isActive }) => `pixel-btn !py-1 !px-1 text-[10px] text-center ${isActive ? "primary" : ""}`, children: t.label }, t.to))) }));
}
