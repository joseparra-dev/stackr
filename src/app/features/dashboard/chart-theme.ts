export const ALLOCATION_CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
] as const;

export interface ChartThemeTokens {
  readonly foreColor: string;
  readonly legendColor: string;
  readonly strokeColor: string;
  readonly mode: 'light' | 'dark';
};

export function readCssVar(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

export function getChartThemeTokens(isDark: boolean): ChartThemeTokens {
  return {
    foreColor: readCssVar('--color-text-muted'),
    legendColor: readCssVar('--color-text'),
    strokeColor: readCssVar('--color-surface'),
    mode: isDark ? 'dark' : 'light',
  };
}
