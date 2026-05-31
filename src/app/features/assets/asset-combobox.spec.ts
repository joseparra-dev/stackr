import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCombobox } from './asset-combobox';

describe('AssetCombobox', () => {
  let component: AssetCombobox;
  let fixture: ComponentFixture<AssetCombobox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCombobox],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetCombobox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
