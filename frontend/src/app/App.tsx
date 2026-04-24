import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { HomePage } from "@/app/pages/HomePage";
import { EntrarPage } from "@/features/auth/EntrarPage";
import { CadastroPage } from "@/features/auth/CadastroPage";
import { PainelPage } from "@/app/pages/PainelPage";
import { ExtratoPage } from "@/features/extrato/ExtratoPage";
import { MarketplacePage } from "@/features/vantagens/MarketplacePage";
import { EnviarMoedasPage } from "@/features/moedas/EnviarMoedasPage";
import { ParceiroVantagensPage } from "@/features/vantagens/ParceiroVantagensPage";

function Navegacao() {
  const { usuario, logout, carregando } = useAuth();
  if (carregando) {
    return (
      <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <p className="text-sm text-slate-500">Carregando…</p>
      </header>
    );
  }
  return (
    <header className="border-b border-slate-800 bg-slate-900/50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-amber-400/90"
        >
          Moeda Estudantil
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {usuario && (
            <>
              <span className="text-slate-500">
                {usuario.nome}{" "}
                <span className="text-slate-400">· {usuario.perfil}</span>
                {usuario.perfil !== "PARCEIRO" && (
                  <span className="ml-1 text-amber-300/90">
                    · {usuario.saldoMoedas} moedas
                  </span>
                )}
              </span>
              <Link
                className="rounded bg-slate-800 px-2 py-1 text-slate-200 hover:bg-slate-700"
                to="/app"
              >
                Painel
              </Link>
              <Link
                className="text-slate-400 hover:text-slate-200"
                to="/app/extrato"
              >
                Extrato
              </Link>
              {usuario.perfil === "ALUNO" && (
                <Link
                  className="text-slate-400 hover:text-slate-200"
                  to="/app/loja"
                >
                  Vantagens
                </Link>
              )}
              {usuario.perfil === "PROFESSOR" && (
                <Link
                  className="text-amber-400/80 hover:text-amber-300"
                  to="/app/enviar"
                >
                  Enviar moedas
                </Link>
              )}
              {usuario.perfil === "PARCEIRO" && (
                <Link
                  className="text-amber-400/80 hover:text-amber-300"
                  to="/app/parceiro/vantagens"
                >
                  Minhas ofertas
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-rose-400/90 hover:underline"
              >
                Sair
              </button>
            </>
          )}
          {!usuario && (
            <>
              <Link className="text-slate-400 hover:text-white" to="/entrar">
                Entrar
              </Link>
              <Link
                className="rounded border border-amber-600/50 px-3 py-1 text-amber-400/90"
                to="/cadastro"
              >
                Cadastro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function App() {
  return (
    <div className="min-h-screen">
      <Navegacao />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entrar" element={<EntrarPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/app" element={<PainelPage />} />
          <Route path="/app/extrato" element={<ExtratoPage />} />
          <Route path="/app/loja" element={<MarketplacePage />} />
          <Route path="/app/enviar" element={<EnviarMoedasPage />} />
          <Route
            path="/app/parceiro/vantagens"
            element={<ParceiroVantagensPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
