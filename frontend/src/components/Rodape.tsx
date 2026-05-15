import { PucCoinLogo, PucMinasLogo } from "@/components/BrandLogos";

export function Rodape() {
  return (
    <footer className="relative z-20 mt-12 bg-[#2B123C] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-2xl bg-white p-2 shadow-sm">
            <PucCoinLogo className="h-14 w-auto" />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-purple-100">
            Plataforma academica para distribuicao e resgate de moedas
            estudantis.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-left sm:items-end sm:text-right">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
            Projeto academico
          </span>
          <div className="inline-flex rounded-2xl bg-white px-4 py-2 shadow-sm">
            <PucMinasLogo className="h-14 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
