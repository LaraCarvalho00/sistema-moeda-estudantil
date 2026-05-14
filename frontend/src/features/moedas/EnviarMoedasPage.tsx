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
    return <p className="text-gray-400">Carregando…</p>;
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
      setErro("Justificativa é obrigatória.");
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
      alert("Moedas enviadas com sucesso! 🎉");
    } catch (e2) {
      setErro(e2 instanceof Error ? e2.message : "Erro");
    }
  }

  const inputClasses = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all focus:border-[#820AD1] focus:ring-1 focus:ring-[#820AD1]";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Transferir moedas</h1>
        {saldoProf != null && (
          <p className="text-gray-500 mt-2">
            Seu saldo para distribuição: <span className="font-bold text-[#820AD1]">{saldoProf} moedas</span>
          </p>
        )}
      </header>

      {erro && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
          ⚠️ {erro}
        </div>
      )}

      <form onSubmit={enviar} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
        <label className="block text-sm font-bold text-gray-600">
          Para qual aluno?
          <select
            className={inputClasses}
            value={alunoId || ""}
            onChange={(e) => setAlunoId(Number(e.target.value))}
          >
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} ({a.email})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Quanto quer enviar?
          <input
            type="number"
            min={1}
            className={inputClasses}
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            required
          />
        </label>

        <label className="block text-sm font-bold text-gray-600">
          Por que está enviando?
          <textarea
            className={`${inputClasses} resize-none`}
            placeholder="Ex: Excelente participação na aula de Banco de Dados"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            required
            rows={3}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-[#820AD1] py-4 font-bold text-white shadow-lg transition-all hover:bg-[#6D08B1] active:scale-95"
        >
          Confirmar envio
        </button>
      </form>

      <div className="text-center">
        <Link to="/app" className="text-sm font-bold text-gray-400 hover:text-[#820AD1] transition-colors">
          ← Cancelar e voltar
        </Link>
      </div>
    </div>
  );
}