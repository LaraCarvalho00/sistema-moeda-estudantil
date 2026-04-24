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
        setErro(e instanceof Error ? e.message : "Falha");
      }
    })();
  }, [carregar]);

  if (carregando) {
    return <p className="text-slate-500">…</p>;
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
    if (v.custoEmMoedas > usuario.saldoMoedas) {
      setErro("Saldo insuficiente.");
      return;
    }
    try {
      const t = await vantagensFachada.resgatarVantagem(v.id);
      setMsg(`Resgate concluído. Cupom: ${t.cupom ?? "—"}`);
      await atualizar();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Vantagens</h1>
      {msg && <p className="mb-2 text-emerald-400">{msg}</p>}
      {erro && <p className="mb-2 text-rose-400">{erro}</p>}
      <p className="mb-4 text-slate-500">Seu saldo: {usuario.saldoMoedas}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {lista.map((v) => (
          <li
            key={v.id}
            className="rounded border border-slate-800 p-4 shadow"
          >
            <h2 className="font-medium text-amber-200/90">{v.titulo}</h2>
            <p className="mt-1 line-clamp-3 text-sm text-slate-400">
              {v.descricao}
            </p>
            {v.fotoUrl && v.fotoUrl.length > 0 && (
              <p className="text-xs text-slate-600">Foto: {v.fotoUrl}</p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {v.parceiroNome} — {v.custoEmMoedas} moedas
            </p>
            <button
              type="button"
              onClick={() => resgatar(v)}
              className="mt-2 rounded bg-emerald-600/90 px-3 py-1.5 text-sm"
            >
              Resgatar
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link to="/app" className="text-amber-400/90">
          Voltar
        </Link>
      </p>
    </div>
  );
}
