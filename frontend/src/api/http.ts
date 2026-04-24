/**
 * Camada fina de transporte. As fachadas em `api/*.ts` usam este cliente.
 */
const TOKEN = "me_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN);
}

export function setToken(t: string | null): void {
  if (t) {
    localStorage.setItem(TOKEN, t);
  } else {
    localStorage.removeItem(TOKEN);
  }
}

const base = import.meta.env.VITE_API_BASE ?? "";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const h = new Headers(init.headers);
  h.set("Content-Type", "application/json");
  const tok = getToken();
  if (tok) {
    h.set("Authorization", `Bearer ${tok}`);
  }
  const res = await fetch(`${base}${path}`, { ...init, headers: h });
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const err = (data as { erro?: string })?.erro ?? res.statusText;
    throw new Error(err);
  }
  return data as T;
}
