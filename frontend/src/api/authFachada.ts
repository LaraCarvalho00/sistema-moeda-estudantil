import { apiFetch, setToken } from "./http";
import type { AuthResponse, TipoPerfil, UsuarioSessao } from "./types";

/** Fachada: autenticação (register / login / sessão). */
export const authFachada = {
  async registrar(
    email: string,
    senha: string,
    nome: string,
    perfil: TipoPerfil,
    instituicaoId: number | null,
  ): Promise<AuthResponse> {
    const d = await apiFetch<AuthResponse>("/api/v1/auth/registrar", {
      method: "POST",
      body: JSON.stringify({
        email,
        senha,
        nome,
        perfil,
        instituicaoId: instituicaoId ?? null,
      }),
    });
    setToken(d.accessToken);
    return d;
  },

  async login(email: string, senha: string): Promise<AuthResponse> {
    const d = await apiFetch<AuthResponse>("/api/v1/auth/entrar", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    setToken(d.accessToken);
    return d;
  },

  sair() {
    setToken(null);
  },

  async eu(): Promise<UsuarioSessao> {
    return apiFetch<UsuarioSessao>("/api/v1/auth/eu");
  },
};
