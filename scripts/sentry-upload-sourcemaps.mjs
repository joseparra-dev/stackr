import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist/stackr/browser';

function removeMapFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      removeMapFiles(path);
      continue;
    }
    if (entry.endsWith('.map')) {
      unlinkSync(path);
    }
  }
}

function main() {
  if (!process.env['SENTRY_AUTH_TOKEN']) {
    console.log('[sentry] Skipping source map upload (SENTRY_AUTH_TOKEN not set).');
    return;
  }

  const org = process.env['SENTRY_ORG'];
  const project = process.env['SENTRY_PROJECT'];
  if (!org || !project) {
    console.error('[sentry] SENTRY_ORG and SENTRY_PROJECT are required for upload.');
    process.exit(1);
  }

  if (!existsSync(DIST_DIR)) {
    console.error(`[sentry] Build output not found at ${DIST_DIR}. Run pnpm build:prod first.`);
    process.exit(1);
  }

  const env = {
    ...process.env,
    SENTRY_ORG: org,
    SENTRY_PROJECT: project,
    ...(process.env['SENTRY_URL'] ? { SENTRY_URL: process.env['SENTRY_URL'] } : {}),
  };

  console.log(`[sentry] Uploading for org=${org} project=${project}`);

  console.log('[sentry] Injecting debug IDs…');
  execSync(`pnpm exec sentry-cli sourcemaps inject "${DIST_DIR}"`, {
    stdio: 'inherit',
    env,
  });

  console.log('[sentry] Uploading source maps…');
  execSync(`pnpm exec sentry-cli sourcemaps upload "${DIST_DIR}"`, {
    stdio: 'inherit',
    env,
  });

  console.log('[sentry] Removing .map files from deploy output…');
  removeMapFiles(DIST_DIR);

  console.log('[sentry] Source maps uploaded successfully.');
}

main();
