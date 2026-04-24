import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-6 text-center sm:text-left">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Sistema de moeda estudantil
      </h1>
      <p className="max-w-2xl text-slate-400">
        Professores distribuem moedas a alunos. Alunos resgatam vantagens em
        parceiros. Tudo alinhado às histórias de usuário do projeto.
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
        <Link
          to="/cadastro"
          className="inline-flex rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow hover:bg-amber-400"
        >
          Criar conta
        </Link>
        <Link
          to="/entrar"
          className="inline-flex rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
