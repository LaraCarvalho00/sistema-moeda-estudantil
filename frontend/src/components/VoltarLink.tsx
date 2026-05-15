import { Link } from "react-router-dom";

const estilo =
  "inline-flex items-center gap-1.5 text-sm font-bold text-[#820AD1] transition-colors hover:text-[#6D08B1] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1]/40 focus-visible:ring-offset-2 rounded-sm";

type Props = {
  /** Destino (predefinido: painel autenticado) */
  to?: string;
  /** Texto após a seta (predefinido: «Voltar ao painel») */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Link secundário padrão «voltar», alinhado ao tema roxo da aplicação.
 */
export function VoltarLink({ to = "/app", children = "Voltar ao painel", className = "" }: Props) {
  return (
    <Link to={to} className={`${estilo} ${className}`.trim()}>
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
