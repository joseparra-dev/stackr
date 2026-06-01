const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const quantityFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatUsd(value: number): string {
  return usdFormatter.format(value);
}

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value);
}

export function formatTransactionDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTypeLabel(type: 'buy' | 'sell'): string {
  return type === 'buy' ? 'Buy' : 'Sell';
}
