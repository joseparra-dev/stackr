import '@angular/compiler';

import { TestBed } from '@angular/core/testing';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { beforeEach } from 'vitest';

import { provideI18nTestDeps } from '@core/i18n/i18n-testing';

// `setupTestBed` is the official @analogjs/vitest-angular helper. It
// registers Angular's `ɵgetCleanupHook` as global `beforeEach`/`afterEach`
// hooks — without them `destroyAfterEach: true` is a no-op and TestBed
// leaks state across tests (the bug that broke Linux CI). It also handles
// idempotent `initTestEnvironment` via `Symbol.for('testbed-setup')`,
// which makes the setup safe when Vitest workers reuse the same context.
//
// Matches production: `provideZonelessChangeDetection()` in app.config.ts.
setupTestBed({ zoneless: true });

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: provideI18nTestDeps(),
  });
});
