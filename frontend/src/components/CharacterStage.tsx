import { useEffect, useState } from "react";
import { apiUrl } from "../api";
import { useGame } from "../state/game";

interface Props { sleeping?: boolean; }

export default function CharacterStage({ sleeping = false }: Props) {
  const { user, manifest } = useGame();
  const [offset, setOffset] = useState(0);
  const activity = sleeping ? "sleep" : user?.active_activity ?? "walk";
  const slug = user?.active_character ?? "snoopy";
  const gemImg = user?.equipped_gem
    ? apiUrl(manifest?.gems.find((g) => g.slug === user.equipped_gem)?.image ?? "")
    : null;

  const scrolling = activity === "walk" || activity === "run";
  const speed = activity === "run" ? 3 : 1.2;

  useEffect(() => {
    if (!scrolling) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 16.6;
      last = t;
      setOffset((o) => (o + dt * speed) % 128);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrolling, speed]);

  const charUrl = apiUrl(`/characters/${slug}/${slug}_${activity}.webp`);

  return (
    <div className="relative mx-2 mt-2 border-2 border-black bg-panel/50 overflow-hidden" style={{ aspectRatio: "16/10" }}>
      {/* scrolling ground */}
      <div
        className="absolute left-0 right-0 bottom-0 h-16 ground-strip"
        style={{ transform: `translateX(-${offset}px)`, width: "200%" }}
      />
      {/* sparkle */}
      <div className="absolute top-4 right-6 text-yellow-200 animate-float">✨</div>
      {/* character */}
      <div className="absolute left-[48%] bottom-8 -translate-x-1/2">
        <div className="relative char-glow w-40 h-40 flex items-end justify-center">
          <img src={charUrl} alt="" className="w-40 h-40 object-contain" />
          {gemImg && !sleeping && (
            <img
              src={gemImg}
              alt=""
              className="absolute -top-4 -right-6 w-12 h-12 animate-float drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            />
          )}
          {sleeping && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-zzz">💤</div>
          )}
        </div>
      </div>
    </div>
  );
}
