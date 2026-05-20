import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { alunosFachada } from "@/api/alunosFachada";
import { moedasFachada } from "@/api/moedasFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Aluno, Page } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";
import { CoinBadge, CoinBurst } from "@/components/FeedbackAnimations";

const PAGE_SIZE = 25;

type SucessoEnvio = {
  aluno: string;
  quantidade: number;
  saldoApos: number | null;
};

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
  const buscaAnteriorParaSelecao = useRef<string | null>(null);

  const [q, setQ] = useState(1);
  const [justificativa, setJustificativa] = useState("");
  const [saldoProf, setSaldoProf] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<SucessoEnvio | null>(null);
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
    const mudouBusca = refBusca !== null && refBusca !== buscaDebounced;
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
    return <p className="text-slate-500">Carregando...</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "PROFESSOR") {
    return <Navigate to="/app" replace />;
  }

  const alunoSelecionado = alunoId ? cacheAlunos[alunoId] : undefined;
  const totalPaginas = alunosPage ? totalPagesDe(alunosPage) : 1;
  const inputClasses = "input-modern mt-1 px-4 py-3";
  const inputSemMt = "input-modern px-4 py-3";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    if (!alunoId || !alunoSelecionado) {
      setErro("Selecione o aluno.");
      return;
    }
    if (!justificativa.trim()) {
      setErro("Justificativa obrigatoria.");
      return;
    }
    setEnviando(true);
    try {
      await moedasFachada.enviar({
        alunoId,
        quantidade: q,
        mensagemJustificativa: justificativa.trim(),
      });
      setSucesso({
        aluno: alunoSelecionado.nome,
        quantidade: q,
        saldoApos: saldoProf == null ? null : Math.max(0, saldoProf - q),
      });
      setJustificativa("");
      setQ(1);
      await carregarLista();
      await carregarSaldo();
      await atualizar();
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro ao enviar moedas.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-soft-in">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7817d6]">
            Reconhecimento
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-slate-950">
            Enviar moedas
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Recompense participacao, desempenho e atitude com uma justificativa
            que tambem vai para o aluno.
          </p>
        </div>

        <div className="app-card-solid flex items-center gap-4 rounded-3xl px-5 py-4">
          <CoinBadge className="h-12 w-12" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Saldo para envio
            </p>
            <p className="font-display text-2xl font-extrabold text-slate-950 animate-balance-pop">
              {saldoProf ?? usuario.saldoMoedas} moedas
            </p>
          </div>
        </div>
      </div>

      {erro && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-700">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="success-panel rounded-[1.75rem] p-5" key={`${sucesso.aluno}-${sucesso.quantidade}`}>
          <CoinBurst />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
                Moedas enviadas
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-slate-950">
                +{sucesso.quantidade} moedas para {sucesso.aluno}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                O aluno e o professor recebem a confirmacao por e-mail quando o EmailJS estiver ativo.
              </p>
            </div>
            {sucesso.saldoApos != null && (
              <div className="rounded-3xl bg-white px-5 py-4 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Saldo apos
                </p>
                <p className="font-display text-2xl font-extrabold text-slate-950">
                  {sucesso.saldoApos}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form
          onSubmit={enviar}
          className="app-card-solid space-y-5 rounded-[2rem] p-6 sm:p-8"
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Destinatario
            </legend>

            <input
              type="search"
              className={inputSemMt}
              placeholder="Pesquisar por nome ou e-mail..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              autoComplete="off"
              aria-label="Pesquisar alunos"
            />

            {alunoSelecionado && (
              <p className="rounded-2xl bg-[#efe2fb] px-4 py-3 text-sm text-[#4b0d82]">
                <span className="font-black">Selecionado:</span>{" "}
                {alunoSelecionado.nome} - {alunoSelecionado.email}
              </p>
            )}

            <div
              role="listbox"
              aria-label="Lista de alunos da instituicao"
              className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70"
            >
              {listaCarregando && (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  Carregando alunos...
                </p>
              )}
              {!listaCarregando &&
                alunosPage &&
                alunosPage.content.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Nenhum aluno encontrado. Ajuste a pesquisa ou a pagina.
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
                      className={`flex w-full flex-col gap-0.5 border-b border-slate-100 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-white ${
                        sel
                          ? "bg-white shadow-sm ring-1 ring-inset ring-[#7817d6]/40"
                          : ""
                      }`}
                    >
                      <span className="font-bold text-slate-950">{a.nome}</span>
                      <span className="truncate text-xs text-slate-500">{a.email}</span>
                    </button>
                  );
                })}
            </div>

            {alunosPage != null && alunosPage.totalElements > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {alunosPage.totalElements}{" "}
                  {alunosPage.totalElements === 1 ? "aluno" : "alunos"}
                  {buscaDebounced ? " filtrados" : ""}
                </span>
                {totalPaginas > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pagina <= 0 || listaCarregando}
                      onClick={() => setPagina((p) => Math.max(0, p - 1))}
                      className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="tabular-nums">
                      {pagina + 1} / {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={pagina >= totalPaginas - 1 || listaCarregando}
                      onClick={() =>
                        setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                      }
                      className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      Proxima
                    </button>
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <label className="block text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Quantidade
            <input
              type="number"
              min={1}
              className={inputClasses}
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              required
            />
          </label>

          <label className="block text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            Justificativa
            <textarea
              className={`${inputClasses} resize-none`}
              placeholder="Ex: Excelente participacao na aula de Banco de Dados"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              required
              rows={4}
            />
          </label>

          <button
            type="submit"
            disabled={enviando || !alunoId}
            className="btn-primary w-full px-5 py-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Confirmar envio"}
          </button>
        </form>

        <aside className="app-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f4c74a]/35 blur-3xl" />
          <div className="relative z-10">
            <CoinBadge className="h-16 w-16 animate-float-slow" />
            <h2 className="mt-6 font-display text-2xl font-extrabold text-slate-950">
              Envio com impacto
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A justificativa aparece no historico e no e-mail do aluno. Use uma
              mensagem objetiva para registrar o motivo do reconhecimento.
            </p>
            <div className="mt-6 grid gap-3">
              <InfoRow label="Evento" value="ENVIO_MOEDAS_ALUNO" />
              <InfoRow label="Confirmacao" value="Aluno e professor" />
              <InfoRow label="Canal" value="RabbitMQ + EmailJS" />
            </div>
          </div>
        </aside>
      </div>

      <div className="text-center">
        <VoltarLink className="justify-center" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
