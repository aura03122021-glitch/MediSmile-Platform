export function formatPHP(cents: number): string {
  const pesos = cents / 100;
  return `₱${pesos.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPHPShort(cents: number): string {
  const pesos = cents / 100;
  if (pesos >= 1_000_000) return `₱${(pesos / 1_000_000).toFixed(1)}M`;
  if (pesos >= 1_000) return `₱${(pesos / 1_000).toFixed(1)}K`;
  return `₱${pesos.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
