type LogoProps = {
  className?: string;
};

export function PucCoinLogo({ className = "h-12 w-auto" }: LogoProps) {
  return (
    <img
      alt="PUC Coin"
      className={className}
      src="/puc-coin-logo.svg"
    />
  );
}

export function PucMinasLogo({ className = "h-16 w-auto" }: LogoProps) {
  return (
    <img
      alt="PUC Minas"
      className={className}
      src="/puc-minas-logo.svg"
    />
  );
}
