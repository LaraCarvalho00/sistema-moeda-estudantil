import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFachada } from "@/api/authFachada";
import { useAuth } from "./AuthContext";

export function EntrarPage() {
  const nav = useNavigate();
  const { atualizar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await authFachada.login(email, senha);
      await atualizar();
      nav("/app");
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Falha no login");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm text-slate-400">
          E-mail
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Senha
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>
        {erro && <p className="text-sm text-rose-400">{erro}</p>}
        <button
          type="submit"
          className="w-full rounded bg-amber-500 py-2 font-medium text-slate-950"
        >
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link className="text-amber-400" to="/cadastro">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
