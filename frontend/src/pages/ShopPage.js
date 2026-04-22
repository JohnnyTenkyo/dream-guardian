import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api, apiUrl } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useGame } from "../state/game";
export default function ShopPage() {
    const [items, setItems] = useState([]);
    const [toast, setToast] = useState("");
    const { user, refreshMe } = useGame();
    useEffect(() => { api("/api/shop").then(setItems); }, []);
    async function buy(slug) {
        try {
            await api(`/api/shop/buy/${slug}`, { method: "POST" });
            setToast("购买成功");
            await refreshMe();
        }
        catch (e) {
            setToast(e.message);
        }
        setTimeout(() => setToast(""), 2500);
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsx("div", { className: "mx-2 mt-2 panel p-2 grid grid-cols-3 gap-2", children: items.map((it) => (_jsxs("div", { className: "border-2 border-black bg-black/40 p-2 text-center", children: [_jsx("img", { src: apiUrl(it.image), alt: it.name, className: "w-full h-20 object-contain mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" }), _jsx("div", { className: "pixel-font text-[10px] text-white/80 mb-1 min-h-[28px]", children: it.name }), _jsxs("div", { className: "vt-font text-sm text-gold mb-1", children: ["\uD83D\uDCB0", it.price, " ", it.atk ? `· +${it.atk}ATK` : ""] }), _jsx("button", { className: `pixel-btn !py-1 !px-2 text-xs w-full ${user && user.coins >= it.price ? "primary" : ""}`, onClick: () => buy(it.slug), disabled: !user || user.coins < it.price, children: "\u8D2D\u4E70" })] }, it.slug))) }), toast && _jsx("div", { className: "mx-2 mt-2 panel p-2 vt-font text-center text-gold", children: toast }), _jsx(BottomNav, {})] }));
}
