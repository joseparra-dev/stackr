import { Injectable, type ErrorHandler } from '@angular/core';

import { createSentryErrorHandler } from './sentry';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  private readonly delegate = createSentryErrorHandler();

  handleError(error: unknown): void {
    if (this.delegate) {
      this.delegate.handleError(error);
      return;
    }
    console.error(error);
  }
}
