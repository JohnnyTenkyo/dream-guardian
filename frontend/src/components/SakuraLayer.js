import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
export default function SakuraLayer({ light = false }) {
    const petals = useMemo(() => {
        const count = light ? 24 : 60;
        return Array.from({ length: count }, (_, i) => ({
            left: Math.random() * 100,
            delay: Math.random() * -10,
            dur: 6 + Math.random() * 8,
            size: 6 + Math.floor(Math.random() * 8),
            key: i,
        }));
    }, [light]);
    return (_jsx("div", { className: "pointer-events-none fixed inset-0 z-[5] overflow-hidden", children: petals.map((p) => (_jsx("span", { className: "sakura-petal", style: {
                left: `${p.left}%`,
                top: `-${Math.random() * 10}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
            } }, p.key))) }));
}
