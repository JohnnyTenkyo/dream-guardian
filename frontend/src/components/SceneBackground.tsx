import { useEffect, useState } from "react";

const SCENES = [
  { name: "长城", sky: ["#0f1b3a", "#2c3a6b"] },
  { name: "富士山", sky: ["#1a1f3a", "#3c2a60"] },
  { name: "自由女神", sky: ["#2a3055", "#4b3a7a"] },
  { name: "柏林墙", sky: ["#201a3a", "#3a2a55"] },
];

function phaseFromHour(h: number) {
  if (h >= 6 && h < 10) return "dawn";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

function phaseColors(phase: string): [string, string] {
  switch (phase) {
    case "dawn": return ["#ff9a6d", "#2a3055"];
    case "day":  return ["#88b7ff", "#3c7fbf"];
    case "dusk": return ["#ff7a4c", "#3a2260"];
    default:     return ["#0c1020", "#1a1c29"];
  }
}

export default function SceneBackground() {
  const [phase, setPhase] = useState(() => phaseFromHour(new Date().getHours()));
  const [scene, setScene] = useState(() => SCENES[new Date().getDate() % SCENES.length]);

  useEffect(() => {
    const iv = setInterval(() => {
      setPhase(phaseFromHour(new Date().getHours()));
      setScene(SCENES[new Date().getDate() % SCENES.length]);
    }, 60_000);
    return () => clearInterval(iv);
  }, []);

  const [c1, c2] = phaseColors(phase);
  const [a, b] = scene.sky;

  return (
    <div className="absolute inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${c1} 0%, ${c2} 60%, ${a} 80%, ${b} 100%)` }}
      />
      {/* Pixel stars (night) / clouds (day) */}
      {phase === "night" && (
        <div className="absolute inset-0 opacity-70" style={{
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
        }} />
      )}
      {/* Landmark silhouette (simple pixel shapes per scene) */}
      <div className="absolute left-0 right-0" style={{ bottom: "22%", height: "30%" }}>
        <LandmarkSilhouette name={scene.name} />
      </div>
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%] ground-strip" />
      {/* Phase title (dev hint) */}
      <div className="absolute top-1 right-2 text-[10px] pixel-font opacity-50">{scene.name} · {phase}</div>
    </div>
  );
}

function LandmarkSilhouette({ name }: { name: string }) {
  const color = "#0b0f1f";
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full opacity-80">
      {name === "长城" && (
        <g fill={color}>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={i * 40} y={60} width={30} height={60} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={"t" + i} x={i * 40 + 6} y={46} width={18} height={14} />
          ))}
        </g>
      )}
      {name === "富士山" && (
        <g fill={color}>
          <polygon points="50,120 200,20 350,120" />
          <polygon points="170,52 230,52 210,36 190,36" fill="#ffffff" opacity="0.8" />
        </g>
      )}
      {name === "自由女神" && (
        <g fill={color}>
          <rect x="180" y="20" width="40" height="80" />
          <polygon points="170,20 230,20 200,-10" />
          <rect x="160" y="95" width="80" height="25" />
        </g>
      )}
      {name === "柏林墙" && (
        <g fill={color}>
          <rect x="0" y="70" width="400" height="50" />
          <rect x="40" y="60" width="20" height="10" />
          <rect x="100" y="60" width="20" height="10" />
          <rect x="160" y="60" width="20" height="10" />
          <rect x="220" y="60" width="20" height="10" />
          <rect x="280" y="60" width="20" height="10" />
          <rect x="340" y="60" width="20" height="10" />
        </g>
      )}
    </svg>
  );
}
