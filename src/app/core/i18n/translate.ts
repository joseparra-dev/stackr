export type TranslationParams = Readonly<Record<string, string | number>>;

export interface TranslationTree {
  readonly [key: string]: string | TranslationTree;
}

export function resolveTranslation(
  tree: TranslationTree,
  key: string,
): string | undefined {
  const parts = key.split('.');
  let current: string | TranslationTree = tree;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}
