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

function extrairMensagemDoCorpo(data: unknown): string | null {
  if (data == null || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;

  if (typeof o.erro === "string" && o.erro.trim()) return o.erro.trim();

  if (typeof o.detail === "string" && o.detail.trim()) return o.detail.trim();
  if (typeof o.title === "string" && o.title.trim()) return o.title.trim();
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();

  const errs = o.errors;
  if (Array.isArray(errs) && errs.length > 0) {
    const first = errs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const obj = first as Record<string, unknown>;
      if (typeof obj.defaultMessage === "string") return obj.defaultMessage;
      if (typeof obj.message === "string") return obj.message;
    }
  }
  return null;
}

function mensagemPorStatusHttp(status: number): string {
  if (status === 401) {
    return "Credenciais inválidas ou sessão expirada. Faça login novamente.";
  }
  if (status === 403) {
    return "Você não tem permissão para esta ação.";
  }
  if (status === 404) {
    return "Recurso não encontrado.";
  }
  if (status === 422) {
    return "Não foi possível concluir a operação.";
  }
  if (status === 400) {
    return "Dados inválidos. Verifique os campos informados.";
  }
  if (status === 409) {
    return "Conflito: essa operação não pode ser feita no estado atual.";
  }
  if (status >= 500) {
    return "O servidor encontrou um problema. Tente novamente em alguns instantes.";
  }
  return `Erro na comunicação com o servidor (código ${status}).`;
}

/** Ajusta mensagens técnicas já em PT ou vindas do backend. */
function humanizarTextoSeConhecido(texto: string): string {
  const map: Record<string, string> = {
    "Credenciais inválidas.": "E-mail ou senha incorretos.",
  };
  return map[texto] ?? texto;
}

function montarMensagemErro(
  status: number,
  data: unknown,
  text: string,
  parseOk: boolean,
): string {
  const doCorpo = extrairMensagemDoCorpo(data);
  if (doCorpo) return humanizarTextoSeConhecido(doCorpo);

  if (!parseOk && text) {
    const t = text.trim();
    if (
      t.length > 0 &&
      t.length < 240 &&
      !/^\s*</.test(t) &&
      !t.includes("<!DOCTYPE")
    ) {
      return humanizarTextoSeConhecido(t);
    }
  }

  return mensagemPorStatusHttp(status);
}

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

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers: h });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e se a API está em execução.",
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  let data: unknown = null;
  let parseOk = false;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
      parseOk = true;
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    throw new Error(montarMensagemErro(res.status, data, text, parseOk));
  }
  return data as T;
}
