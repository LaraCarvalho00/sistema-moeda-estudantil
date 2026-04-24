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
      const instId =
        perfil === "PARCEIRO" ? null : form.instituicaoId;
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

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Cadastro</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm text-slate-400">
          Tipo
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
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
          <label className="block text-sm text-slate-400">
            Instituição
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
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
        <label className="block text-sm text-slate-400">
          Nome
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          E-mail
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Senha
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            required
            minLength={4}
          />
        </label>
        {erro && <p className="text-sm text-rose-400">{erro}</p>}
        <button
          type="submit"
          className="w-full rounded bg-amber-500 py-2 font-medium text-slate-950"
        >
          Criar conta
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link className="text-amber-400" to="/entrar">
          Já tenho conta
        </Link>
      </p>
    </div>
  );
}
