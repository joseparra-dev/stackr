import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  let fixture: ComponentFixture<ErrorState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorState],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('error', new AppError('api/server-error', 'server'));
    fixture.detectChanges();
  });

  it('shows a user-facing message and retry button', () => {
    expect(fixture.nativeElement.textContent).toContain('Something went wrong on our side');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Try again');
  });

  it('emits retry when Try again is clicked', () => {
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);

    fixture.nativeElement.querySelector('button')?.click();

    expect(retry).toHaveBeenCalled();
  });
});
