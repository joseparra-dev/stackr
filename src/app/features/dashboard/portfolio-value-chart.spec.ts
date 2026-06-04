import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from '@core/theme/theme.service';
import { EmptyState } from '@shared/ui';

import { PortfolioValueChart } from './portfolio-value-chart';

describe('PortfolioValueChart', () => {
  let fixture: ComponentFixture<PortfolioValueChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioValueChart],
      providers: [ThemeService],
    })
      .overrideComponent(PortfolioValueChart, {
        set: { imports: [EmptyState], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioValueChart);
  });

  it('shows empty state when there is not enough data', () => {
    fixture.componentRef.setInput('points', [{ date: '2026-06-01', valueUsd: 100 }]);
    fixture.componentRef.setInput('selectedRange', 7);
    fixture.componentRef.setInput('hasEnoughData', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Not enough history yet');
    expect(fixture.nativeElement.querySelector('apx-chart')).toBeNull();
  });

  it('emits rangeChange when a tab is selected', () => {
    const rangeChange = vi.fn();
    fixture.componentRef.setInput('points', [
      { date: '2026-06-01', valueUsd: 100 },
      { date: '2026-06-02', valueUsd: 200 },
    ]);
    fixture.componentRef.setInput('selectedRange', 7);
    fixture.componentRef.setInput('hasEnoughData', true);
    fixture.componentInstance.rangeChange.subscribe(rangeChange);
    fixture.detectChanges();

    const tab = fixture.nativeElement.querySelector('[role="tablist"] button:last-child');
    tab?.click();
    fixture.detectChanges();

    expect(rangeChange).toHaveBeenCalledWith(90);
  });
});
