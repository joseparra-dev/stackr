import { Dialog } from '@angular/cdk/dialog';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TransactionsStore } from './transactions.store';
import { TransactionsPage } from './transactions.page';

describe('TransactionsPage', () => {
  let fixture: ComponentFixture<TransactionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsPage],
      providers: [
        {
          provide: TransactionsStore,
          useValue: {
            transactions: vi.fn().mockReturnValue([]),
            loading: vi.fn().mockReturnValue(false),
            error: vi.fn().mockReturnValue(null),
            hasTransactions: vi.fn().mockReturnValue(false),
            load: vi.fn().mockResolvedValue(undefined),
          },
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

  it('shows empty state when there are no transactions', () => {
    expect(fixture.nativeElement.textContent).toContain('No transactions yet');
  });
});
