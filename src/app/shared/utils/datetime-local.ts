export interface CalendarDay {
  readonly date: Date;
  readonly inMonth: boolean;
  readonly disabled: boolean;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDatetimeLocal(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDatetimeDisplay(value: string, locale = 'en-US'): string {
  const date = parseDatetimeLocal(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function monthLabel(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isDayAfter(date: Date, limit: Date): boolean {
  return startOfDay(date).getTime() > startOfDay(limit).getTime();
}

export function getCalendarDays(viewMonth: Date, disableAfter?: Date): CalendarDay[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    const date = new Date(year, month, index - startOffset + 1);
    cells.push({
      date,
      inMonth: false,
      disabled: disableAfter ? isDayAfter(date, disableAfter) : false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      date,
      inMonth: true,
      disabled: disableAfter ? isDayAfter(date, disableAfter) : false,
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells.at(-1)?.date ?? new Date(year, month, daysInMonth);
    const date = new Date(last);
    date.setDate(date.getDate() + 1);
    cells.push({
      date,
      inMonth: false,
      disabled: disableAfter ? isDayAfter(date, disableAfter) : false,
    });
  }

  return cells.slice(0, 42);
}

export const HOURS = Array.from({ length: 24 }, (_, index) => pad(index));
export const MINUTES = Array.from({ length: 60 }, (_, index) => pad(index));
