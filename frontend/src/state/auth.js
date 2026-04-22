import { create } from "zustand";
export const useAuth = create((set) => ({
    token: typeof localStorage !== "undefined" ? localStorage.getItem("dg_token") : null,
    isAdmin: typeof localStorage !== "undefined" ? localStorage.getItem("dg_admin") === "1" : false,
    setToken: (t, admin = false) => {
        if (t) {
            localStorage.setItem("dg_token", t);
            localStorage.setItem("dg_admin", admin ? "1" : "0");
        }
        else {
            localStorage.removeItem("dg_token");
            localStorage.removeItem("dg_admin");
        }
        set({ token: t, isAdmin: admin });
    },
    logout: () => {
        localStorage.removeItem("dg_token");
        localStorage.removeItem("dg_admin");
        set({ token: null, isAdmin: false });
    },
}));
