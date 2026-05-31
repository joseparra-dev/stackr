import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';

import { AssetCombobox } from './asset-combobox';
import { AssetsService } from './assets.service';
import type { AssetSearchResult } from './assets.types';

const bitcoin: AssetSearchResult = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  marketCapRank: 1,
  thumbUrl: 'https://example.com/btc.png',
};

describe('AssetCombobox', () => {
  let component: AssetCombobox;
  let fixture: ComponentFixture<AssetCombobox>;
  let searchMock: ReturnType<typeof vi.fn>;
  let cacheSelectedMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    searchMock = vi.fn().mockResolvedValue([bitcoin]);
    cacheSelectedMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [AssetCombobox],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            search: searchMock,
            cacheSelected: cacheSelectedMock,
            getCachedSelected: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetCombobox);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits assetSelected and caches the asset when an option is selected', () => {
    const emitSpy = vi.spyOn(component.assetSelected, 'emit');

    component.selectAsset(bitcoin);

    expect(cacheSelectedMock).toHaveBeenCalledWith(bitcoin);
    expect(emitSpy).toHaveBeenCalledWith(bitcoin);
    expect(component.searchQuery()).toBe('Bitcoin (BTC)');
    expect(component.results()).toEqual([]);
  });

  it('clears the entire input when editing a confirmed selection', () => {
    const clearedSpy = vi.spyOn(component.assetCleared, 'emit');

    component.selectAsset(bitcoin);
    component.onQueryInput({ target: { value: 'Bitcoin (BT' } } as unknown as Event);

    expect(component.searchQuery()).toBe('');
    expect(clearedSpy).toHaveBeenCalledOnce();
  });

  it('opens the panel after selecting and searching again without refocusing', async () => {
    const ethereum = {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      marketCapRank: 2,
      thumbUrl: 'https://example.com/eth.png',
    };
    searchMock.mockResolvedValueOnce([ethereum]);

    component.selectAsset(bitcoin);
    component.onQueryInput({ target: { value: 'Bitcoin (BT' } } as unknown as Event);
    component.onQueryInput({ target: { value: 'eth' } } as unknown as Event);
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#asset-combobox-listbox')).toBeTruthy();
  });

  it('navigates options with arrow keys and selects the highlighted one on Enter', async () => {
    const ethereum: AssetSearchResult = {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      marketCapRank: 2,
      thumbUrl: 'https://example.com/eth.png',
    };
    searchMock.mockResolvedValueOnce([bitcoin, ethereum]);
    const emitSpy = vi.spyOn(component.assetSelected, 'emit');

    component.onInputFocus();
    component.onQueryInput({ target: { value: 'eth' } } as unknown as Event);
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    await fixture.whenStable();

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(1);

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(emitSpy).toHaveBeenCalledWith(ethereum);
  });

  it('shows a user-facing error message when search fails', async () => {
    searchMock.mockRejectedValueOnce(new AppError('api/rate-limit', 'slow down'));

    component.onInputFocus();
    component.onQueryInput({ target: { value: 'bit' } } as unknown as Event);
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error()?.code).toBe('api/rate-limit');
    expect(fixture.nativeElement.textContent).toContain('Too many attempts');
  });
});
