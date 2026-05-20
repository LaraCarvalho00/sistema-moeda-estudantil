import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { vantagensFachada } from "@/api/vantagensFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Vantagem } from "@/api/types";
import { VoltarLink } from "@/components/VoltarLink";
import { CoinBadge, CoinBurst } from "@/components/FeedbackAnimations";

type ResgateSucesso = {
  titulo: string;
  parceiro: string;
  cupom: string;
  custo: number;
  saldoApos: number;
};

export function MarketplacePage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [lista, setLista] = useState<Vantagem[]>([]);
  const [resgate, setResgate] = useState<ResgateSucesso | null>(null);
  const [resgatandoId, setResgatandoId] = useState<number | null>(null);
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
        setErro(e instanceof Error ? e.message : "Falha ao carregar catalogo");
      }
    })();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="flex justify-center py-10 text-slate-500">
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
    setResgate(null);
    setErro(null);
    if (v.custoEmMoedas > aluno.saldoMoedas) {
      setErro("Saldo insuficiente para este resgate.");
      return;
    }
    setResgatandoId(v.id);
    try {
      const t = await vantagensFachada.resgatarVantagem(v.id);
      setResgate({
        titulo: v.titulo,
        parceiro: v.parceiroNome,
        cupom: t.cupom ?? "cupom-pendente",
        custo: v.custoEmMoedas,
        saldoApos: Math.max(0, aluno.saldoMoedas - v.custoEmMoedas),
      });
      await atualizar();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao resgatar");
    } finally {
      setResgatandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-soft-in">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7817d6]">
            Marketplace
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-slate-950">
            Vantagens para resgatar
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Troque suas moedas por beneficios de parceiros e receba um cupom
            de conferencia no e-mail.
          </p>
        </div>

        <div className="app-card-solid flex items-center gap-4 rounded-3xl px-5 py-4">
          <CoinBadge className="h-12 w-12" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Seu saldo
            </p>
            <p className="font-display text-2xl font-extrabold text-slate-950 animate-balance-pop">
              {aluno.saldoMoedas} moedas
            </p>
          </div>
        </div>
      </div>

      {erro && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-700">
          {erro}
        </div>
      )}

      {lista.length === 0 ? (
        <div className="app-card rounded-[2rem] p-10 text-center">
          <p className="font-display text-2xl font-extrabold text-slate-950">
            Nenhuma vantagem disponivel ainda.
          </p>
          <p className="mt-2 text-slate-500">
            Quando uma empresa parceira publicar ofertas, elas aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((v) => {
            const semSaldo = v.custoEmMoedas > aluno.saldoMoedas;
            const carregandoResgate = resgatandoId === v.id;
            return (
              <article
                key={v.id}
                className="app-card-solid group flex min-h-[28rem] flex-col overflow-hidden rounded-[1.75rem] transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7817d6]/10"
              >
                <div className="relative h-44 overflow-hidden bg-[#171322]">
                  {v.fotoUrl ? (
                    <img
                      src={v.fotoUrl}
                      alt={v.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#171322,#3b155f)]">
                      <CoinBadge className="h-20 w-20" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4b0d82]">
                    {v.parceiroNome}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-xl font-extrabold text-slate-950">
                    {v.titulo}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {v.descricao}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Custo
                      </p>
                      <p className="font-display text-2xl font-extrabold text-slate-950">
                        {v.custoEmMoedas}
                      </p>
                      <p className="text-xs font-bold text-slate-400">moedas</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => resgatar(v)}
                      disabled={semSaldo || carregandoResgate}
                      className="btn-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {carregandoResgate
                        ? "Resgatando..."
                        : semSaldo
                          ? "Sem saldo"
                          : "Resgatar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {resgate && (
        <ResgateModal resgate={resgate} onClose={() => setResgate(null)} />
      )}

      <p className="pt-4 text-center">
        <VoltarLink className="justify-center" />
      </p>
    </div>
  );
}

function ResgateModal({
  resgate,
  onClose,
}: {
  resgate: ResgateSucesso;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="success-panel relative w-full max-w-lg overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="reward-glow" aria-hidden="true" />
        <CoinBurst />

        <div className="relative z-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <CoinBadge className="h-14 w-14" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-700">
              Item resgatado
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-950">
              {resgate.titulo}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Parceiro: {resgate.parceiro}
            </p>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl bg-white/80 p-4 text-left shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Cupom
              </p>
              <p className="mt-1 break-all font-mono text-lg font-black text-[#4b0d82]">
                {resgate.cupom}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoPill label="Custo" value={`${resgate.custo} moedas`} />
              <InfoPill label="Saldo apos" value={`${resgate.saldoApos} moedas`} />
            </div>
            <p className="rounded-2xl bg-[#fff7dc] px-4 py-3 text-sm font-semibold text-[#634200]">
              O QR Code do cupom segue no e-mail quando o EmailJS estiver
              configurado.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary mt-6 w-full px-5 py-3"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
