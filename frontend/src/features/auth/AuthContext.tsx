import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getToken, setToken } from "@/api/http";
import { authFachada } from "@/api/authFachada";
import type { AuthResponse, UsuarioSessao } from "@/api/types";

function sessaoDeRespostaAuth(d: AuthResponse): UsuarioSessao {
  return {
    id: d.usuarioId,
    email: d.email,
    telefone: d.telefone,
    nome: d.nome,
    perfil: d.perfil,
    instituicaoId: d.instituicaoId,
    nomeInstituicao: d.nomeInstituicao,
    saldoMoedas: d.saldoMoedas,
  };
}

type Ctx = {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  atualizar: () => Promise<void>;
  concluirAutenticacao: (d: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  const atualizar = useCallback(async () => {
    if (!getToken()) {
      setUsuario(null);
      setCarregando(false);
      return;
    }
    try {
      const u = await authFachada.eu();
      setUsuario(u);
    } catch {
      setToken(null);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const concluirAutenticacao = useCallback((d: AuthResponse) => {
    setUsuario(sessaoDeRespostaAuth(d));
    setCarregando(false);
  }, []);

  useEffect(() => {
    void atualizar();
  }, [atualizar]);

  const logout = useCallback(() => {
    authFachada.sair();
    setUsuario(null);
    setCarregando(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, atualizar, concluirAutenticacao, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) {
    throw new Error("useAuth fora do AuthProvider");
  }
  return c;
}
