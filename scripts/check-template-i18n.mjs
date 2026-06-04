import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src', 'app');
const SKIP_DIRS = new Set(['__fixtures__']);
const ALLOWED_LINE =
  /\|\s*translate\b|i18n-label|Stack<span|^\s*<!--|^\s*@|^\s*<\/|^\s*<svg|^\s*<img|^\s*<apx-chart|^\s*<input|^\s*<option|^\s*<button[^>]*>\s*$/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else if (entry.endsWith('.html')) files.push(path);
  }
  return files;
}

const violations = [];

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (ALLOWED_LINE.test(line)) continue;
    if (/>\s*[A-Za-z][^<{]*</.test(line) && !line.includes('translate')) {
      violations.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Hardcoded template text found (use translate pipe or i18n keys):\n');
  for (const item of violations) console.error(item);
  process.exit(1);
}
