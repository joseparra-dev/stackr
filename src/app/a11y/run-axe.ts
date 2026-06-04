import axe from 'axe-core';

export async function runAxe(element: Element): Promise<axe.AxeResults> {
  return axe.run(element, {
    rules: {
      region: { enabled: false },
    },
  });
}

export function formatAxeViolations(results: axe.AxeResults): string {
  return results.violations
    .map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`)
    .join('\n');
}
