import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function PainelPage() {
  const { usuario, carregando } = useAuth();
  if (carregando) {
    return <p className="text-slate-500">Carregando…</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Olá, {usuario.nome}</h1>
      <p className="text-slate-400">Perfil: {usuario.perfil}</p>
      {usuario.nomeInstituicao && (
        <p className="text-slate-500">Instituição: {usuario.nomeInstituicao}</p>
      )}
      <p className="text-lg text-amber-300/90">Saldo: {usuario.saldoMoedas} moedas</p>
      <ul className="list-inside list-disc text-slate-300">
        {usuario.perfil === "ALUNO" && (
          <li>
            <Link className="text-amber-400" to="/app/loja">
              Resgatar vantagens
            </Link>
          </li>
        )}
        {usuario.perfil === "PROFESSOR" && (
          <li>
            <Link className="text-amber-400" to="/app/enviar">
              Enviar moedas
            </Link>{" "}
            — semestre concede 1000 moedas (US02).
          </li>
        )}
        {usuario.perfil === "PARCEIRO" && (
          <li>
            <Link className="text-amber-400" to="/app/parceiro/vantagens">
              Gerenciar vantagens
            </Link>
          </li>
        )}
        <li>
          <Link to="/app/extrato" className="text-amber-400">
            Ver extrato
          </Link>
        </li>
      </ul>
    </div>
  );
}
