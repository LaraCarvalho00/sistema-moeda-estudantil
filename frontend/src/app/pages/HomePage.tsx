import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-8 text-center sm:text-left py-10">
      {/* Título: Agora em cinza quase preto para ler bem no fundo claro */}
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Sistema de moeda estudantil
      </h1>
      
      {/* Subtítulo: Cinza médio para dar elegância */}
      <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
        Professores distribuem moedas a alunos. Alunos resgatam vantagens em
        parceiros. Tudo alinhado às histórias de usuário do projeto.
      </p>

      <div className="flex flex-wrap justify-center gap-4 sm:justify-start pt-4">
        {/* Botão Roxo Nubank Arredondado */}
        <Link
          to="/cadastro"
          className="inline-flex rounded-full bg-[#820AD1] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#6D08B1] transition-all"
        >
          Criar conta
        </Link>
        
        {/* Botão Secundário: Apenas borda, bem minimalista */}
        <Link
          to="/entrar"
          className="inline-flex rounded-full border-2 border-gray-300 px-8 py-3 text-sm font-bold text-gray-700 hover:border-[#820AD1] hover:text-[#820AD1] transition-all"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}