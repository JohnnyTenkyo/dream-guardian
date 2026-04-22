import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiUrl } from "../api";
import { useAuth } from "../state/auth";
export default function AdminPage() {
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [uploadCat, setUploadCat] = useState("characters");
    const [uploadRes, setUploadRes] = useState(null);
    const { logout } = useAuth();
    const nav = useNavigate();
    async function reload() {
        setItems(await api("/api/admin/shop"));
        setUsers(await api("/api/admin/users"));
    }
    useEffect(() => { reload(); }, []);
    async function save(it) {
        await api("/api/admin/shop", { method: "POST", body: it });
        setEditing(null);
        reload();
    }
    async function del(slug) {
        if (!confirm("确认删除？"))
            return;
        await api(`/api/admin/shop/${slug}`, { method: "DELETE" });
        reload();
    }
    async function handleUpload(e) {
        const f = e.target.files?.[0];
        if (!f)
            return;
        const fd = new FormData();
        fd.append("category", uploadCat);
        fd.append("file", f);
        const r = await api("/api/admin/upload", { form: fd });
        setUploadRes(r.url);
    }
    function doLogout() {
        logout();
        nav("/login", { replace: true });
    }
    return (_jsxs("div", { className: "min-h-full bg-bgdark text-white p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "pixel-font text-lg text-gold", children: "\uD83D\uDEE1 \u7BA1\u7406\u5458\u540E\u53F0" }), _jsx("button", { className: "pixel-btn", onClick: doLogout, children: "\u9000\u51FA" })] }), _jsxs("section", { className: "panel p-3 mb-3", children: [_jsx("div", { className: "pixel-font text-sm text-gold mb-2", children: "\uD83D\uDED2 \u5546\u5E97\u5546\u54C1" }), _jsx("button", { className: "pixel-btn primary mb-2", onClick: () => setEditing({ slug: "", name: "", type: "gem", price: 10, atk: 1, image: "", enabled: true }), children: "+ \u65B0\u589E\u5546\u54C1" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: items.map((it) => (_jsxs("div", { className: "border-2 border-black bg-black/40 p-2", children: [_jsx("img", { src: apiUrl(it.image), alt: "", className: "w-full h-20 object-contain" }), _jsx("div", { className: "pixel-font text-[10px]", children: it.name }), _jsxs("div", { className: "vt-font text-xs text-gold", children: ["\uD83D\uDCB0", it.price, " \u00B7 +", it.atk, "ATK \u00B7 ", it.type] }), _jsxs("div", { className: "flex gap-1 mt-1", children: [_jsx("button", { className: "pixel-btn !py-0.5 !px-1 text-[10px]", onClick: () => setEditing(it), children: "\u7F16\u8F91" }), _jsx("button", { className: "pixel-btn danger !py-0.5 !px-1 text-[10px]", onClick: () => del(it.slug), children: "\u5220\u9664" })] })] }, it.slug))) })] }), _jsxs("section", { className: "panel p-3 mb-3", children: [_jsx("div", { className: "pixel-font text-sm text-gold mb-2", children: "\uD83D\uDCE4 \u8D44\u6E90\u4E0A\u4F20" }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs("select", { className: "p-2 bg-black/60 border-2 border-black", value: uploadCat, onChange: (e) => setUploadCat(e.target.value), children: [_jsx("option", { value: "characters", children: "\u89D2\u8272 GIF/WebP" }), _jsx("option", { value: "items", children: "\u9053\u5177\uFF08\u60AC\u6D6E\u5B9D\u77F3\uFF09" }), _jsx("option", { value: "frames", children: "\u5934\u50CF\u6846" }), _jsx("option", { value: "bosses", children: "Boss" }), _jsx("option", { value: "bg", children: "\u80CC\u666F" })] }), _jsx("input", { type: "file", accept: ".png,.webp,.gif,.jpg,.jpeg", onChange: handleUpload })] }), uploadRes && _jsxs("div", { className: "vt-font text-sm text-gold", children: ["\u5DF2\u4E0A\u4F20: ", _jsx("code", { children: uploadRes })] })] }), _jsxs("section", { className: "panel p-3", children: [_jsx("div", { className: "pixel-font text-sm text-gold mb-2", children: "\uD83D\uDC65 \u7528\u6237\u5217\u8868" }), _jsxs("table", { className: "w-full vt-font text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-white/60 text-left", children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "\u7528\u6237\u540D" }), _jsx("th", { children: "\u6635\u79F0" }), _jsx("th", { children: "\u91D1\u5E01" }), _jsx("th", { children: "\u8FDE\u7EED" }), _jsx("th", { children: "\u6CE8\u518C" })] }) }), _jsx("tbody", { children: users.map((u) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { children: u.id }), _jsx("td", { children: u.username }), _jsx("td", { children: u.nickname }), _jsx("td", { className: "text-gold", children: u.coins }), _jsx("td", { children: u.streak }), _jsx("td", { children: u.created_at.slice(0, 10) })] }, u.id))) })] })] }), editing && (_jsx("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "panel p-3 w-full max-w-md", children: [_jsx("div", { className: "pixel-font text-sm text-gold mb-2", children: "\u7F16\u8F91\u5546\u54C1" }), ["slug", "name", "type", "image"].map((k) => (_jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "text-xs pixel-font text-white/60", children: k }), _jsx("input", { className: "w-full p-2 bg-black/60 border-2 border-black vt-font", value: String(editing[k] ?? ""), onChange: (e) => setEditing({ ...editing, [k]: e.target.value }) })] }, k))), ["price", "atk"].map((k) => (_jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "text-xs pixel-font text-white/60", children: k }), _jsx("input", { type: "number", className: "w-full p-2 bg-black/60 border-2 border-black vt-font", value: editing[k], onChange: (e) => setEditing({ ...editing, [k]: parseInt(e.target.value || "0") }) })] }, k))), _jsxs("label", { className: "flex items-center gap-2 vt-font", children: [_jsx("input", { type: "checkbox", checked: editing.enabled, onChange: (e) => setEditing({ ...editing, enabled: e.target.checked }) }), "\u542F\u7528"] }), _jsxs("div", { className: "flex gap-2 mt-3", children: [_jsx("button", { className: "pixel-btn primary flex-1", onClick: () => save(editing), children: "\u4FDD\u5B58" }), _jsx("button", { className: "pixel-btn flex-1", onClick: () => setEditing(null), children: "\u53D6\u6D88" })] })] }) }))] }));
}
