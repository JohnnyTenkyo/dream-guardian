import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, api } from "../api";
import { useAuth } from "../state/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("other");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminPanel, setAdminPanel] = useState(false);
  const { setToken } = useAuth();
  const nav = useNavigate();
  const pressRef = useRef<number | null>(null);

  useEffect(() => {
    const tok = localStorage.getItem("dg_token");
    if (tok) nav("/", { replace: true });
  }, [nav]);

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") {
        const r = await api<{ token: string; is_admin: boolean }>("/api/auth/login", {
          method: "POST",
          body: { username, password },
        });
        setToken(r.token, r.is_admin);
        nav(r.is_admin ? "/admin" : "/", { replace: true });
      } else {
        const r = await api<{ token: string }>("/api/auth/register", {
          method: "POST",
          body: { username, password, gender },
        });
        setToken(r.token, false);
        nav("/", { replace: true });
      }
    } catch (e) {
      setErr((e as ApiError).message || "失败");
    } finally {
      setBusy(false);
    }
  }

  async function adminLogin() {
    setErr("");
    setBusy(true);
    try {
      const r = await api<{ token: string; is_admin: boolean }>("/api/auth/admin_login", {
        method: "POST",
        body: { username, password },
      });
      setToken(r.token, true);
      nav("/admin", { replace: true });
    } catch (e) {
      setErr((e as ApiError).message || "管理员登录失败");
    } finally {
      setBusy(false);
    }
  }

  function startHidden() {
    pressRef.current = window.setTimeout(() => setAdminPanel(true), 1500);
  }
  function clearHidden() {
    if (pressRef.current) window.clearTimeout(pressRef.current);
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-bgdark">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #2b2f55 0%, #1a1c29 60%, #0c0d16 100%)",
        }}
      />
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="panel w-full max-w-sm p-5 text-white">
          <h1 className="pixel-font text-xl text-gold mb-2 text-center">梦境守护者</h1>
          <div className="vt-font text-center text-white/70 mb-4 text-sm">
            {mode === "login" ? "请登录继续" : "注册新账号"}
          </div>
          <label className="block text-xs mb-1 pixel-font text-white/60">用户名</label>
          <input
            className="w-full p-2 mb-3 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label className="block text-xs mb-1 pixel-font text-white/60">密码</label>
          <input
            type="password"
            className="w-full p-2 mb-3 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {mode === "register" && (
            <div className="mb-3">
              <label className="block text-xs mb-1 pixel-font text-white/60">性别（用于樱花经期日历可见性）</label>
              <select
                className="w-full p-2 bg-black/60 border-2 border-black text-white vt-font text-lg focus:outline-none focus:border-gold"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="other">不透露</option>
                <option value="female">女性</option>
                <option value="male">男性</option>
              </select>
            </div>
          )}
          {err && <div className="text-danger text-sm vt-font mb-2">{err}</div>}
          <button className="pixel-btn primary w-full mb-2" disabled={busy} onClick={submit}>
            {busy ? "..." : mode === "login" ? "登录" : "注册"}
          </button>
          <button
            className="pixel-btn w-full"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            切换到{mode === "login" ? "注册" : "登录"}
          </button>
          <div
            onMouseDown={startHidden}
            onTouchStart={startHidden}
            onMouseUp={clearHidden}
            onMouseLeave={clearHidden}
            onTouchEnd={clearHidden}
            className="mt-8 h-6 w-full cursor-default flex items-end justify-center"
            aria-hidden
            title="长按 1.5 秒显示管理员入口"
          >
            <div className="h-1 w-10 bg-white/10 rounded" />
          </div>
          {adminPanel && (
            <div className="mt-4 p-3 border-2 border-black bg-black/60">
              <div className="pixel-font text-xs text-gold mb-2">管理员通道</div>
              <button className="pixel-btn w-full" onClick={adminLogin}>
                以管理员身份登录
              </button>
              <div className="vt-font text-xs text-white/50 mt-2">默认 admin / 123456</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
