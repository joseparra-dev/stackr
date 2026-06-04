import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from '@core/theme/theme.service';
import { EmptyState } from '@shared/ui';
import type { Holding } from '@shared/utils/holdings.types';

import { AllocationChart } from './allocation-chart';

function makeHolding(overrides: Partial<Holding> & Pick<Holding, 'assetId' | 'symbol'>): Holding {
  return {
    name: overrides.name ?? overrides.symbol,
    thumbUrl: '',
    quantity: 1,
    avgCostUsd: 100,
    currentPriceUsd: 100,
    costBasisUsd: 100,
    pnlRealizedUsd: 0,
    pnlUnrealizedUsd: 0,
    pnlTotalUsd: 0,
    pnlPercent: 0,
    currentValueUsd: overrides.currentValueUsd ?? 0,
    ...overrides,
  };
}

describe('AllocationChart', () => {
  let fixture: ComponentFixture<AllocationChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationChart],
      providers: [ThemeService],
    })
      .overrideComponent(AllocationChart, {
        set: { imports: [EmptyState], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AllocationChart);
  });

  it('should show fallback copy when there are no valued holdings', () => {
    fixture.componentRef.setInput('holdings', [
      makeHolding({ assetId: 'bitcoin', symbol: 'BTC', currentValueUsd: 0 }),
    ]);
    fixture.componentRef.setInput('totalValueUsd', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Allocation appears once assets have a live price');
    expect(fixture.nativeElement.querySelector('apx-chart')).toBeNull();
  });

  it('should render chart and accessible summary when slices exist', () => {
    fixture.componentRef.setInput('holdings', [
      makeHolding({ assetId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', currentValueUsd: 600 }),
      makeHolding({ assetId: 'ethereum', symbol: 'ETH', name: 'Ethereum', currentValueUsd: 400 }),
    ]);
    fixture.componentRef.setInput('totalValueUsd', 1000);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('[role="img"]');
    expect(img?.getAttribute('aria-label')).toContain('BTC 60.0%');
    expect(img?.getAttribute('aria-label')).toContain('ETH 40.0%');
    expect(fixture.nativeElement.querySelector('apx-chart')).toBeTruthy();

    const srOnly = fixture.nativeElement.querySelector('.sr-only');
    expect(srOnly?.textContent).toContain('Bitcoin (BTC)');
    expect(srOnly?.textContent).toContain('Ethereum (ETH)');
  });
});
