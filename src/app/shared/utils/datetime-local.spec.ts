import { describe, expect, it } from 'vitest';

import {
  formatDatetimeDisplay,
  getCalendarDays,
  isDayAfter,
  isSameDay,
  parseDatetimeLocal,
  toDatetimeLocalValue,
} from './datetime-local';

describe('datetime-local utils', () => {
  it('round-trips datetime-local values', () => {
    const date = new Date(2026, 4, 31, 21, 57);
    const value = toDatetimeLocalValue(date);

    expect(value).toBe('2026-05-31T21:57');
    expect(parseDatetimeLocal(value)?.getMinutes()).toBe(57);
  });

  it('formats display values', () => {
    expect(formatDatetimeDisplay('2026-05-31T21:57', 'en-US')).toContain('2026');
  });

  it('builds a 42-cell calendar grid', () => {
    const days = getCalendarDays(new Date(2026, 4, 1));
    expect(days).toHaveLength(42);
  });

  it('disables days after the limit date', () => {
    const days = getCalendarDays(new Date(2026, 4, 1), new Date(2026, 4, 15));
    const futureDay = days.find((day) => day.date.getDate() === 20 && day.inMonth);

    expect(futureDay?.disabled).toBe(true);
  });

  it('compares days without time', () => {
    const a = new Date(2026, 4, 31, 8, 0);
    const b = new Date(2026, 4, 31, 20, 0);

    expect(isSameDay(a, b)).toBe(true);
    expect(isDayAfter(new Date(2026, 5, 1), b)).toBe(true);
  });
});
