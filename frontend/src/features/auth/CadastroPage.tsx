import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authFachada } from "@/api/authFachada";
import { instituicoesFachada } from "@/api/instituicoesFachada";
import type { Instituicao, TipoPerfil } from "@/api/types";
import { useAuth } from "./AuthContext";

const PERFIS: TipoPerfil[] = ["ALUNO", "PROFESSOR", "PARCEIRO"];

export function CadastroPage() {
  const nav = useNavigate();
  const { usuario, carregando, concluirAutenticacao } = useAuth();
  const [inst, setInst] = useState<Instituicao[]>([]);
  const [perfil, setPerfil] = useState<TipoPerfil>("ALUNO");
  const [form, setForm] = useState({
    email: "",
    senha: "",
    nome: "",
    instituicaoId: 0,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    void (async () => {
      const list = await instituicoesFachada.listar();
      setInst(list);
      if (list[0]) {
        setForm((f) => ({ ...f, instituicaoId: list[0].id }));
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const instId = perfil === "PARCEIRO" ? null : form.instituicaoId;
    if (perfil !== "PARCEIRO" && !instId) {
      setErro("Selecione uma instituicao.");
      return;
    }
    setEnviando(true);
    try {
      const d = await authFachada.registrar(
        form.email,
        form.senha,
        form.nome,
        perfil,
        instId,
      );
      concluirAutenticacao(d);
      nav("/app", { replace: true });
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro ao cadastrar");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-md">
        <p className="text-center text-gray-500">Verificando sessao...</p>
      </div>
    );
  }
  if (usuario) {
    return <Navigate to="/app" replace />;
  }

  const inputClasses =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1] placeholder:text-gray-400 disabled:opacity-60";

  return (
    <div className="relative isolate mx-auto max-w-md">
      <div className="relative z-10">
        <h1 className="mb-8 text-3xl font-bold text-white drop-shadow">
          Crie sua conta
        </h1>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-white/30 bg-white/95 p-8 shadow-2xl shadow-gray-950/25 backdrop-blur-md"
          aria-busy={enviando}
        >
          <label className="block text-sm font-bold text-gray-600">
            Voce e...
            <select
              className={inputClasses}
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as TipoPerfil)}
              disabled={enviando}
            >
              {PERFIS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          {perfil !== "PARCEIRO" && inst.length > 0 && (
            <label className="block text-sm font-bold text-gray-600">
              Sua Instituicao
              <select
                className={inputClasses}
                value={form.instituicaoId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    instituicaoId: Number(e.target.value),
                  }))
                }
                disabled={enviando}
              >
                {inst.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm font-bold text-gray-600">
            Nome completo
            <input
              className={inputClasses}
              placeholder="Ex: Lara Carvalho"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              disabled={enviando}
            />
          </label>

          <label className="block text-sm font-bold text-gray-600">
            E-mail
            <input
              type="email"
              autoComplete="email"
              className={inputClasses}
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={enviando}
            />
          </label>

          <label className="block text-sm font-bold text-gray-600">
            Senha
            <input
              type="password"
              autoComplete="new-password"
              className={inputClasses}
              placeholder="Minimo 4 caracteres"
              value={form.senha}
              onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              required
              minLength={4}
              disabled={enviando}
            />
          </label>

          {erro && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-full bg-[#820AD1] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#6D08B1] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {enviando ? "Criando conta..." : "Finalizar cadastro"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-white drop-shadow">
          Ja tem uma conta?{" "}
          <Link
            className="font-bold text-[#F2C94C] hover:underline"
            to="/entrar"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
