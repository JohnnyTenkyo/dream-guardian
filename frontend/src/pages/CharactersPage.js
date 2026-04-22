import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";
export default function CharactersPage() {
    const { manifest, user, refreshMe } = useGame();
    const nav = useNavigate();
    async function pick(slug) {
        await api("/api/profile", { method: "PATCH", body: { active_character: slug } });
        await refreshMe();
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2", children: [_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs mb-2", onClick: () => nav(-1), children: "< \u8FD4\u56DE" }), _jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\uD83E\uDDD1 \u9009\u62E9\u89D2\u8272" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: (manifest?.characters ?? []).map((c) => {
                            const active = user?.active_character === c.slug;
                            return (_jsxs("button", { onClick: () => pick(c.slug), className: `border-2 border-black bg-black/40 p-2 text-center ${active ? "ring-2 ring-gold" : ""}`, children: [_jsx("img", { src: apiUrl(c.animations.walk), alt: "", className: "w-full h-24 object-contain" }), _jsx("div", { className: "pixel-font text-[10px] text-white mt-1", children: c.name })] }, c.slug));
                        }) })] }), _jsx(BottomNav, {})] }));
}
