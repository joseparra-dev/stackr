import { describe, expect, it } from 'vitest';

import { formatPercent, formatSignedUsd, formatUsd } from './format-usd';

describe('formatUsd', () => {
  it('formats numbers as USD currency', () => {
    expect(formatUsd(1234.5)).toBe('$1,234.50');
  });
});

describe('formatSignedUsd', () => {
  it('prefixes positive values with a plus sign', () => {
    expect(formatSignedUsd(100)).toBe('+$100.00');
  });

  it('keeps negative values as standard currency', () => {
    expect(formatSignedUsd(-50)).toBe('-$50.00');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages with a plus prefix', () => {
    expect(formatPercent(12.345)).toBe('+12.35%');
  });

  it('formats negative percentages without a double minus', () => {
    expect(formatPercent(-3.1)).toBe('-3.10%');
  });
});
