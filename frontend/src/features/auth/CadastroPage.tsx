import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { instituicoesFachada } from "@/api/instituicoesFachada";
import { authFachada } from "@/api/authFachada";
import { useAuth } from "./AuthContext";
import type { Instituicao, TipoPerfil } from "@/api/types";

const PERFIS: TipoPerfil[] = ["ALUNO", "PROFESSOR", "PARCEIRO"];

export function CadastroPage() {
  const nav = useNavigate();
  const { atualizar } = useAuth();
  const [inst, setInst] = useState<Instituicao[]>([]);
  const [perfil, setPerfil] = useState<TipoPerfil>("ALUNO");
  const [form, setForm] = useState({
    email: "",
    senha: "",
    nome: "",
    instituicaoId: 0,
  });
  const [erro, setErro] = useState<string | null>(null);

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
    try {
      const instId = perfil === "PARCEIRO" ? null : form.instituicaoId;
      if (perfil !== "PARCEIRO" && !instId) {
        setErro("Selecione uma instituição.");
        return;
      }
      await authFachada.registrar(
        form.email,
        form.senha,
        form.nome,
        perfil,
        instId,
      );
      await atualizar();
      nav("/app");
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro ao cadastrar");
    }
  }

  // Classe padrão para nossos inputs "Nubank Style"
  const inputClasses = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1] placeholder:text-gray-400";

  return (
    <div className="mx-auto max-w-md">
      {/* Título mais forte e escuro */}
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Crie sua conta</h1>
      
      <form onSubmit={onSubmit} className="space-y-5 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-600">
          Você é...
          <select
            className={inputClasses}
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as TipoPerfil)}
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
            Sua Instituição
            <select
              className={inputClasses}
              value={form.instituicaoId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  instituicaoId: Number(e.target.value),
                }))
              }
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
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          E-mail
          <input
            type="email"
            className={inputClasses}
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Senha
          <input
            type="password"
            className={inputClasses}
            placeholder="Mínimo 4 caracteres"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            required
            minLength={4}
          />
        </label>

        {erro && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-[#820AD1] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#6D08B1] active:scale-95"
        >
          Finalizar cadastro
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-gray-500">
        Já tem uma conta?{" "}
        <Link className="text-[#820AD1] hover:underline font-bold" to="/entrar">
          Fazer login
        </Link>
      </p>
    </div>
  );
}