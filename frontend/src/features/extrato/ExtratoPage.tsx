import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { moedasFachada } from "@/api/moedasFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { TransacaoResumo } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";
import { CoinBadge } from "@/components/FeedbackAnimations";

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

  if (carregando) return <p className="text-slate-500">Carregando extrato...</p>;
  if (!usuario) return <Navigate to="/entrar" replace />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-soft-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7817d6]">
            Movimentacoes
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-slate-950">
            Extrato
          </h1>
        </div>
        <VoltarLink />
      </div>

      {erro && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
          {erro}
        </div>
      )}

      {itens.length === 0 ? (
        <div className="app-card rounded-[2rem] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <CoinBadge className="h-14 w-14" />
          </div>
          <p className="mt-5 font-display text-2xl font-extrabold text-slate-950">
            Nenhuma movimentacao ainda.
          </p>
          <p className="mt-2 text-slate-500">
            Assim que moedas forem enviadas ou vantagens resgatadas, tudo
            aparece aqui.
          </p>
        </div>
      ) : (
        <div className="app-card-solid overflow-hidden rounded-[2rem]">
          <ul className="divide-y divide-slate-100">
            {itens.map((t, index) => {
              const meta = detalhesTransacao(t, usuario.perfil);
              return (
                <li
                  key={t.id}
                  className="grid gap-4 px-5 py-5 transition-colors hover:bg-[#fbf7ef] sm:grid-cols-[auto_1fr_auto]"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.iconClass}`}
                    aria-hidden="true"
                  >
                    {meta.symbol}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-extrabold text-slate-950">
                        {meta.title}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                        {t.tipo}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">
                      {t.contatoRelacionado || "Sistema PUC Coin"}
                    </p>

                    {t.mensagem && (
                      <div className="mt-3 rounded-2xl border-l-4 border-[#f4c74a] bg-[#fff7dc] px-4 py-3">
                        <p className="text-sm italic leading-relaxed text-slate-700">
                          "{t.mensagem}"
                        </p>
                      </div>
                    )}

                    {t.cupom && (
                      <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#7817d6]/15 bg-[#efe2fb] px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4b0d82]">
                          Cupom
                        </span>
                        <span className="font-mono text-sm font-black text-[#4b0d82]">
                          {t.cupom}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className={`font-display text-xl font-extrabold ${meta.amountClass}`}>
                      {meta.prefix}
                      {t.quantidade}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      moedas
                    </p>
                    {t.criadoEm && (
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {new Date(t.criadoEm).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function detalhesTransacao(
  t: TransacaoResumo,
  perfil: "ALUNO" | "PROFESSOR" | "PARCEIRO",
) {
  if (t.tipo === "RESGATE") {
    return {
      title: "Vantagem resgatada",
      prefix: "-",
      symbol: "R",
      amountClass: "text-[#9f5f00]",
      iconClass: "bg-[#fff7dc] text-[#9f5f00]",
    };
  }

  if (perfil === "PROFESSOR") {
    return {
      title: "Moedas enviadas",
      prefix: "-",
      symbol: "-",
      amountClass: "text-slate-950",
      iconClass: "bg-slate-100 text-slate-700",
    };
  }

  return {
    title: "Moedas recebidas",
    prefix: "+",
    symbol: "+",
    amountClass: "text-green-700",
    iconClass: "bg-green-50 text-green-700",
  };
}
