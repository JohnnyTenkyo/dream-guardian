import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const SCENES = [
    { name: "长城", sky: ["#0f1b3a", "#2c3a6b"] },
    { name: "富士山", sky: ["#1a1f3a", "#3c2a60"] },
    { name: "自由女神", sky: ["#2a3055", "#4b3a7a"] },
    { name: "柏林墙", sky: ["#201a3a", "#3a2a55"] },
];
function phaseFromHour(h) {
    if (h >= 6 && h < 10)
        return "dawn";
    if (h >= 10 && h < 17)
        return "day";
    if (h >= 17 && h < 20)
        return "dusk";
    return "night";
}
function phaseColors(phase) {
    switch (phase) {
        case "dawn": return ["#ff9a6d", "#2a3055"];
        case "day": return ["#88b7ff", "#3c7fbf"];
        case "dusk": return ["#ff7a4c", "#3a2260"];
        default: return ["#0c1020", "#1a1c29"];
    }
}
export default function SceneBackground() {
    const [phase, setPhase] = useState(() => phaseFromHour(new Date().getHours()));
    const [scene, setScene] = useState(() => SCENES[new Date().getDate() % SCENES.length]);
    useEffect(() => {
        const iv = setInterval(() => {
            setPhase(phaseFromHour(new Date().getHours()));
            setScene(SCENES[new Date().getDate() % SCENES.length]);
        }, 60000);
        return () => clearInterval(iv);
    }, []);
    const [c1, c2] = phaseColors(phase);
    const [a, b] = scene.sky;
    return (_jsxs("div", { className: "absolute inset-0 z-0", children: [_jsx("div", { className: "absolute inset-0", style: { background: `linear-gradient(180deg, ${c1} 0%, ${c2} 60%, ${a} 80%, ${b} 100%)` } }), phase === "night" && (_jsx("div", { className: "absolute inset-0 opacity-70", style: {
                    backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(1px 1px at 250px 50px, #fff, transparent),
            radial-gradient(1px 1px at 370px 120px, #fff, transparent),
            radial-gradient(1px 1px at 500px 40px, #fff, transparent),
            radial-gradient(1px 1px at 600px 150px, #fff, transparent)
          `,
                    backgroundRepeat: "repeat",
                    backgroundSize: "700px 200px",
                } })), _jsx("div", { className: "absolute left-0 right-0", style: { bottom: "22%", height: "30%" }, children: _jsx(LandmarkSilhouette, { name: scene.name }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-[22%] ground-strip" }), _jsxs("div", { className: "absolute top-1 right-2 text-[10px] pixel-font opacity-50", children: [scene.name, " \u00B7 ", phase] })] }));
}
function LandmarkSilhouette({ name }) {
    const color = "#0b0f1f";
    return (_jsxs("svg", { viewBox: "0 0 400 120", preserveAspectRatio: "none", className: "w-full h-full opacity-80", children: [name === "长城" && (_jsxs("g", { fill: color, children: [Array.from({ length: 10 }).map((_, i) => (_jsx("rect", { x: i * 40, y: 60, width: 30, height: 60 }, i))), Array.from({ length: 10 }).map((_, i) => (_jsx("rect", { x: i * 40 + 6, y: 46, width: 18, height: 14 }, "t" + i)))] })), name === "富士山" && (_jsxs("g", { fill: color, children: [_jsx("polygon", { points: "50,120 200,20 350,120" }), _jsx("polygon", { points: "170,52 230,52 210,36 190,36", fill: "#ffffff", opacity: "0.8" })] })), name === "自由女神" && (_jsxs("g", { fill: color, children: [_jsx("rect", { x: "180", y: "20", width: "40", height: "80" }), _jsx("polygon", { points: "170,20 230,20 200,-10" }), _jsx("rect", { x: "160", y: "95", width: "80", height: "25" })] })), name === "柏林墙" && (_jsxs("g", { fill: color, children: [_jsx("rect", { x: "0", y: "70", width: "400", height: "50" }), _jsx("rect", { x: "40", y: "60", width: "20", height: "10" }), _jsx("rect", { x: "100", y: "60", width: "20", height: "10" }), _jsx("rect", { x: "160", y: "60", width: "20", height: "10" }), _jsx("rect", { x: "220", y: "60", width: "20", height: "10" }), _jsx("rect", { x: "280", y: "60", width: "20", height: "10" }), _jsx("rect", { x: "340", y: "60", width: "20", height: "10" })] }))] }));
}
