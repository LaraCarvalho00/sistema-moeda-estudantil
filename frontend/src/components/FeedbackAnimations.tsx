import type { CSSProperties } from "react";

const SPARKS = [
  [-86, -42],
  [-58, -78],
  [-18, -92],
  [30, -88],
  [76, -54],
  [94, -8],
  [72, 44],
  [26, 76],
  [-26, 78],
  [-72, 42],
  [-94, -4],
  [-42, -34],
] as const;

function sparkStyle(index: number): CSSProperties {
  const [x, y] = SPARKS[index] ?? [0, 0];
  return {
    "--tx": `${x}px`,
    "--ty": `${y}px`,
    "--delay": `${index * 34}ms`,
  } as CSSProperties;
}

export function CoinBurst() {
  return (
    <span className="coin-burst" aria-hidden="true">
      {SPARKS.map((_, index) => (
        <span
          className="coin-spark"
          key={index}
          style={sparkStyle(index)}
        />
      ))}
    </span>
  );
}

type CoinBadgeProps = {
  value?: string;
  className?: string;
};

export function CoinBadge({ value = "P", className = "h-12 w-12" }: CoinBadgeProps) {
  return <span className={`coin-chip ${className}`}>{value}</span>;
}
