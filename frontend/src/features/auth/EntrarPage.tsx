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

  // Mantendo o padrão de inputs que usamos no cadastro
  const inputClasses = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1] placeholder:text-gray-400";

  return (
    <div className="mx-auto max-w-md pt-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Acesse sua conta</h1>
      
      <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-600">
          E-mail
          <input
            type="email"
            className={inputClasses}
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Senha
          <input
            type="password"
            className={inputClasses}
            placeholder="Sua senha secreta"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        {erro && (
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-sm font-medium text-red-600">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-[#820AD1] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#6D08B1] active:scale-95"
        >
          Entrar
        </button>
      </form>

      <div className="mt-8 text-center space-y-4">
        <p className="text-sm font-medium text-gray-500">
          Ainda não tem conta?{" "}
          <Link className="text-[#820AD1] hover:underline font-bold" to="/cadastro">
            Criar conta agora
          </Link>
        </p>
        
        <Link to="/" className="block text-xs text-gray-400 hover:text-gray-600">
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}