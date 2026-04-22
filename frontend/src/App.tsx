import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./state/auth";
import { useGame } from "./state/game";
import SakuraLayer from "./components/SakuraLayer";
import SceneBackground from "./components/SceneBackground";

export default function App() {
  const { token, logout } = useAuth();
  const { refreshMe, refreshStatus, refreshManifest, user } = useGame();
  const nav = useNavigate();

  useEffect(() => {
    if (!token) {
      nav("/login", { replace: true });
      return;
    }
    refreshMe().catch(() => {
      logout();
      nav("/login", { replace: true });
    });
    refreshManifest();
    refreshStatus();
    const iv = setInterval(() => refreshStatus(), 30_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-bgdark text-white">
      <SceneBackground />
      {user?.gender === "female" && <SakuraLayer light />}
      <div className="relative z-10 h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}
