import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { vantagensFachada } from "@/api/vantagensFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Vantagem } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";

export function MarketplacePage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [lista, setLista] = useState<Vantagem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const p = await vantagensFachada.catalogo(0);
    setLista(p.content);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await carregar();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha ao carregar catálogo");
      }
    })();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="flex justify-center py-10 text-gray-400">
        Carregando vantagens...
      </div>
    );
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "ALUNO") {
    return <Navigate to="/app" replace />;
  }

  const aluno = usuario;

  async function resgatar(v: Vantagem) {
    setMsg(null);
    setErro(null);
    if (v.custoEmMoedas > aluno.saldoMoedas) {
      setErro("Saldo insuficiente para este resgate.");
      return;
    }
    try {
      const t = await vantagensFachada.resgatarVantagem(v.id);
      setMsg(`Sucesso! Seu cupom é: ${t.cupom ?? "—"}`);
      await atualizar();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao resgatar");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vantagens</h1>
          <p className="text-gray-500">
            Troque suas moedas por benefícios exclusivos
          </p>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-2">
          <span className="text-sm font-medium text-gray-600">Seu saldo: </span>
          <span className="text-lg font-bold text-[#820AD1]">
            {aluno.saldoMoedas} moedas
          </span>
        </div>
      </div>

      {msg && (
        <div className="animate-bounce rounded-2xl border border-green-100 bg-green-50 p-4 text-center font-bold text-green-700">
          {msg}
        </div>
      )}
      {erro && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center font-medium text-red-600">
          {erro}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {lista.map((v) => (
          <div
            key={v.id}
            className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-[#820AD1]">
                  {v.titulo}
                </h2>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase text-gray-600">
                  {v.parceiroNome}
                </span>
              </div>

              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                {v.descricao}
              </p>

              {v.fotoUrl && (
                <div className="mb-4 flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                  <span className="text-xs italic text-gray-300">
                    Espaço para imagem: {v.fotoUrl}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Custo
                </p>
                <p className="text-lg font-black text-gray-900">
                  {v.custoEmMoedas} moedas
                </p>
              </div>
              <button
                type="button"
                onClick={() => resgatar(v)}
                className="rounded-full bg-[#820AD1] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#6D08B1] active:scale-95"
              >
                Resgatar
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="pt-8 text-center">
        <VoltarLink className="justify-center" />
      </p>
    </div>
  );
}
