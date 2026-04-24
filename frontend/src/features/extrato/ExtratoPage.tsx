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
    if (!usuario) {
      return;
    }
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

  if (carregando) {
    return <p className="text-slate-500">…</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (erro) {
    return <p className="text-rose-400">{erro}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Extrato</h1>
        <Link className="text-sm text-amber-400" to="/app">
          Painel
        </Link>
      </div>
      {itens.length === 0 ? (
        <p className="text-slate-500">Nenhuma transação ainda.</p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded border border-slate-800">
          {itens.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:justify-between"
            >
              <div>
                <span
                  className={
                    t.tipo === "ENVIO"
                      ? "text-sky-400/90"
                      : "text-emerald-400/90"
                  }
                >
                  {t.tipo}
                </span>
                {t.cupom && (
                  <span className="ml-2 text-xs text-slate-500">
                    Cupom: {t.cupom}
                  </span>
                )}
                <p className="text-sm text-slate-500">{t.mensagem}</p>
                {t.contatoRelacionado && (
                  <p className="text-xs text-slate-600">
                    {t.contatoRelacionado}
                  </p>
                )}
              </div>
              <div className="whitespace-nowrap text-right text-slate-200">
                {t.quantidade} moedas
                {t.criadoEm && (
                  <p className="text-xs text-slate-500">
                    {new Date(t.criadoEm).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
