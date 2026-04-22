import { useMemo } from "react";

export default function SakuraLayer({ light = false }: { light?: boolean }) {
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

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.key}
          className="sakura-petal"
          style={{
            left: `${p.left}%`,
            top: `-${Math.random() * 10}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
