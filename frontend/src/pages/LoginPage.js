import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../state/auth";
export default function LoginPage() {
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("other");
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);
    const [adminPanel, setAdminPanel] = useState(false);
    const { setToken } = useAuth();
    const nav = useNavigate();
    const pressRef = useRef(null);
    useEffect(() => {
        const tok = localStorage.getItem("dg_token");
        if (tok)
            nav("/", { replace: true });
    }, [nav]);
    async function submit() {
        setErr("");
        setBusy(true);
        try {
            if (mode === "login") {
                const r = await api("/api/auth/login", {
                    method: "POST",
                    body: { username, password },
                });
                setToken(r.token, r.is_admin);
                nav(r.is_admin ? "/admin" : "/", { replace: true });
            }
            else {
                const r = await api("/api/auth/register", {
                    method: "POST",
                    body: { username, password, gender },
                });
                setToken(r.token, false);
                nav("/", { replace: true });
            }
        }
        catch (e) {
            setErr(e.message || "失败");
        }
        finally {
            setBusy(false);
        }
    }
    async function adminLogin() {
        setErr("");
        setBusy(true);
        try {
            const r = await api("/api/auth/admin_login", {
                method: "POST",
                body: { username, password },
            });
            setToken(r.token, true);
            nav("/admin", { replace: true });
        }
        catch (e) {
            setErr(e.message || "管理员登录失败");
        }
        finally {
            setBusy(false);
        }
    }
    function startHidden() {
        pressRef.current = window.setTimeout(() => setAdminPanel(true), 1500);
    }
    function clearHidden() {
        if (pressRef.current)
            window.clearTimeout(pressRef.current);
    }
    return (_jsxs("div", { className: "relative w-full h-full overflow-hidden bg-bgdark", children: [_jsx("div", { className: "absolute inset-0", style: {
                    background: "radial-gradient(circle at 50% 30%, #2b2f55 0%, #1a1c29 60%, #0c0d16 100%)",
                } }), _jsx("div", { className: "relative z-10 h-full flex items-center justify-center p-4", children: _jsxs("div", { className: "panel w-full max-w-sm p-5 text-white", children: [_jsx("h1", { className: "pixel-font text-xl text-gold mb-2 text-center", children: "\u68A6\u5883\u5B88\u62A4\u8005" }), _jsx("div", { className: "vt-font text-center text-white/70 mb-4 text-sm", children: mode === "login" ? "请登录继续" : "注册新账号" }), _jsx("label", { className: "block text-xs mb-1 pixel-font text-white/60", children: "\u7528\u6237\u540D" }), _jsx("input", { className: "w-full p-2 mb-3 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold", value: username, onChange: (e) => setUsername(e.target.value), autoComplete: "username" }), _jsx("label", { className: "block text-xs mb-1 pixel-font text-white/60", children: "\u5BC6\u7801" }), _jsx("input", { type: "password", className: "w-full p-2 mb-3 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password" }), mode === "register" && (_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "block text-xs mb-1 pixel-font text-white/60", children: "\u6027\u522B\uFF08\u7528\u4E8E\u6A31\u82B1\u7ECF\u671F\u65E5\u5386\u53EF\u89C1\u6027\uFF09" }), _jsxs("select", { className: "w-full p-2 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold", value: gender, onChange: (e) => setGender(e.target.value), children: [_jsx("option", { value: "other", children: "\u4E0D\u900F\u9732" }), _jsx("option", { value: "female", children: "\u5973\u6027" }), _jsx("option", { value: "male", children: "\u7537\u6027" })] })] })), err && _jsx("div", { className: "text-danger text-sm vt-font mb-2", children: err }), _jsx("button", { className: "pixel-btn primary w-full mb-2", disabled: busy, onClick: submit, children: busy ? "..." : mode === "login" ? "登录" : "注册" }), _jsxs("button", { className: "pixel-btn w-full", onClick: () => setMode(mode === "login" ? "register" : "login"), children: ["\u5207\u6362\u5230", mode === "login" ? "注册" : "登录"] }), _jsx("div", { onMouseDown: startHidden, onTouchStart: startHidden, onMouseUp: clearHidden, onMouseLeave: clearHidden, onTouchEnd: clearHidden, className: "mt-8 h-6 w-full cursor-default flex items-end justify-center", "aria-hidden": true, title: "\u957F\u6309 1.5 \u79D2\u663E\u793A\u7BA1\u7406\u5458\u5165\u53E3", children: _jsx("div", { className: "h-1 w-10 bg-white/10 rounded" }) }), adminPanel && (_jsxs("div", { className: "mt-4 p-3 border-2 border-black bg-black/60", children: [_jsx("div", { className: "pixel-font text-xs text-gold mb-2", children: "\u7BA1\u7406\u5458\u901A\u9053" }), _jsx("button", { className: "pixel-btn w-full", onClick: adminLogin, children: "\u4EE5\u7BA1\u7406\u5458\u8EAB\u4EFD\u767B\u5F55" }), _jsx("div", { className: "vt-font text-xs text-white/50 mt-2", children: "\u9ED8\u8BA4 admin / 123456" })] }))] }) })] }));
}
