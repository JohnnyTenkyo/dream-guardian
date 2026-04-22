import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from "../state/game";
import { apiUrl } from "../api";
export default function TopBar() {
    const { user, status } = useGame();
    if (!user)
        return null;
    const frameImg = user.equipped_frame
        ? apiUrl(useGame.getState().manifest?.frames.find((f) => f.slug === user.equipped_frame)?.image ?? "")
        : null;
    const charImg = apiUrl(`/characters/${user.active_character}/${user.active_character}_walk.webp`);
    return (_jsxs("div", { className: "panel mx-2 mt-2 px-3 py-2 flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative w-12 h-12 bg-black border-2 border-black flex items-center justify-center overflow-hidden", children: [frameImg && (_jsx("img", { src: frameImg, alt: "", className: "absolute inset-0 w-full h-full object-contain" })), _jsx("img", { src: charImg, alt: "", className: "w-10 h-10 object-contain" })] }), _jsxs("div", { children: [_jsx("div", { className: "pixel-font text-xs text-gold", children: user.nickname || user.username }), _jsxs("div", { className: "vt-font text-sm text-white/80", children: ["LV.", Math.max(1, Math.floor(user.streak / 3) + 1), " \u00B7 ", user.title] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "pixel-font text-xs text-gold", children: ["\uD83D\uDCB0 ", user.coins] }), _jsxs("div", { className: "vt-font text-sm text-white/80", children: ["\uD83D\uDD25 ", user.streak, "\u5929 \u00B7 ", status?.timezone_name ?? ""] })] })] }));
}
