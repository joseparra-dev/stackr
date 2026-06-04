const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatUsd(value: number): string {
  return usdFormatter.format(value);
}

export function formatSignedUsd(value: number): string {
  if (value > 0) return `+${formatUsd(value)}`;
  return formatUsd(value);
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}
