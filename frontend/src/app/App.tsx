import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { HomePage } from "@/app/pages/HomePage";
import { EntrarPage } from "@/features/auth/EntrarPage";
import { CadastroPage } from "@/features/auth/CadastroPage";
import { PainelPage } from "@/app/pages/PainelPage";
import { ExtratoPage } from "@/features/extrato/ExtratoPage";
import { MarketplacePage } from "@/features/vantagens/MarketplacePage";
import { EnviarMoedasPage } from "@/features/moedas/EnviarMoedasPage";
import { ParceiroVantagensPage } from "@/features/vantagens/ParceiroVantagensPage";
import { RequirePerfis } from "@/app/RequirePerfis";
import { PucCoinLogo } from "@/components/BrandLogos";
import { Rodape } from "@/components/Rodape";
import { VideoBackground } from "@/components/VideoBackground";

const ROTAS_COM_VIDEO = new Set(["/", "/entrar", "/cadastro"]);

function Navegacao() {
  const { usuario, logout, carregando } = useAuth();
  const { pathname } = useLocation();

  const linkClass = (to: string) =>
    `rounded-full px-3 py-2 transition-colors ${
      pathname === to
        ? "bg-[#efe2fb] text-[#4b0d82]"
        : "text-slate-600 hover:bg-white hover:text-[#4b0d82]"
    }`;

  if (carregando) {
    return (
      <header className="border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur">
        <p className="text-sm text-slate-400">Carregando...</p>
      </header>
    );
  }

  return (
    <header className="relative z-30 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link
          to="/"
          className="transition-opacity hover:opacity-85"
          aria-label="PUC Coin"
        >
          <PucCoinLogo />
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {usuario && (
            <>
              <div className="mr-1 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm">
                <span className="font-semibold">{usuario.nome.toLowerCase()}</span>
                <span className="rounded-full bg-[#efe2fb] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#4b0d82]">
                  {usuario.perfil}
                </span>
                {usuario.perfil !== "PARCEIRO" && (
                  <span className="ml-1 font-display font-extrabold text-slate-950">
                    {usuario.saldoMoedas} moedas
                  </span>
                )}
              </div>

              <Link className={linkClass("/app")} to="/app">
                Painel
              </Link>

              {(usuario.perfil === "ALUNO" || usuario.perfil === "PROFESSOR") && (
                <Link className={linkClass("/app/extrato")} to="/app/extrato">
                  Extrato
                </Link>
              )}

              {usuario.perfil === "ALUNO" && (
                <Link className={linkClass("/app/loja")} to="/app/loja">
                  Vantagens
                </Link>
              )}

              {usuario.perfil === "PROFESSOR" && (
                <Link className={linkClass("/app/enviar")} to="/app/enviar">
                  Enviar moedas
                </Link>
              )}

              {usuario.perfil === "PARCEIRO" && (
                <Link
                  className={linkClass("/app/parceiro/vantagens")}
                  to="/app/parceiro/vantagens"
                >
                  Minhas ofertas
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Sair
              </button>
            </>
          )}

          {!usuario && (
            <>
              <Link className="rounded-full px-3 py-2 text-slate-700 hover:text-[#4b0d82]" to="/entrar">
                Entrar
              </Link>
              <Link className="btn-secondary px-4 py-2" to="/cadastro">
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
  const { pathname } = useLocation();
  const mostrarVideo = ROTAS_COM_VIDEO.has(pathname);

  return (
    <div className="flex min-h-screen flex-col text-slate-950">
      <Navegacao />
      {mostrarVideo && <VideoBackground />}
      <main className="relative z-10 w-full flex-1 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/entrar" element={<EntrarPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/app" element={<PainelPage />} />
            <Route
              path="/app/extrato"
              element={
                <RequirePerfis perfis={["ALUNO", "PROFESSOR"]}>
                  <ExtratoPage />
                </RequirePerfis>
              }
            />
            <Route
              path="/app/loja"
              element={
                <RequirePerfis perfis={["ALUNO"]}>
                  <MarketplacePage />
                </RequirePerfis>
              }
            />
            <Route
              path="/app/enviar"
              element={
                <RequirePerfis perfis={["PROFESSOR"]}>
                  <EnviarMoedasPage />
                </RequirePerfis>
              }
            />
            <Route
              path="/app/parceiro/vantagens"
              element={
                <RequirePerfis perfis={["PARCEIRO"]}>
                  <ParceiroVantagensPage />
                </RequirePerfis>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
