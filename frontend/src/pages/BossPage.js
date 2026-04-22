import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";
export default function BossPage() {
    const [boss, setBoss] = useState(null);
    const [result, setResult] = useState(null);
    const [err, setErr] = useState("");
    const { refreshMe, status } = useGame();
    const nav = useNavigate();
    useEffect(() => { api("/api/boss/current").then(setBoss).catch((e) => setErr(e.message)); }, []);
    async function fight() {
        setErr("");
        try {
            const r = await api("/api/boss/battle", { method: "POST" });
            setResult(r);
            if (r.victory) {
                refreshMe();
            }
        }
        catch (e) {
            setErr(e.message);
        }
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-3 flex-1", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs mb-2", onClick: () => nav(-1), children: "< \u8FD4\u56DE" }), _jsx("div", { className: "pixel-font text-sm text-gold mb-2", children: "\u2694 \u5468\u65E5 Boss \u6218" }), !status?.boss_open && (_jsx("div", { className: "vt-font text-white/70 mb-2", children: "\u6BCF\u5468\u65E5 12:00 \u540E\u5F00\u653E\uFF08\u5F53\u524D\u65F6\u533A\uFF09" })), err && _jsx("div", { className: "text-danger vt-font", children: err }), boss && (_jsxs("div", { className: "flex flex-col items-center mt-4", children: [_jsx("img", { src: apiUrl(boss.image), alt: "", className: "w-48 h-48 object-contain drop-shadow-[0_0_12px_rgba(255,80,80,0.6)]" }), _jsx("div", { className: "pixel-font text-lg text-white mt-2", children: boss.name }), _jsxs("div", { className: "vt-font text-sm text-danger", children: ["HP ", boss.hp] }), boss.defeated_this_week ? (_jsx("div", { className: "vt-font text-gold mt-4", children: "\u672C\u5468\u5DF2\u51FB\u8D25\uFF0C\u4E0B\u5468\u518D\u6218\uFF01" })) : (_jsx("button", { className: "pixel-btn danger mt-4 text-lg", onClick: fight, disabled: !status?.boss_open, children: "\u2694 \u53D1\u8D77\u6311\u6218" })), result && (_jsx("div", { className: "mt-4 panel p-2 w-full text-center", children: result.already_defeated ? (_jsx("div", { className: "vt-font text-gold", children: "\u672C\u5468\u5DF2\u51FB\u8D25" })) : result.victory ? (_jsxs("div", { children: [_jsx("div", { className: "pixel-font text-lg text-gold", children: "\u80DC\u5229\uFF01" }), _jsxs("div", { className: "vt-font", children: ["\u4F60\u7684\u5B9D\u77F3\u653B\u51FB\u529B ", result.gem_atk, " \u2265 Boss \u8840\u91CF ", result.boss_hp] }), _jsxs("div", { className: "vt-font text-gold", children: ["+", result.coins_awarded, " \u91D1\u5E01"] })] })) : (_jsxs("div", { children: [_jsx("div", { className: "pixel-font text-lg text-danger", children: "\u5931\u8D25" }), _jsxs("div", { className: "vt-font", children: ["\u5B9D\u77F3\u653B\u51FB\u529B ", result.gem_atk, " < Boss \u8840\u91CF ", result.boss_hp] }), _jsx("div", { className: "vt-font text-white/70", children: "\u53BB\u5546\u5E97\u4E70\u66F4\u5F3A\u7684\u5B9D\u77F3\u5427" })] })) }))] }))] }), _jsx(BottomNav, {})] }));
}
