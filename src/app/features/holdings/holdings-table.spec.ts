import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';
import { calculateHoldings } from '@shared/utils/math';

import { HoldingsTable } from './holdings-table';

describe('HoldingsTable', () => {
  let fixture: ComponentFixture<HoldingsTable>;

  const holding = calculateHoldings(
    [makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 })],
    { bitcoin: 60_000 },
  )[0]!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingsTable);
    fixture.componentRef.setInput('holdings', [holding]);
    fixture.componentRef.setInput('sortKey', 'currentValue');
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();
  });

  it('should render holding metrics', () => {
    expect(fixture.nativeElement.textContent).toContain('BTC');
    expect(fixture.nativeElement.textContent).toContain('Bitcoin');
  });

  it('should emit sortChange when a column header is clicked', () => {
    const sortChange = vi.fn();
    fixture.componentInstance.sortChange.subscribe(sortChange);

    const button = fixture.nativeElement.querySelector('button[aria-sort]');
    button?.click();

    expect(sortChange).toHaveBeenCalled();
  });

  it('should emit rowSelect when a row is clicked', () => {
    const rowSelect = vi.fn();
    fixture.componentInstance.rowSelect.subscribe(rowSelect);

    const row = fixture.nativeElement.querySelector('tbody tr');
    row?.click();

    expect(rowSelect).toHaveBeenCalledWith(holding);
  });
});
