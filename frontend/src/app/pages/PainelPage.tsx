import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function PainelPage() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <p className="text-gray-500">Carregando…</p>;
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Saudação */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Olá, {usuario.nome}</h1>
        <p className="text-gray-500 text-sm">
          {usuario.perfil} {usuario.nomeInstituicao && `• ${usuario.nomeInstituicao}`}
        </p>
      </header>

      {/* Card de Saldo Estilo Nu */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <span className="text-gray-600 font-medium">Saldo em moedas</span>
          <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center">
            <span className="text-[#820AD1] text-xs font-bold">💰</span>
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900">
          {usuario.saldoMoedas}
        </h2>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider font-semibold">
          Moedas estudantis disponíveis
        </p>
      </div>

      {/* Ações Rápidas (Cards) */}
      <div className="grid grid-cols-1 gap-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Ações</h3>
        
        {usuario.perfil === "ALUNO" && (
          <Link 
            to="/app/loja" 
            className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#820AD1] transition-all group"
          >
            <span className="font-bold text-gray-700 group-hover:text-[#820AD1]">Resgatar vantagens</span>
            <span className="text-[#820AD1]">→</span>
          </Link>
        )}

        {usuario.perfil === "PROFESSOR" && (
          <Link 
            to="/app/enviar" 
            className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#820AD1] transition-all group"
          >
            <div>
              <span className="font-bold text-gray-700 group-hover:text-[#820AD1]">Enviar moedas</span>
              <p className="text-xs text-gray-400">Limite semestral disponível</p>
            </div>
            <span className="text-[#820AD1]">→</span>
          </Link>
        )}

        {usuario.perfil === "PARCEIRO" && (
          <Link 
            to="/app/parceiro/vantagens" 
            className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#820AD1] transition-all group"
          >
            <span className="font-bold text-gray-700 group-hover:text-[#820AD1]">Gerenciar ofertas</span>
            <span className="text-[#820AD1]">→</span>
          </Link>
        )}

        <Link 
          to="/app/extrato" 
          className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#820AD1] transition-all group"
        >
          <span className="font-bold text-gray-700 group-hover:text-[#820AD1]">Ver meu extrato</span>
          <span className="text-[#820AD1]">→</span>
        </Link>
      </div>
    </div>
  );
}