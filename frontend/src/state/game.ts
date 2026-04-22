import { create } from "zustand";
import { api } from "../api";

export interface UserOut {
  id: number;
  username: string;
  nickname: string;
  title: string;
  coins: number;
  streak: number;
  active_character: string;
  active_activity: string;
  mood: string;
  equipped_gem: string | null;
  equipped_frame: string | null;
  timezone: string;
  gender: string;
}

export interface StatusOut {
  tz_key: string;
  timezone_name: string;
  local_time: string;
  energy: number;
  sleep_button: boolean;
  boss_open: boolean;
}

export interface ManifestCharacter {
  slug: string;
  name: string;
  animations: Record<string, string>;
}

export interface ManifestData {
  characters: ManifestCharacter[];
  gems: { slug: string; name: string; atk: number; price: number; image: string }[];
  frames: { slug: string; name: string; price: number; image: string }[];
  bosses: { slug: string; name: string; hp: number; image: string }[];
}

interface GameState {
  user: UserOut | null;
  status: StatusOut | null;
  manifest: ManifestData | null;
  setUser: (u: UserOut | null) => void;
  refreshMe: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshManifest: () => Promise<void>;
}

export const useGame = create<GameState>((set) => ({
  user: null,
  status: null,
  manifest: null,
  setUser: (u) => set({ user: u }),
  refreshMe: async () => {
    const me = await api<UserOut>("/api/auth/me");
    set({ user: me });
  },
  refreshStatus: async () => {
    const s = await api<StatusOut>("/api/status");
    set({ status: s });
  },
  refreshManifest: async () => {
    const m = await api<ManifestData>("/api/manifest");
    set({ manifest: m });
  },
}));
