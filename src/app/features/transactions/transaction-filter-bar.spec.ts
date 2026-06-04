import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset } from '@shared/utils/__fixtures__/transactions';

import { TransactionFilterBar } from './transaction-filter-bar';
import { EMPTY_TRANSACTION_FILTERS } from './transactions-filter';

describe('TransactionFilterBar', () => {
  let fixture: ComponentFixture<TransactionFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionFilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFilterBar);
    fixture.componentRef.setInput('filters', EMPTY_TRANSACTION_FILTERS);
    fixture.componentRef.setInput('assetOptions', [bitcoinAsset]);
    fixture.componentRef.setInput('showClear', false);
    fixture.detectChanges();
  });

  it('should emit filtersChange when type changes', () => {
    const filtersChange = vi.fn();
    fixture.componentInstance.filtersChange.subscribe(filtersChange);

    const select = fixture.nativeElement.querySelector('#transaction-type-filter');
    select.value = 'buy';
    select.dispatchEvent(new Event('change'));

    expect(filtersChange).toHaveBeenCalledWith({
      ...EMPTY_TRANSACTION_FILTERS,
      type: 'buy',
    });
  });

  it('should emit clearFilters when clear button is clicked', () => {
    const clearFilters = vi.fn();
    fixture.componentRef.setInput('showClear', true);
    fixture.componentInstance.clearFilters.subscribe(clearFilters);
    fixture.detectChanges();

    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    const clearButton = buttons.find((b) => b.textContent?.trim() === 'Clear filters');
    clearButton?.click();

    expect(clearFilters).toHaveBeenCalled();
  });
});
