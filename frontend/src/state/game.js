import { create } from "zustand";
import { api } from "../api";
export const useGame = create((set) => ({
    user: null,
    status: null,
    manifest: null,
    setUser: (u) => set({ user: u }),
    refreshMe: async () => {
        const me = await api("/api/auth/me");
        set({ user: me });
    },
    refreshStatus: async () => {
        const s = await api("/api/status");
        set({ status: s });
    },
    refreshManifest: async () => {
        const m = await api("/api/manifest");
        set({ manifest: m });
    },
}));
