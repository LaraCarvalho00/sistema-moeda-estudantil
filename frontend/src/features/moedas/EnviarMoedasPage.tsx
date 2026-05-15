import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { alunosFachada } from "@/api/alunosFachada";
import { moedasFachada } from "@/api/moedasFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Aluno, Page } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";

const PAGE_SIZE = 25;

function totalPagesDe(p: Page<Aluno>): number {
  if (p.totalPages != null && p.totalPages > 0) return p.totalPages;
  return Math.max(1, Math.ceil(p.totalElements / (p.size || PAGE_SIZE)));
}

export function EnviarMoedasPage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [alunosPage, setAlunosPage] = useState<Page<Aluno> | null>(null);
  const [cacheAlunos, setCacheAlunos] = useState<Record<number, Aluno>>({});
  const [alunoId, setAlunoId] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [buscaInput, setBuscaInput] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [listaCarregando, setListaCarregando] = useState(true);
  /** Valor de `buscaDebounced` na última sincronização de seleção (para detetar mudança de filtro). */
  const buscaAnteriorParaSelecao = useRef<string | null>(null);

  const [q, setQ] = useState(1);
  const [justificativa, setJustificativa] = useState("");
  const [saldoProf, setSaldoProf] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(buscaInput.trim()), 350);
    return () => clearTimeout(t);
  }, [buscaInput]);

  useEffect(() => {
    setPagina(0);
  }, [buscaDebounced]);

  const carregarSaldo = useCallback(async () => {
    const s = await moedasFachada.saldoProfessor();
    setSaldoProf(s);
  }, []);

  const carregarLista = useCallback(async () => {
    setListaCarregando(true);
    setErro(null);
    try {
      const p = await alunosFachada.mesmaInstituicaoDoProfessor(pagina, {
        busca: buscaDebounced || undefined,
        size: PAGE_SIZE,
      });
      setAlunosPage(p);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar alunos.");
    } finally {
      setListaCarregando(false);
    }
  }, [pagina, buscaDebounced]);

  useEffect(() => {
    if (usuario?.perfil !== "PROFESSOR") return;
    void carregarSaldo();
  }, [usuario?.perfil, carregarSaldo]);

  useEffect(() => {
    if (usuario?.perfil !== "PROFESSOR") return;
    void carregarLista();
  }, [usuario?.perfil, carregarLista]);

  useEffect(() => {
    if (!alunosPage) return;
    setCacheAlunos((c) => {
      const n = { ...c };
      for (const a of alunosPage.content) n[a.id] = a;
      return n;
    });
  }, [alunosPage]);

  useEffect(() => {
    if (!alunosPage) return;
    const content = alunosPage.content;
    if (content.length === 0) {
      setAlunoId(0);
      buscaAnteriorParaSelecao.current = buscaDebounced;
      return;
    }
    const first = content[0]!.id;
    const refBusca = buscaAnteriorParaSelecao.current;
    const mudouBusca =
      refBusca !== null && refBusca !== buscaDebounced;
    buscaAnteriorParaSelecao.current = buscaDebounced;

    setAlunoId((id) => {
      if (!id) return first;
      if (content.some((a) => a.id === id)) return id;
      if (mudouBusca) return first;
      return id;
    });
  }, [alunosPage, buscaDebounced]);

  useEffect(() => {
    if (!usuario?.id) return;
    setCacheAlunos({});
    setAlunoId(0);
    setAlunosPage(null);
    buscaAnteriorParaSelecao.current = null;
  }, [usuario?.id]);

  if (carregando) {
    return <p className="text-gray-400">Carregando…</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "PROFESSOR") {
    return <Navigate to="/app" replace />;
  }

  const alunoSelecionado = alunoId ? cacheAlunos[alunoId] : undefined;
  const totalPaginas = alunosPage ? totalPagesDe(alunosPage) : 1;
  const inputClasses =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1]";
  const inputSemMt =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1]";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!alunoId) {
      setErro("Selecione o aluno.");
      return;
    }
    if (!justificativa.trim()) {
      setErro("Justificativa é obrigatória.");
      return;
    }
    setEnviando(true);
    try {
      await moedasFachada.enviar({
        alunoId,
        quantidade: q,
        mensagemJustificativa: justificativa.trim(),
      });
      setJustificativa("");
      setQ(1);
      await carregarLista();
      await carregarSaldo();
      await atualizar();
      alert("Moedas enviadas com sucesso! 🎉");
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Transferir moedas</h1>
        {saldoProf != null && (
          <p className="mt-2 text-gray-500">
            Seu saldo para distribuição:{" "}
            <span className="font-bold text-[#820AD1]">{saldoProf} moedas</span>
          </p>
        )}
      </header>

      {erro && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </div>
      )}

      <form
        onSubmit={enviar}
        className="space-y-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
      >
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-gray-600">
            Para qual aluno?
          </legend>

          <input
            type="search"
            className={inputSemMt}
            placeholder="Pesquisar por nome ou e-mail…"
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            autoComplete="off"
            aria-label="Pesquisar alunos"
          />

          {alunoSelecionado && (
            <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-[#5a078f]">
              <span className="font-semibold">Destinatário:</span>{" "}
              {alunoSelecionado.nome} · {alunoSelecionado.email}
            </p>
          )}

          <div
            role="listbox"
            aria-label="Lista de alunos da instituição"
            className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50"
          >
            {listaCarregando && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                A carregar alunos…
              </p>
            )}
            {!listaCarregando &&
              alunosPage &&
              alunosPage.content.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-gray-500">
                  Nenhum aluno encontrado. Ajuste a pesquisa ou a página.
                </p>
              )}
            {!listaCarregando &&
              alunosPage?.content.map((a) => {
                const sel = a.id === alunoId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={sel}
                    onClick={() => setAlunoId(a.id)}
                    className={`flex w-full flex-col gap-0.5 border-b border-gray-100 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-white ${
                      sel ? "bg-white ring-1 ring-inset ring-[#820AD1]/40" : ""
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{a.nome}</span>
                    <span className="truncate text-xs text-gray-500">{a.email}</span>
                  </button>
                );
              })}
          </div>

          {alunosPage != null && alunosPage.totalElements > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>
                {alunosPage.totalElements}{" "}
                {alunosPage.totalElements === 1 ? "aluno" : "alunos"}
                {buscaDebounced ? " (filtrado)" : ""}
              </span>
              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagina <= 0 || listaCarregando}
                    onClick={() => setPagina((p) => Math.max(0, p - 1))}
                    className="rounded-lg border border-gray-200 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="tabular-nums">
                    {pagina + 1} / {totalPaginas}
                  </span>
                  <button
                    type="button"
                    disabled={
                      pagina >= totalPaginas - 1 || listaCarregando
                    }
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Seguinte
                  </button>
                </div>
              )}
            </div>
          )}
        </fieldset>

        <label className="block text-sm font-bold text-gray-600">
          Quanto quer enviar?
          <input
            type="number"
            min={1}
            className={inputClasses}
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            required
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Por que está enviando?
          <textarea
            className={`${inputClasses} resize-none`}
            placeholder="Ex: Excelente participação na aula de Banco de Dados"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            required
            rows={3}
          />
        </label>

        <button
          type="submit"
          disabled={enviando || !alunoId}
          className="w-full rounded-full bg-[#820AD1] py-4 font-bold text-white shadow-lg transition-all hover:bg-[#6D08B1] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "A enviar…" : "Confirmar envio"}
        </button>
      </form>

      <div className="text-center">
        <VoltarLink className="justify-center" />
      </div>
    </div>
  );
}
