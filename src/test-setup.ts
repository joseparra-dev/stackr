import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// `setupTestBed` is the official @analogjs/vitest-angular helper. It
// registers Angular's `ɵgetCleanupHook` as global `beforeEach`/`afterEach`
// hooks — without them `destroyAfterEach: true` is a no-op and TestBed
// leaks state across tests (the bug that broke Linux CI). It also handles
// idempotent `initTestEnvironment` via `Symbol.for('testbed-setup')`,
// which makes the setup safe when Vitest workers reuse the same context.
//
// `zoneless: false` matches the production app, which relies on zone.js
// (loaded above via `setup-zone`).
setupTestBed({ zoneless: false });
