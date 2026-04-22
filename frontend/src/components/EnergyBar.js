import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function EnergyBar({ value }) {
    const neg = value < 0;
    const pct = Math.max(0, Math.min(100, Math.abs(value)));
    return (_jsxs("div", { className: "mx-2 mt-2", children: [_jsxs("div", { className: "flex items-center justify-between pixel-font text-xs mb-1", children: [_jsx("span", { className: neg ? "text-danger animate-flicker" : "text-gold", children: neg ? "⚠能量崩溃" : "⚡能量" }), _jsxs("span", { className: neg ? "text-danger animate-flicker vt-font text-lg" : "text-gold vt-font text-lg", children: [value, "%"] })] }), _jsx("div", { className: "energy-track", children: _jsx("div", { className: `energy-fill ${neg ? "neg" : ""}`, style: { width: `${pct}%` } }) })] }));
}
