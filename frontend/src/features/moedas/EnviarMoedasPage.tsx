import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { alunosFachada } from "@/api/alunosFachada";
import { moedasFachada } from "@/api/moedasFachada";
import { useAuth } from "@/features/auth/AuthContext";
import type { Aluno } from "@/api/types";

export function EnviarMoedasPage() {
  const { usuario, carregando, atualizar } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState(0);
  const [q, setQ] = useState(1);
  const [justificativa, setJustificativa] = useState("");
  const [saldoProf, setSaldoProf] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    const [a, s] = await Promise.all([
      alunosFachada.mesmaInstituicaoDoProfessor(0),
      moedasFachada.saldoProfessor(),
    ]);
    setAlunos(a.content);
    setSaldoProf(s);
    if (a.content[0]) {
      setAlunoId(a.content[0].id);
    }
  }, []);

  useEffect(() => {
    if (usuario?.perfil === "PROFESSOR") {
      void (async () => {
        try {
          await recarregar();
        } catch (e) {
          setErro(e instanceof Error ? e.message : "Falha");
        }
      })();
    }
  }, [recarregar, usuario?.perfil]);

  if (carregando) {
    return <p className="text-slate-500">…</p>;
  }
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }
  if (usuario.perfil !== "PROFESSOR") {
    return <Navigate to="/app" replace />;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!alunoId) {
      setErro("Selecione o aluno.");
      return;
    }
    if (!justificativa.trim()) {
      setErro("Justificativa é obrigatória (US03).");
      return;
    }
    try {
      await moedasFachada.enviar({
        alunoId,
        quantidade: q,
        mensagemJustificativa: justificativa.trim(),
      });
      setJustificativa("");
      setQ(1);
      await recarregar();
      await atualizar();
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro");
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Enviar moedas</h1>
      {saldoProf != null && (
        <p className="text-slate-500">
          Saldo disponível:{" "}
          <span className="text-amber-300/90">{saldoProf}</span> (crédito
          automático 1000 / semestre, US02)
        </p>
      )}
      {erro && <p className="text-rose-400">{erro}</p>}

      <form onSubmit={enviar} className="mt-4 max-w-md space-y-3">
        <label className="block text-sm text-slate-400">
          Aluno
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={alunoId || ""}
            onChange={(e) => setAlunoId(Number(e.target.value))}
          >
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} — {a.email}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-400">
          Quantidade
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm text-slate-400">
          Mensagem justificativa
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            required
            rows={3}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-amber-500 py-2 font-medium text-slate-950"
        >
          Enviar
        </button>
      </form>

      <p className="mt-4">
        <Link to="/app" className="text-amber-400">
          Voltar
        </Link>
      </p>
    </div>
  );
}
