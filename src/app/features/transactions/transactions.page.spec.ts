import { Dialog } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, ethereumAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { TransactionsStore } from './transactions.store';
import { TransactionsPage } from './transactions.page';

describe('TransactionsPage', () => {
  let fixture: ComponentFixture<TransactionsPage>;
  const queryParams$ = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    const transactions = signal([
      makeTransaction({ asset: bitcoinAsset }),
      makeTransaction({ id: 'tx-2', asset: ethereumAsset }),
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
          useValue: { queryParamMap: queryParams$.asObservable() },
        },
        {
          provide: Dialog,
          useValue: { open: vi.fn().mockReturnValue({ closed: of(false) }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows filter banner and filters rows by asset query param', async () => {
    queryParams$.next(convertToParamMap({ asset: 'bitcoin' }));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Showing transactions for');
    expect(fixture.nativeElement.textContent).toContain('BTC');
    expect(fixture.nativeElement.textContent).not.toContain('ETH');
  });
});
