import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { CoinBadge } from "@/components/FeedbackAnimations";

export function PainelPage() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  const papel =
    usuario.perfil === "ALUNO"
      ? "Aluno"
      : usuario.perfil === "PROFESSOR"
        ? "Professor"
        : "Parceiro";

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-soft-in">
      <section className="app-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute right-8 top-8 hidden sm:block">
          <CoinBadge className="h-16 w-16 animate-float-slow" />
        </div>

        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7817d6]">
            PUC Coin
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-950 sm:text-5xl">
            Ola, {usuario.nome}
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {papel}
            {usuario.nomeInstituicao ? ` em ${usuario.nomeInstituicao}` : ""}
          </p>
        </div>

        {usuario.perfil !== "PARCEIRO" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
              <p className="text-sm font-semibold text-white/60">Saldo disponivel</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="font-display text-5xl font-extrabold animate-balance-pop">
                  {usuario.saldoMoedas}
                </span>
                <span className="pb-2 text-sm font-bold uppercase tracking-widest text-[#f4c74a]">
                  moedas
                </span>
              </div>
              <p className="mt-4 text-sm text-white/60">
                Use seu saldo para reconhecer merito ou resgatar beneficios.
              </p>
            </div>

            <div className="rounded-3xl border border-[#f4c74a]/50 bg-[#fff7dc] p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7a4d00]">
                Proxima acao
              </p>
              <p className="mt-3 text-lg font-extrabold text-slate-950">
                {usuario.perfil === "ALUNO"
                  ? "Escolha uma vantagem e receba seu cupom."
                  : "Envie moedas com uma justificativa clara."}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {usuario.perfil === "ALUNO" && (
          <ActionCard
            to="/app/loja"
            title="Resgatar vantagens"
            label="Loja"
            description="Veja beneficios disponiveis e acompanhe seu cupom."
          />
        )}

        {usuario.perfil === "PROFESSOR" && (
          <ActionCard
            to="/app/enviar"
            title="Enviar moedas"
            label="Merito"
            description="Escolha um aluno, valor e motivo do reconhecimento."
          />
        )}

        {usuario.perfil === "PARCEIRO" && (
          <ActionCard
            to="/app/parceiro/vantagens"
            title="Gerenciar ofertas"
            label="Parceiro"
            description="Cadastre vantagens e mantenha seu catalogo atualizado."
          />
        )}

        {(usuario.perfil === "ALUNO" || usuario.perfil === "PROFESSOR") && (
          <ActionCard
            to="/app/extrato"
            title="Ver extrato"
            label="Historico"
            description="Confira entradas, saidas, cupons e justificativas."
          />
        )}
      </section>
    </div>
  );
}

type ActionCardProps = {
  to: string;
  title: string;
  label: string;
  description: string;
};

function ActionCard({ to, title, label, description }: ActionCardProps) {
  return (
    <Link
      to={to}
      className="app-card-solid group flex min-h-44 flex-col justify-between rounded-[1.5rem] p-5 transition-all hover:-translate-y-1 hover:border-[#7817d6]/30 hover:shadow-2xl hover:shadow-[#7817d6]/10"
    >
      <div>
        <span className="rounded-full bg-[#efe2fb] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#4b0d82]">
          {label}
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      <span className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition-transform group-hover:translate-x-1">
        -&gt;
      </span>
    </Link>
  );
}
