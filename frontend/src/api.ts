const BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function tokenHeader(): Record<string, string> {
  const t = localStorage.getItem("dg_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<T> {
  const init: RequestInit = { method: opts.method ?? "GET" };
  const headers: Record<string, string> = { ...tokenHeader() };
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  } else if (opts.form) {
    init.body = opts.form;
  }
  init.headers = headers;
  const r = await fetch(`${BASE}${path}`, init);
  if (!r.ok) {
    let msg = r.statusText;
    try {
      const e = await r.json();
      msg = (e as { detail?: string }).detail ?? msg;
    } catch {
      // ignore
    }
    throw new ApiError(r.status, msg);
  }
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
}

export const apiUrl = (path: string) => `${BASE}${path}`;
