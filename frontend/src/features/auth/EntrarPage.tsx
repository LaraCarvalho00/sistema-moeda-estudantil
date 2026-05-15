import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authFachada } from "@/api/authFachada";
import { useAuth } from "./AuthContext";
import { VoltarLink } from "@/components/VoltarLink";

export function EntrarPage() {
  const nav = useNavigate();
  const { usuario, carregando, concluirAutenticacao } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) {
    return (
      <div className="mx-auto max-w-md pt-10">
        <p className="text-center text-gray-500">Verificando sessão…</p>
      </div>
    );
  }
  if (usuario) {
    return <Navigate to="/app" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const d = await authFachada.login(email, senha);
      concluirAutenticacao(d);
      nav("/app", { replace: true });
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Falha no login");
    } finally {
      setEnviando(false);
    }
  }

  const inputClasses =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1] placeholder:text-gray-400 disabled:opacity-60";

  return (
    <div className="mx-auto max-w-md pt-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Acesse sua conta</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        aria-busy={enviando}
      >
        <label className="block text-sm font-bold text-gray-600">
          E-mail
          <input
            type="email"
            autoComplete="email"
            autoFocus
            className={inputClasses}
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={enviando}
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            className={inputClasses}
            placeholder="Sua senha secreta"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={enviando}
          />
        </label>

        {erro && (
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-sm font-medium text-red-600">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-[#820AD1] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#6D08B1] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-8 space-y-4 text-center">
        <p className="text-sm font-medium text-gray-500">
          Ainda não tem conta?{" "}
          <Link
            className="font-bold text-[#820AD1] hover:underline"
            to="/cadastro"
          >
            Criar conta agora
          </Link>
        </p>

        <VoltarLink to="/" className="justify-center">
          Voltar ao início
        </VoltarLink>
      </div>
    </div>
  );
}
