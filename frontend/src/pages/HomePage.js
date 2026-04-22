import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
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
];
const MOODS = ["happy", "tired", "focused", "chill", "excited"];
export default function HomePage() {
    const { user, status, refreshMe, refreshStatus } = useGame();
    const [sleeping, setSleeping] = useState(false);
    const [sleepId, setSleepId] = useState(null);
    const [toast, setToast] = useState("");
    const nav = useNavigate();
    async function setActivity(a) {
        await api("/api/profile", { method: "PATCH", body: { active_activity: a } });
        await refreshMe();
    }
    async function setMood(m) {
        await api("/api/profile", { method: "PATCH", body: { mood: m } });
        await refreshMe();
    }
    async function checkin() {
        try {
            const r = await api("/api/checkin", { method: "POST" });
            setToast(`打卡成功 ${r.time} · 能量 ${r.energy}% · ${r.coins_delta >= 0 ? "+" : ""}${r.coins_delta}金币`);
            await refreshMe();
        }
        catch (e) {
            setToast(e.message || "打卡失败");
        }
        setTimeout(() => setToast(""), 3500);
    }
    async function startSleep() {
        try {
            const r = await api("/api/sleep/start", { method: "POST" });
            setSleepId(r.session_id);
            setSleeping(true);
        }
        catch (e) {
            setToast(e.message);
        }
    }
    async function wake() {
        if (!sleepId) {
            setSleeping(false);
            return;
        }
        try {
            const r = await api(`/api/sleep/end/${sleepId}`, { method: "POST" });
            setToast(`唤醒 · 睡眠 ${Math.round(r.duration_min / 60 * 10) / 10}h · 能量恢复 ${r.energy_restored_pct}%`);
        }
        catch (e) {
            setToast(e.message);
        }
        setSleeping(false);
        setSleepId(null);
        refreshStatus();
    }
    if (!user || !status)
        return _jsx("div", { className: "p-4 vt-font", children: "\u8F7D\u5165\u4E2D..." });
    if (sleeping) {
        return (_jsxs("div", { className: "relative w-full h-full flex flex-col", children: [_jsx(CharacterStage, { sleeping: true }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [_jsx("div", { className: "pixel-font text-3xl text-gold mb-4", children: "\uD83D\uDCA4 \u597D\u68A6" }), _jsx("div", { className: "vt-font text-white/80 mb-6", children: "\u6EE1 8 \u5C0F\u65F6\u5524\u9192\uFF1A\u80FD\u91CF\u6062\u590D 100%" }), _jsx("button", { className: "pixel-btn primary text-xl", onClick: wake, children: "\uD83C\uDF1E \u5524\u9192" })] })] }));
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsx(TimezoneBar, {}), _jsxs("div", { className: "panel mx-2 mt-2 p-2 flex items-center justify-between gap-2", children: [_jsxs("button", { className: `pixel-btn ${status.boss_open ? "danger" : ""}`, onClick: () => nav("/boss"), children: ["\u2694 \u5468\u65E5Boss ", status.boss_open ? "开放中" : ""] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => nav("/inventory"), children: "\uD83D\uDCE6\u80CC\u5305" }), _jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => nav("/leaderboard"), children: "\uD83C\uDFC6\u6392\u884C" }), _jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs", onClick: () => nav("/characters"), children: "\uD83E\uDDD1\u6362\u89D2" })] })] }), _jsx(CharacterStage, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2 overflow-x-auto", children: [_jsx("div", { className: "pixel-font text-xs text-white/60 mb-1", children: "\uD83C\uDFAF \u5F53\u524D\u6D3B\u52A8" }), _jsx("div", { className: "flex gap-1 flex-wrap", children: ACTIVITIES.map(([k, label]) => (_jsx("button", { onClick: () => setActivity(k), className: `pixel-btn !py-1 !px-2 text-xs ${user.active_activity === k ? "primary" : ""}`, children: label }, k))) }), _jsx("div", { className: "pixel-font text-xs text-white/60 mt-2 mb-1", children: "\uD83D\uDC93 \u5FC3\u60C5" }), _jsx("div", { className: "flex gap-1 flex-wrap", children: MOODS.map((m) => (_jsx("button", { onClick: () => setMood(m), className: `pixel-btn !py-1 !px-2 text-xs ${user.mood === m ? "primary" : ""}`, children: m }, m))) })] }), _jsx(EnergyBar, { value: status.energy }), status.sleep_button && (_jsx("div", { className: "mx-2 mt-2", children: _jsx("button", { className: "pixel-btn primary w-full text-lg", onClick: startSleep, children: "\uD83D\uDCA4 \u4F11\u606F" }) })), _jsx("div", { className: "mx-2 mt-2", children: _jsx("button", { className: "pixel-btn w-full text-lg", onClick: checkin, children: "\uD83D\uDCDD \u6253\u5361\uFF08\u6309\u80FD\u91CF\u6362\u91D1\u5E01\uFF09" }) }), toast && (_jsx("div", { className: "mx-2 mt-2 panel p-2 vt-font text-center text-gold animate-flicker", children: toast })), _jsx(BottomNav, {})] }));
}
