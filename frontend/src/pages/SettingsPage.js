import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useAuth } from "../state/auth";
import { useGame } from "../state/game";
export default function SettingsPage() {
    const { user, refreshMe } = useGame();
    const { logout } = useAuth();
    const nav = useNavigate();
    const [oldp, setOldp] = useState("");
    const [newp, setNewp] = useState("");
    const [toast, setToast] = useState("");
    const [nick, setNick] = useState(user?.nickname ?? "");
    const [title, setTitle] = useState(user?.title ?? "");
    const [gender, setGender] = useState(user?.gender ?? "other");
    async function changePw() {
        try {
            await api("/api/auth/change_password", { method: "POST", body: { old_password: oldp, new_password: newp } });
            setToast("密码已修改");
            setOldp("");
            setNewp("");
        }
        catch (e) {
            setToast(e.message);
        }
        setTimeout(() => setToast(""), 2500);
    }
    async function saveProfile() {
        await api("/api/profile", { method: "PATCH", body: { nickname: nick, title, gender } });
        await refreshMe();
        setToast("已保存");
        setTimeout(() => setToast(""), 2000);
    }
    function doLogout() {
        logout();
        nav("/login", { replace: true });
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopBar, {}), _jsxs("div", { className: "mx-2 mt-2 panel p-3", children: [_jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\u2699 \u8BBE\u7F6E" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs pixel-font text-white/60", children: "\u6635\u79F0" }), _jsx("input", { className: "w-full p-2 bg-black/60 border-2 border-black vt-font text-lg", value: nick, onChange: (e) => setNick(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs pixel-font text-white/60", children: "\u79F0\u53F7" }), _jsx("input", { className: "w-full p-2 bg-black/60 border-2 border-black vt-font text-lg", value: title, onChange: (e) => setTitle(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs pixel-font text-white/60", children: "\u6027\u522B\uFF08\u7528\u4E8E\u6A31\u82B1\u7ECF\u671F\u65E5\u5386\u53EF\u89C1\u6027\uFF09" }), _jsxs("select", { className: "w-full p-2 bg-black/60 border-2 border-black vt-font text-lg", value: gender, onChange: (e) => setGender(e.target.value), children: [_jsx("option", { value: "other", children: "\u4E0D\u900F\u9732" }), _jsx("option", { value: "female", children: "\u5973\u6027" }), _jsx("option", { value: "male", children: "\u7537\u6027" })] })] }), _jsx("button", { className: "pixel-btn primary w-full", onClick: saveProfile, children: "\u4FDD\u5B58\u8D44\u6599" })] }), _jsx("hr", { className: "my-4 border-white/10" }), _jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\uD83D\uDD11 \u4FEE\u6539\u5BC6\u7801" }), _jsx("input", { type: "password", placeholder: "\u65E7\u5BC6\u7801", className: "w-full p-2 mb-2 bg-black/60 border-2 border-black vt-font text-lg", value: oldp, onChange: (e) => setOldp(e.target.value) }), _jsx("input", { type: "password", placeholder: "\u65B0\u5BC6\u7801", className: "w-full p-2 mb-2 bg-black/60 border-2 border-black vt-font text-lg", value: newp, onChange: (e) => setNewp(e.target.value) }), _jsx("button", { className: "pixel-btn w-full", onClick: changePw, children: "\u4FEE\u6539\u5BC6\u7801" }), _jsx("hr", { className: "my-4 border-white/10" }), _jsx("button", { className: "pixel-btn danger w-full", onClick: doLogout, children: "\u9000\u51FA\u767B\u5F55" }), toast && _jsx("div", { className: "mt-2 vt-font text-center text-gold", children: toast })] }), _jsx(BottomNav, {})] }));
}
