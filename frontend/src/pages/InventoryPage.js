import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";
export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const { user, refreshMe } = useGame();
    useEffect(() => { api("/api/shop/inventory").then(setItems); }, []);
    async function equip(type, slug) {
        const patch = {};
        if (type === "gem")
            patch.equipped_gem = slug;
        else if (type === "frame")
            patch.equipped_frame = slug;
        await api("/api/profile", { method: "PATCH", body: patch });
        await refreshMe();
    }
    async function unequip(type) {
        const patch = {};
        if (type === "gem")
            patch.equipped_gem = null;
        else if (type === "frame")
            patch.equipped_frame = null;
        await api("/api/profile", { method: "PATCH", body: patch });
        await refreshMe();
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-2", children: [_jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\uD83C\uDF92 \u6211\u7684\u80CC\u5305" }), items.length === 0 && _jsx("div", { className: "vt-font text-white/60 p-4 text-center", children: "\u7A7A\u7A7A\u5982\u4E5F\uFF0C\u53BB\u5546\u5E97\u901B\u901B\u5427" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: items.map((it, i) => {
                            const equipped = (it.type === "gem" && user?.equipped_gem === it.slug) || (it.type === "frame" && user?.equipped_frame === it.slug);
                            return (_jsxs("div", { className: "border-2 border-black bg-black/40 p-2 text-center", children: [_jsx("img", { src: apiUrl(it.image), alt: "", className: "w-full h-20 object-contain mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" }), _jsx("div", { className: "pixel-font text-[10px] text-white/80 mb-1 min-h-[28px]", children: it.name }), equipped ? (_jsx("button", { className: "pixel-btn !py-1 !px-2 text-xs w-full", onClick: () => unequip(it.type), children: "\u5378\u4E0B" })) : (_jsx("button", { className: "pixel-btn primary !py-1 !px-2 text-xs w-full", onClick: () => equip(it.type, it.slug), children: "\u7A7F\u6234" }))] }, i));
                        }) })] }), _jsx(BottomNav, {})] }));
}
