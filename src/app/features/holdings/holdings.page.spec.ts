import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HoldingsPage } from './holdings.page';

describe('HoldingsPage', () => {
  let component: HoldingsPage;
  let fixture: ComponentFixture<HoldingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
