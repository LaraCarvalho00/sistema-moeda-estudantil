import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { vantagensFachada } from "@/api/vantagensFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Vantagem } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";

const inputClass =
  "input-modern px-4 py-3 placeholder:text-gray-400 disabled:opacity-60";

function limparFormulario() {
  return { tit: "", desc: "", custo: 1 };
}

export function ParceiroVantagensPage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [lista, setLista] = useState<Vantagem[]>([]);
  const [tit, setTit] = useState("");
  const [desc, setDesc] = useState("");
  const [custo, setCusto] = useState(1);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [listaCarregando, setListaCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const d = await vantagensFachada.minhasComoParceiro();
    setLista(d);
  }, []);

  useEffect(() => {
    if (usuario?.perfil !== "PARCEIRO") return;
    void (async () => {
      setListaCarregando(true);
      setErro(null);
      try {
        await carregar();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha ao carregar ofertas.");
      } finally {
        setListaCarregando(false);
      }
    })();
  }, [carregar, usuario?.perfil]);

  if (carregando) {
    return (
      <p className="py-10 text-center text-gray-500">Carregando ofertas…</p>
    );
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  function iniciarEdicao(v: Vantagem) {
    setErro(null);
    setEditandoId(v.id);
    setTit(v.titulo);
    setDesc(v.descricao);
    setCusto(v.custoEmMoedas);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    const z = limparFormulario();
    setTit(z.tit);
    setDesc(z.desc);
    setCusto(z.custo);
    setErro(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const custoNum = Math.floor(Number(custo));
    if (!Number.isFinite(custoNum) || custoNum < 1) {
      setErro("Indique um custo em moedas maior ou igual a 1.");
      return;
    }
    setSalvando(true);
    try {
      const payload = {
        titulo: tit.trim(),
        descricao: desc.trim(),
        custoEmMoedas: custoNum,
        fotoUrl: "",
      };
      if (editandoId != null) {
        await vantagensFachada.atualizarVantagem(editandoId, payload);
        cancelarEdicao();
      } else {
        await vantagensFachada.criarVantagem(payload);
        const z = limparFormulario();
        setTit(z.tit);
        setDesc(z.desc);
        setCusto(z.custo);
      }
      await carregar();
      await atualizar();
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Não foi possível guardar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-soft-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7817d6]">
            Parceiro
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">
            Gerir ofertas
          </h1>
          <p className="mt-2 max-w-xl text-slate-500">
            Publique vantagens para os alunos resgatarem com moedas. Pode editar
            título, descrição ou custo a qualquer momento.
          </p>
        </div>
        <VoltarLink className="shrink-0 self-start sm:mt-1" />
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {erro}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <section className="lg:col-span-5">
          <form
            onSubmit={enviar}
            className="app-card-solid space-y-5 rounded-[2rem] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold text-slate-950">
                {editandoId != null ? "Editar oferta" : "Nova oferta"}
              </h2>
              {editandoId != null && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="text-sm font-semibold text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            {editandoId != null && (
              <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-medium text-[#5a078f]">
                A alterar a oferta n.º {editandoId}. As mudanças refletem-se de
                imediato na loja dos alunos.
              </p>
            )}

            <label className="block text-sm font-semibold text-gray-700">
              Título
              <input
                className={`${inputClass} mt-1.5`}
                placeholder="Ex.: Café cortesia"
                value={tit}
                onChange={(e) => setTit(e.target.value)}
                required
                maxLength={120}
                autoComplete="off"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-1">
              <label className="block text-sm font-semibold text-gray-700">
                Custo em moedas
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  className={`${inputClass} mt-1.5 text-lg font-semibold tabular-nums sm:max-w-[220px]`}
                  value={custo}
                  onChange={(e) => setCusto(Number(e.target.value))}
                  required
                  aria-describedby="hint-custo"
                />
                <span
                  id="hint-custo"
                  className="mt-1.5 block text-xs text-gray-500"
                >
                  Valor debitado ao aluno no resgate (mínimo 1 moeda).
                </span>
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Descrição
              <textarea
                className={`${inputClass} mt-1.5 min-h-[100px] resize-y`}
                placeholder="Benefício, validade, como usar o cupão ou código no estabelecimento."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                rows={4}
                maxLength={2000}
              />
            </label>

            <button
              type="submit"
              disabled={salvando}
              className="btn-primary w-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {salvando
                ? "A guardar…"
                : editandoId != null
                  ? "Guardar alterações"
                  : "Publicar oferta"}
            </button>
          </form>
        </section>

        <section className="lg:col-span-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              As suas ofertas
            </h3>
            {listaCarregando && (
              <span className="text-xs text-gray-400">A atualizar…</span>
            )}
          </div>

          <ul className="space-y-3">
            {listaCarregando && lista.length === 0 && (
              <li className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
                A carregar as suas ofertas…
              </li>
            )}
            {!listaCarregando && lista.length === 0 && (
              <li className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-6 py-12 text-center text-sm text-gray-500">
                Ainda não publicou nenhuma oferta. Use o formulário para criar
                a primeira.
              </li>
            )}
            {lista.map((v) => (
              <li
                key={v.id}
                className={`app-card-solid rounded-2xl border p-5 transition-colors ${
                  editandoId === v.id
                    ? "border-[#820AD1] ring-1 ring-[#820AD1]/25"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-gray-900">
                        {v.titulo}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#820AD1]">
                        {v.custoEmMoedas}{" "}
                        {v.custoEmMoedas === 1 ? "moeda" : "moedas"}
                      </span>
                    </div>
                    {v.descricao?.trim() ? (
                      <p className="text-sm leading-relaxed text-gray-600 line-clamp-4 whitespace-pre-wrap">
                        {v.descricao}
                      </p>
                    ) : (
                      <p className="text-sm italic text-gray-400">
                        Sem descrição.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(v)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#820AD1] hover:text-[#820AD1]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Remover esta oferta? Os alunos deixam de vê-la na loja.",
                          )
                        ) {
                          return;
                        }
                        setErro(null);
                        try {
                          await vantagensFachada.excluir(v.id);
                          if (editandoId === v.id) cancelarEdicao();
                          await carregar();
                        } catch (err) {
                          setErro(
                            err instanceof Error
                              ? err.message
                              : "Não foi possível excluir.",
                          );
                        }
                      }}
                      className="rounded-xl px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
