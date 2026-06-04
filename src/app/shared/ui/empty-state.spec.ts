import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('headingId', 'test-empty-heading');
    fixture.componentRef.setInput('title', 'Nothing here');
    fixture.componentRef.setInput('message', 'Add something to get started.');
    fixture.detectChanges();
  });

  it('renders title and message in an accessible region', () => {
    const region = fixture.nativeElement.querySelector('[role="region"]');
    expect(region?.getAttribute('aria-labelledby')).toBe('test-empty-heading');
    expect(fixture.nativeElement.textContent).toContain('Nothing here');
    expect(fixture.nativeElement.textContent).toContain('Add something to get started.');
  });

  it('emits ctaClick when the CTA button is pressed', () => {
    const ctaClick = vi.fn();
    fixture.componentRef.setInput('ctaLabel', 'Get started');
    fixture.componentInstance.ctaClick.subscribe(ctaClick);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(ctaClick).toHaveBeenCalled();
  });
});
