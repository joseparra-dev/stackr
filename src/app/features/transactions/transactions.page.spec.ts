import { Dialog } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, ethereumAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { TransactionsStore } from './transactions.store';
import { TransactionsPage } from './transactions.page';

describe('TransactionsPage', () => {
  let fixture: ComponentFixture<TransactionsPage>;
  let router: Router;
  const queryParams$ = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    const transactions = signal([
      makeTransaction({ asset: bitcoinAsset }),
      makeTransaction({ id: 'tx-2', asset: ethereumAsset, type: 'sell' }),
    ]);

    await TestBed.configureTestingModule({
      imports: [TransactionsPage],
      providers: [
        provideRouter([]),
        {
          provide: TransactionsStore,
          useValue: {
            transactions: transactions.asReadonly(),
            loading: signal(false).asReadonly(),
            error: signal(null).asReadonly(),
            hasTransactions: signal(true).asReadonly(),
            load: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$.asObservable(), snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        {
          provide: Dialog,
          useValue: { open: vi.fn().mockReturnValue({ closed: of(false) }) },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TransactionsPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('filters rows from url query params', async () => {
    queryParams$.next(convertToParamMap({ assets: 'bitcoin', type: 'buy' }));

    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('BTC');
    expect(text).not.toContain('ETH');
  });

  it('shows filtered empty state when no rows match', async () => {
    queryParams$.next(convertToParamMap({ assets: 'bitcoin', type: 'sell' }));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No matching transactions');
  });

  it('navigates with cleared filters', () => {
    fixture.componentInstance.clearFilters();

    expect(router.navigate).toHaveBeenCalled();
  });
});
