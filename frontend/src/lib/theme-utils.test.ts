import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSystemTheme,
  getStoredTheme,
  applyTheme,
  STORAGE_KEY,
} from './theme-utils';

describe('theme-utils', () => {
  const mockLocalStorage: Record<string, string> = {};
  const mockClassList = { add: vi.fn(), remove: vi.fn() };

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        Object.keys(mockLocalStorage).forEach(
          (k) => delete mockLocalStorage[k],
        );
      },
      length: 0,
      key: () => null,
    });
    vi.stubGlobal('document', {
      documentElement: { classList: mockClassList },
    });
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    delete mockLocalStorage[STORAGE_KEY];
  });

  describe('getSystemTheme', () => {
    it('returns dark when prefers-color-scheme matches dark', () => {
      vi.stubGlobal('window', {
        matchMedia: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
        }),
      });
      expect(getSystemTheme()).toBe('dark');
    });

    it('returns light when prefers-color-scheme does not match dark', () => {
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: false }),
      });
      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('getStoredTheme', () => {
    it('returns null when nothing stored', () => {
      expect(getStoredTheme()).toBeNull();
    });

    it('returns stored light', () => {
      mockLocalStorage[STORAGE_KEY] = 'light';
      expect(getStoredTheme()).toBe('light');
    });

    it('returns stored dark', () => {
      mockLocalStorage[STORAGE_KEY] = 'dark';
      expect(getStoredTheme()).toBe('dark');
    });

    it('returns null for invalid stored value', () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid';
      expect(getStoredTheme()).toBeNull();
    });
  });

  describe('applyTheme', () => {
    it('adds dark class for dark theme', () => {
      applyTheme('dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    it('removes dark class for light theme', () => {
      applyTheme('light');
      expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    });
  });
});
