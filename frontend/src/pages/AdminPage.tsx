import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiUrl } from "../api";
import { useAuth } from "../state/auth";

interface ShopItem {
  slug: string; name: string; type: string; price: number; atk: number; image: string; enabled: boolean;
}

interface UserRow { id: number; username: string; nickname: string; coins: number; streak: number; created_at: string; }

export default function AdminPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editing, setEditing] = useState<ShopItem | null>(null);
  const [uploadCat, setUploadCat] = useState("characters");
  const [uploadRes, setUploadRes] = useState<string | null>(null);
  const { logout } = useAuth();
  const nav = useNavigate();

  async function reload() {
    setItems(await api<ShopItem[]>("/api/admin/shop"));
    setUsers(await api<UserRow[]>("/api/admin/users"));
  }
  useEffect(() => { reload(); }, []);

  async function save(it: ShopItem) {
    await api("/api/admin/shop", { method: "POST", body: it });
    setEditing(null); reload();
  }
  async function del(slug: string) {
    if (!confirm("确认删除？")) return;
    await api(`/api/admin/shop/${slug}`, { method: "DELETE" });
    reload();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("category", uploadCat);
    fd.append("file", f);
    const r = await api<{ url: string }>("/api/admin/upload", { form: fd });
    setUploadRes(r.url);
  }

  function doLogout() {
    logout();
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-full bg-bgdark text-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="pixel-font text-lg text-gold">🛡 管理员后台</div>
        <button className="pixel-btn" onClick={doLogout}>退出</button>
      </div>

      <section className="panel p-3 mb-3">
        <div className="pixel-font text-sm text-gold mb-2">🛒 商店商品</div>
        <button
          className="pixel-btn primary mb-2"
          onClick={() => setEditing({ slug: "", name: "", type: "gem", price: 10, atk: 1, image: "", enabled: true })}
        >+ 新增商品</button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {items.map((it) => (
            <div key={it.slug} className="border-2 border-black bg-black/40 p-2">
              <img src={apiUrl(it.image)} alt="" className="w-full h-20 object-contain" />
              <div className="pixel-font text-[10px]">{it.name}</div>
              <div className="vt-font text-xs text-gold">💰{it.price} · +{it.atk}ATK · {it.type}</div>
              <div className="flex gap-1 mt-1">
                <button className="pixel-btn !py-0.5 !px-1 text-[10px]" onClick={() => setEditing(it)}>编辑</button>
                <button className="pixel-btn danger !py-0.5 !px-1 text-[10px]" onClick={() => del(it.slug)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-3 mb-3">
        <div className="pixel-font text-sm text-gold mb-2">📤 资源上传</div>
        <div className="flex items-center gap-2 mb-2">
          <select className="p-2 bg-black/60 border-2 border-black" value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}>
            <option value="characters">角色 GIF/WebP</option>
            <option value="items">道具（悬浮宝石）</option>
            <option value="frames">头像框</option>
            <option value="bosses">Boss</option>
            <option value="bg">背景</option>
          </select>
          <input type="file" accept=".png,.webp,.gif,.jpg,.jpeg" onChange={handleUpload} />
        </div>
        {uploadRes && <div className="vt-font text-sm text-gold">已上传: <code>{uploadRes}</code></div>}
      </section>

      <section className="panel p-3">
        <div className="pixel-font text-sm text-gold mb-2">👥 用户列表</div>
        <table className="w-full vt-font text-sm">
          <thead>
            <tr className="text-white/60 text-left">
              <th>ID</th><th>用户名</th><th>昵称</th><th>金币</th><th>连续</th><th>注册</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/10">
                <td>{u.id}</td><td>{u.username}</td><td>{u.nickname}</td>
                <td className="text-gold">{u.coins}</td><td>{u.streak}</td>
                <td>{u.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="panel p-3 w-full max-w-md">
            <div className="pixel-font text-sm text-gold mb-2">编辑商品</div>
            {(["slug", "name", "type", "image"] as const).map((k) => (
              <div key={k} className="mb-2">
                <label className="text-xs pixel-font text-white/60">{k}</label>
                <input className="w-full p-2 bg-black/60 border-2 border-black vt-font"
                  value={String((editing as unknown as Record<string, unknown>)[k] ?? "")}
                  onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                />
              </div>
            ))}
            {(["price", "atk"] as const).map((k) => (
              <div key={k} className="mb-2">
                <label className="text-xs pixel-font text-white/60">{k}</label>
                <input type="number" className="w-full p-2 bg-black/60 border-2 border-black vt-font"
                  value={editing[k]}
                  onChange={(e) => setEditing({ ...editing, [k]: parseInt(e.target.value || "0") })}
                />
              </div>
            ))}
            <label className="flex items-center gap-2 vt-font">
              <input type="checkbox" checked={editing.enabled}
                onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
              启用
            </label>
            <div className="flex gap-2 mt-3">
              <button className="pixel-btn primary flex-1" onClick={() => save(editing)}>保存</button>
              <button className="pixel-btn flex-1" onClick={() => setEditing(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
