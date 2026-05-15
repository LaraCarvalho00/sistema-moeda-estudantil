import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { TipoPerfil } from "@/api/types";
import { useAuth } from "@/features/auth/AuthContext";

type Props = {
  perfis: readonly TipoPerfil[];
  children: ReactNode;
};

/** Só monta `children` se o utilizador autenticado tiver um dos perfis (evita chamadas à API sem permissão). */
export function RequirePerfis({ perfis, children }: Props) {
  const { usuario, carregando } = useAuth();
  if (carregando) {
    return (
      <p className="py-10 text-center text-gray-500">Carregando…</p>
    );
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (!perfis.includes(usuario.perfil)) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
