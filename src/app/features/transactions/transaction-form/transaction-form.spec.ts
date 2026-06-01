import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetsService } from '@features/assets/assets.service';

import { TransactionForm } from './transaction-form';

describe('TransactionForm', () => {
  let fixture: ComponentFixture<TransactionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionForm],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            search: vi.fn().mockResolvedValue([]),
            cacheSelected: vi.fn(),
            getCachedSelected: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marks required fields when submitting an empty form', () => {
    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement | null;
    submitButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This field is required');
  });
});
