import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { PageTitleService } from './page-title.service';

@Component({ template: '' })
class BlankPage {}

describe('PageTitleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            data: { title: 'Dashboard' },
            component: BlankPage,
          },
          {
            path: 'login',
            component: BlankPage,
          },
        ]),
      ],
    });
  });

  it('reads the deepest route data.title after navigation', async () => {
    const router = TestBed.inject(Router);
    const service = TestBed.inject(PageTitleService);

    await router.navigateByUrl('/');

    expect(service.title()).toBe('Dashboard');
  });

  it('falls back to Stackr when the route has no title', async () => {
    const router = TestBed.inject(Router);
    const service = TestBed.inject(PageTitleService);

    await router.navigateByUrl('/login');

    expect(service.title()).toBe('Stackr');
  });

  it('updates the browser document title', async () => {
    const router = TestBed.inject(Router);
    TestBed.inject(PageTitleService);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/');

    expect(title.getTitle()).toBe('Dashboard — Stackr');
  });

  it('uses the marketing document title on untitled routes', async () => {
    const router = TestBed.inject(Router);
    TestBed.inject(PageTitleService);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/login');

    expect(title.getTitle()).toBe('Stackr — Crypto Portfolio Tracker');
  });
});
