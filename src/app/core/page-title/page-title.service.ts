import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs';

export const APP_NAME = 'Stackr';
export const DEFAULT_PAGE_TITLE = APP_NAME;
const DOCUMENT_TAGLINE = 'Crypto Portfolio Tracker';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentTitle = inject(Title);

  private readonly _title = signal(DEFAULT_PAGE_TITLE);
  readonly title = this._title.asReadonly();

  constructor() {
    this.sync();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.sync());
  }

  private sync(): void {
    const pageTitle = resolvePageTitle(this.router.routerState.snapshot.root);
    this._title.set(pageTitle);
    this.documentTitle.setTitle(formatDocumentTitle(pageTitle));
  }
}

function resolvePageTitle(snapshot: ActivatedRouteSnapshot): string {
  let current = snapshot;
  while (current.firstChild) {
    current = current.firstChild;
  }

  if (typeof current.title === 'string' && current.title.length > 0) {
    return current.title;
  }

  const fromData = current.data['title'];
  if (typeof fromData === 'string' && fromData.length > 0) {
    return fromData;
  }

  return DEFAULT_PAGE_TITLE;
}

function formatDocumentTitle(pageTitle: string): string {
  if (pageTitle === DEFAULT_PAGE_TITLE) {
    return `${APP_NAME} — ${DOCUMENT_TAGLINE}`;
  }
  return `${pageTitle} — ${APP_NAME}`;
}
