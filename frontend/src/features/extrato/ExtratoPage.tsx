import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { moedasFachada } from "@/api/moedasFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { TransacaoResumo } from "@/api/types";

export function ExtratoPage() {
  const { usuario, carregando } = useAuth();
  const [itens, setItens] = useState<TransacaoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setErro(null);
    try {
      const p = await moedasFachada.extrato(0);
      setItens(p.content);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar");
    }
  }, [usuario]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (carregando) return <p className="text-gray-400">Carregando extrato...</p>;
  if (!usuario) return <Navigate to="/entrar" replace />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <Link 
          className="text-sm font-bold text-[#820AD1] hover:bg-purple-50 px-3 py-1 rounded-full transition-colors" 
          to="/app"
        >
          Voltar
        </Link>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
          {erro}
        </div>
      )}

      {itens.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400">Nenhuma movimentação por aqui ainda. 🌱</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {itens.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                {/* Ícone Indicador de Entrada/Saída */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  t.tipo === "ENVIO" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                }`}>
                  {t.tipo === "ENVIO" ? "↑" : "↓"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {t.tipo === "ENVIO" ? "Transferência enviada" : "Moedas recebidas"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.contatoRelacionado || "Sistema Estudantil"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        t.tipo === "ENVIO" ? "text-gray-900" : "text-green-600"
                      }`}>
                        {t.tipo === "ENVIO" ? `-${t.quantidade}` : `+${t.quantidade}`} moedas
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        {t.criadoEm && new Date(t.criadoEm).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Mensagem da transação */}
                  {t.mensagem && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-200">
                      <p className="text-xs italic text-gray-600">"{t.mensagem}"</p>
                    </div>
                  )}

                  {t.cupom && (
                    <p className="mt-1 text-[10px] font-mono font-bold text-[#820AD1]">
                      CUPOM: {t.cupom}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}