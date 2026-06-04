import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, ethereumAsset } from '@shared/utils/__fixtures__/transactions';

import { TransactionAssetFilter } from './transaction-asset-filter';

describe('TransactionAssetFilter', () => {
  let fixture: ComponentFixture<TransactionAssetFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionAssetFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionAssetFilter);
    fixture.componentRef.setInput('options', [bitcoinAsset, ethereumAsset]);
    fixture.componentRef.setInput('selectedIds', []);
    fixture.detectChanges();
  });

  it('should emit selected ids when an asset is toggled on', () => {
    const selectedIdsChange = vi.fn();
    fixture.componentInstance.selectedIdsChange.subscribe(selectedIdsChange);

    fixture.componentInstance.toggleAsset('bitcoin');

    expect(selectedIdsChange).toHaveBeenCalledWith(['bitcoin']);
  });

  it('should filter options by search query', () => {
    fixture.componentInstance.togglePanel();
    fixture.componentInstance.onSearchInput({ target: { value: 'eth' } } as unknown as Event);
    fixture.detectChanges();

    expect(fixture.componentInstance.filteredOptions().map((a) => a.symbol)).toEqual(['ETH']);
  });
});
