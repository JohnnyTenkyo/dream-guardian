const BASE = import.meta.env.VITE_API_BASE || "";
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
    }
}
function tokenHeader() {
    const t = localStorage.getItem("dg_token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}
export async function api(path, opts = {}) {
    const init = { method: opts.method ?? "GET" };
    const headers = { ...tokenHeader() };
    if (opts.body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(opts.body);
    }
    else if (opts.form) {
        init.body = opts.form;
    }
    init.headers = headers;
    const r = await fetch(`${BASE}${path}`, init);
    if (!r.ok) {
        let msg = r.statusText;
        try {
            const e = await r.json();
            msg = e.detail ?? msg;
        }
        catch {
            // ignore
        }
        throw new ApiError(r.status, msg);
    }
    if (r.status === 204)
        return undefined;
    return (await r.json());
}
export const apiUrl = (path) => `${BASE}${path}`;
