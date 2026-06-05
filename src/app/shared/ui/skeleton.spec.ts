import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(Skeleton);
  });

  it('renders table row placeholders', () => {
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('rows', 2);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.animate-pulse.rounded-xl');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('renders chart placeholder', () => {
    fixture.componentRef.setInput('variant', 'chart');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.h-\\[280px\\]')).toBeTruthy();
  });
});
