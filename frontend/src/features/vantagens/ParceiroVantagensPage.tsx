import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { vantagensFachada } from "@/api/vantagensFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Vantagem } from "@/api/types";

export function ParceiroVantagensPage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [lista, setLista] = useState<Vantagem[]>([]);
  const [tit, setTit] = useState("");
  const [desc, setDesc] = useState("");
  const [custo, setCusto] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const d = await vantagensFachada.minhasComoParceiro();
    setLista(d);
  }, []);

  useEffect(() => {
    if (usuario?.perfil === "PARCEIRO") {
      void (async () => {
        try {
          await carregar();
        } catch (e) {
          setErro(e instanceof Error ? e.message : "Falha");
        }
      })();
    }
  }, [carregar, usuario?.perfil]);

  if (carregando) {
    return <p className="text-slate-500">…</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "PARCEIRO") {
    return <Navigate to="/app" replace />;
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await vantagensFachada.criarVantagem({
        titulo: tit,
        descricao: desc,
        custoEmMoedas: custo,
        fotoUrl: "",
      });
      setTit("");
      setDesc("");
      setCusto(1);
      await carregar();
      await atualizar();
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro");
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Vantagens do parceiro</h1>
      {erro && <p className="mb-2 text-rose-400">{erro}</p>}

      <form onSubmit={criar} className="mb-8 space-y-2 rounded border border-slate-800 p-4">
        <h2 className="font-medium">Nova vantagem (US05)</h2>
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Título"
          value={tit}
          onChange={(e) => setTit(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Descrição"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          rows={2}
        />
        <input
          type="number"
          min={1}
          className="w-full max-w-xs rounded border border-slate-700 bg-slate-900 px-3 py-2"
          value={custo}
          onChange={(e) => setCusto(Number(e.target.value))}
        />
        <button
          type="submit"
          className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Publicar
        </button>
      </form>

      <ul className="space-y-2">
        {lista.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between border-b border-slate-800 py-2"
          >
            <div>
              <p className="font-medium">{v.titulo}</p>
              <p className="text-sm text-slate-500">{v.custoEmMoedas} moedas</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Remover?")) {
                  try {
                    await vantagensFachada.excluir(v.id);
                    await carregar();
                  } catch (e) {
                    setErro(e instanceof Error ? e.message : "Erro");
                  }
                }
              }}
              className="text-rose-400/90"
            >
              excluir
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4">
        <Link to="/app" className="text-amber-400">
          Painel
        </Link>
      </p>
    </div>
  );
}
