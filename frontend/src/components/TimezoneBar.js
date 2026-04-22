import { jsx as _jsx } from "react/jsx-runtime";
import { api } from "../api";
import { useGame } from "../state/game";
const TZS = [
    { key: "beijing", tz: "Asia/Shanghai", label: "北京" },
    { key: "us_east", tz: "America/New_York", label: "美东" },
    { key: "japan", tz: "Asia/Tokyo", label: "日本" },
    { key: "germany", tz: "Europe/Berlin", label: "德国" },
];
export default function TimezoneBar() {
    const { user, refreshMe, refreshStatus } = useGame();
    const active = user?.timezone ?? "Asia/Shanghai";
    async function switchTz(tz) {
        await api("/api/profile", { method: "PATCH", body: { timezone: tz } });
        await refreshMe();
        await refreshStatus();
    }
    return (_jsx("div", { className: "panel mx-2 mt-2 p-2 grid grid-cols-4 gap-1", children: TZS.map((t) => (_jsx("button", { onClick: () => switchTz(t.tz), className: `pixel-btn !py-1 !px-2 text-xs ${active === t.tz ? "primary" : ""}`, children: t.label }, t.key))) }));
}
