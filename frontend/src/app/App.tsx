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
  
  if (carregando) {
    return (
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <p className="text-sm text-gray-400">Carregando…</p>
      </header>
    );
  }

  return (
    <header className="relative z-30 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link
          to="/"
          className="transition-opacity hover:opacity-85"
          aria-label="PUC Coin"
        >
          <PucCoinLogo />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          {usuario && (
            <>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">{usuario.nome.toLowerCase()}</span>
                <span className="text-xs bg-purple-100 text-[#820AD1] px-2 py-0.5 rounded-full uppercase">{usuario.perfil}</span>
                {usuario.perfil !== "PARCEIRO" && (
                  <span className="ml-1 font-bold text-gray-900">
                    · {usuario.saldoMoedas} moedas
                  </span>
                )}
              </div>
              <Link
                className="rounded-full bg-[#820AD1] px-4 py-1.5 text-white hover:bg-[#6D08B1] transition-colors"
                to="/app"
              >
                Painel
              </Link>
              {(usuario.perfil === "ALUNO" || usuario.perfil === "PROFESSOR") && (
                <Link
                  className="text-gray-500 hover:text-[#820AD1] transition-colors"
                  to="/app/extrato"
                >
                  Extrato
                </Link>
              )}
              {usuario.perfil === "ALUNO" && (
                <Link
                  className="text-gray-500 hover:text-[#820AD1] transition-colors"
                  to="/app/loja"
                >
                  Vantagens
                </Link>
              )}
              {usuario.perfil === "PROFESSOR" && (
                <Link
                  className="text-[#820AD1] hover:underline"
                  to="/app/enviar"
                >
                  Enviar moedas
                </Link>
              )}
              {usuario.perfil === "PARCEIRO" && (
                <Link
                  className="text-gray-500 hover:text-[#820AD1] transition-colors"
                  to="/app/parceiro/vantagens"
                >
                  Minhas ofertas
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                Sair
              </button>
            </>
          )}
          {!usuario && (
            <>
              <Link className="text-gray-600 hover:text-[#820AD1]" to="/entrar">
                Entrar
              </Link>
              <Link
                className="rounded-full border-2 border-[#820AD1] px-4 py-1.5 text-[#820AD1] font-bold hover:bg-purple-50 transition-colors"
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
  const { pathname } = useLocation();
  const mostrarVideo = ROTAS_COM_VIDEO.has(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5] text-gray-900">
      <Navegacao />
      {mostrarVideo && <VideoBackground />}
      <main className="relative z-10 w-full flex-1 px-4 py-8">
        <div className="mx-auto max-w-5xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entrar" element={<EntrarPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/app" element={<PainelPage />} />
          <Route path="/app/extrato" element={
            <RequirePerfis perfis={["ALUNO", "PROFESSOR"]}>
              <ExtratoPage />
            </RequirePerfis>
          } />
          <Route path="/app/loja" element={
            <RequirePerfis perfis={["ALUNO"]}>
              <MarketplacePage />
            </RequirePerfis>
          } />
          <Route path="/app/enviar" element={
            <RequirePerfis perfis={["PROFESSOR"]}>
              <EnviarMoedasPage />
            </RequirePerfis>
          } />
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
