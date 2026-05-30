import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { THEME_STORAGE_KEY } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let setAttributeSpy: ReturnType<typeof vi.spyOn>;

  function prepareEnvironment(stored: 'light' | 'dark' | null = null): void {
    localStorage.clear();
    if (stored !== null) {
      localStorage.setItem(THEME_STORAGE_KEY, stored);
    }
    setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  }

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    prepareEnvironment();
    expect(service).toBeTruthy();
  });

  it('defaults to light when nothing is stored', () => {
    prepareEnvironment(null);
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
  });

  it('hydrates from localStorage on init', () => {
    prepareEnvironment('dark');
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('setTheme updates signal, storage and data-theme on documentElement', () => {
    prepareEnvironment();
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('toggle switches from light to dark', () => {
    prepareEnvironment();
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('toggle switches from dark to light', () => {
    prepareEnvironment('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
