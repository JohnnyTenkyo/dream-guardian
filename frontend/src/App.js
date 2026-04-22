import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./state/auth";
import { useGame } from "./state/game";
import SakuraLayer from "./components/SakuraLayer";
import SceneBackground from "./components/SceneBackground";
export default function App() {
    const { token, logout } = useAuth();
    const { refreshMe, refreshStatus, refreshManifest, user } = useGame();
    const nav = useNavigate();
    useEffect(() => {
        if (!token) {
            nav("/login", { replace: true });
            return;
        }
        refreshMe().catch(() => {
            logout();
            nav("/login", { replace: true });
        });
        refreshManifest();
        refreshStatus();
        const iv = setInterval(() => refreshStatus(), 30000);
        return () => clearInterval(iv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
    return (_jsxs("div", { className: "relative w-full h-full overflow-hidden bg-bgdark text-white", children: [_jsx(SceneBackground, {}), user?.gender === "female" && _jsx(SakuraLayer, { light: true }), _jsx("div", { className: "relative z-10 h-full flex flex-col overflow-y-auto overflow-x-hidden", children: _jsx(Outlet, {}) })] }));
}
