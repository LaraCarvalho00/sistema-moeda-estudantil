import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { vantagensFachada } from "@/api/vantagensFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Vantagem } from "@/api/types";

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
    return <div className="flex justify-center py-10 text-gray-400">Carregando vantagens...</div>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "ALUNO") {
    return <Navigate to="/app" replace />;
  }

  async function resgatar(v: Vantagem) {
    setMsg(null);
    setErro(null);
  if (v.custoEmMoedas > (usuario?.saldoMoedas ?? 0)) {      
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header da Vitrine */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vantagens</h1>
          <p className="text-gray-500">Troque suas moedas por benefícios exclusivos</p>
        </div>
        <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100">
          <span className="text-sm text-gray-600 font-medium">Seu saldo: </span>
          <span className="text-lg font-bold text-[#820AD1]">{usuario.saldoMoedas} moedas</span>
        </div>
      </div>

      {/* Alertas de Mensagem/Erro */}
      {msg && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl font-bold text-center animate-bounce">
          {msg}
        </div>
      )}
      {erro && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-medium text-center">
          {erro}
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {lista.map((v) => (
          <div
            key={v.id}
            className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-[#820AD1] transition-colors">
                  {v.titulo}
                </h2>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                  {v.parceiroNome}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                {v.descricao}
              </p>

              {v.fotoUrl && (
                <div className="mb-4 h-32 w-full bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                   <span className="text-gray-300 text-xs italic">Espaço para imagem: {v.fotoUrl}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Custo</p>
                <p className="text-lg font-black text-gray-900">{v.custoEmMoedas} moedas</p>
              </div>
              <button
                type="button"
                onClick={() => resgatar(v)}
                className="bg-[#820AD1] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[#6D08B1] active:scale-95 transition-all"
              >
                Resgatar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Link to="/app" className="text-sm font-bold text-gray-400 hover:text-[#820AD1] transition-colors">
          ← Voltar ao painel
        </Link>
      </div>
    </div>
  );
}