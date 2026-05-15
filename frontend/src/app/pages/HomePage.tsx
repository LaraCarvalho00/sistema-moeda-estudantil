import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="relative isolate grid min-h-[560px] items-center gap-12 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative z-10 space-y-8 rounded-[2rem] border border-white/20 bg-white/90 p-7 text-center shadow-2xl shadow-gray-950/20 backdrop-blur-md sm:text-left">
        <div className="inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#820AD1] shadow-sm">
          PUC Minas
        </div>

        <div className="space-y-5">
          <h1 className="text-5xl font-black tracking-tight text-gray-950 sm:text-6xl">
            PUC Coin
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:mx-0">
            Sistema de moeda estudantil para professores distribuirem moedas,
            alunos acompanharem saldo e parceiros oferecerem vantagens.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2 sm:justify-start">
          <Link
            to="/cadastro"
            className="inline-flex rounded-full bg-[#820AD1] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#6D08B1]"
          >
            Criar conta
          </Link>

          <Link
            to="/entrar"
            className="inline-flex rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-sm font-bold text-gray-700 transition-all hover:border-[#820AD1] hover:text-[#820AD1]"
          >
            Ja tenho conta
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-center py-6">
        <div className="absolute inset-x-8 top-0 h-16 rounded-t-[2rem] bg-[#820AD1]" />
        <div className="absolute inset-x-14 bottom-0 h-16 rounded-b-[2rem] bg-[#F2C94C]" />

        <div className="relative w-full overflow-hidden rounded-[2rem] border border-purple-100 bg-white p-5 shadow-2xl shadow-gray-950/20">
          <img
            alt="Arte da logo PUC Coin"
            className="w-full rounded-[1.5rem]"
            src="/puc-coin-logo.svg"
          />

          <div className="mt-5 flex justify-center border-t border-gray-100 pt-5">
            <img
              alt="Logo PUC Minas"
              className="h-16 max-w-full object-contain"
              src="/puc-minas-logo.svg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
