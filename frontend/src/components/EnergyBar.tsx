export default function EnergyBar({ value }: { value: number }) {
  const neg = value < 0;
  const pct = Math.max(0, Math.min(100, Math.abs(value)));
  return (
    <div className="mx-2 mt-2">
      <div className="flex items-center justify-between pixel-font text-xs mb-1">
        <span className={neg ? "text-danger animate-flicker" : "text-gold"}>
          {neg ? "⚠能量崩溃" : "⚡能量"}
        </span>
        <span className={neg ? "text-danger animate-flicker vt-font text-lg" : "text-gold vt-font text-lg"}>
          {value}%
        </span>
      </div>
      <div className="energy-track">
        <div className={`energy-fill ${neg ? "neg" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
