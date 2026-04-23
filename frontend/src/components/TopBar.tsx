import { useGame } from "../state/game";
import { apiUrl } from "../api";

export default function TopBar() {
  const { user, status } = useGame();
  if (!user) return null;
  const frameImg = user.equipped_frame
    ? apiUrl(
        useGame.getState().manifest?.frames.find((f) => f.slug === user.equipped_frame)?.image ?? "",
      )
    : null;
  const charImg = apiUrl(`/characters/${user.active_character}/${user.active_character}_walk.webp`);
  return (
    <div className="panel mx-2 mt-2 px-3 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 bg-black border-2 border-black flex items-center justify-center overflow-hidden">
          {frameImg && (
            <img src={frameImg} alt="" className="absolute inset-0 w-full h-full object-contain" />
          )}
          <img src={charImg} alt="" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <div className="pixel-font text-xs text-gold">{user.nickname || user.username}</div>
          <div className="vt-font text-sm text-white/80">LV.{Math.max(1, Math.floor(user.streak / 3) + 1)} · {user.title}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="pixel-font text-xs text-gold">💰 {user.coins}</div>
        <div className="vt-font text-sm text-white/80">🔥 {user.streak}天 · {status?.timezone_name ?? ""}</div>
      </div>
    </div>
  );
}
