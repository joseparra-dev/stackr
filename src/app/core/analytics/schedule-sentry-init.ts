export function scheduleSentryInit(): void {
  const run = (): void => {
    void import('./sentry').then((m) => m.initSentry());
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run);
    return;
  }

  setTimeout(run, 0);
}
