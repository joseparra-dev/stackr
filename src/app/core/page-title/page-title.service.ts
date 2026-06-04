import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs';

import { I18nService } from '@core/i18n/i18n.service';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentTitle = inject(Title);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly i18n = inject(I18nService);

  private readonly _title = signal('');
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
    this.i18n.locale();
    const titleKey = resolvePageTitleKey(this.router.routerState.snapshot.root);
    const pageTitle = titleKey
      ? this.i18n.translate(titleKey)
      : this.i18n.translate('nav.pageTitle.default');
    this._title.set(pageTitle);
    this.documentTitle.setTitle(formatDocumentTitle(pageTitle, this.i18n));
    void this.liveAnnouncer.announce(
      this.i18n.translate('nav.aria.navigatedTo', { page: pageTitle }),
      150,
    );
  }
}

function resolvePageTitleKey(snapshot: ActivatedRouteSnapshot): string | null {
  let current = snapshot;
  while (current.firstChild) {
    current = current.firstChild;
  }

  const fromData = current.data['titleKey'];
  if (typeof fromData === 'string' && fromData.length > 0) {
    return fromData;
  }

  return null;
}

function formatDocumentTitle(pageTitle: string, i18n: I18nService): string {
  const defaultTitle = i18n.translate('nav.pageTitle.default');
  if (pageTitle === defaultTitle) {
    return i18n.translate('nav.pageTitle.documentDefault');
  }
  return i18n.translate('nav.pageTitle.documentWithPage', { page: pageTitle });
}
