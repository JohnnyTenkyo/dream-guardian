import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import BottomNav from "../components/BottomNav";
import TopBar from "../components/TopBar";
import { useAuth } from "../state/auth";
import { useGame } from "../state/game";

export default function SettingsPage() {
  const { user, refreshMe } = useGame();
  const { logout } = useAuth();
  const nav = useNavigate();
  const [oldp, setOldp] = useState("");
  const [newp, setNewp] = useState("");
  const [toast, setToast] = useState("");
  const [nick, setNick] = useState(user?.nickname ?? "");
  const [title, setTitle] = useState(user?.title ?? "");
  const [gender, setGender] = useState(user?.gender ?? "other");

  async function changePw() {
    try {
      await api("/api/auth/change_password", { method: "POST", body: { old_password: oldp, new_password: newp } });
      setToast("密码已修改"); setOldp(""); setNewp("");
    } catch (e) { setToast((e as ApiError).message); }
    setTimeout(() => setToast(""), 2500);
  }
  async function saveProfile() {
    await api("/api/profile", { method: "PATCH", body: { nickname: nick, title, gender } });
    await refreshMe();
    setToast("已保存");
    setTimeout(() => setToast(""), 2000);
  }
  function doLogout() {
    logout();
    nav("/login", { replace: true });
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <div className="mx-2 mt-2 panel p-3">
        <div className="pixel-font text-xs text-gold mb-2">⚙ 设置</div>
        <div className="space-y-2">
          <div>
            <label className="text-xs pixel-font text-white/60">昵称</label>
            <input className="w-full p-2 bg-black/60 border-2 border-black vt-font text-lg"
              value={nick} onChange={(e) => setNick(e.target.value)} />
          </div>
          <div>
            <label className="text-xs pixel-font text-white/60">称号</label>
            <input className="w-full p-2 bg-black/60 border-2 border-black vt-font text-lg"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs pixel-font text-white/60">性别（用于樱花经期日历可见性）</label>
            <select className="w-full p-2 bg-black/60 border-2 border-black vt-font text-lg"
              value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="other">不透露</option>
              <option value="female">女性</option>
              <option value="male">男性</option>
            </select>
          </div>
          <button className="pixel-btn primary w-full" onClick={saveProfile}>保存资料</button>
        </div>
        <hr className="my-4 border-white/10" />
        <div className="pixel-font text-xs text-gold mb-2">🔑 修改密码</div>
        <input type="password" placeholder="旧密码" className="w-full p-2 mb-2 bg-black/60 border-2 border-black vt-font text-lg"
          value={oldp} onChange={(e) => setOldp(e.target.value)} />
        <input type="password" placeholder="新密码" className="w-full p-2 mb-2 bg-black/60 border-2 border-black vt-font text-lg"
          value={newp} onChange={(e) => setNewp(e.target.value)} />
        <button className="pixel-btn w-full" onClick={changePw}>修改密码</button>
        <hr className="my-4 border-white/10" />
        <button className="pixel-btn danger w-full" onClick={doLogout}>退出登录</button>
        {toast && <div className="mt-2 vt-font text-center text-gold">{toast}</div>}
      </div>
      <BottomNav />
    </div>
  );
}
