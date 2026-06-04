import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SentryErrorHandler } from './sentry-error-handler';

describe('SentryErrorHandler', () => {
  it('logs to console when Sentry is not configured', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const handler = TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }],
    }).runInInjectionContext(() => TestBed.inject(ErrorHandler));

    handler.handleError(new Error('boom'));

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
