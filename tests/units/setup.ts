import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);

// DOM tests exercise behavior and accessible names. Actual layout, scrolling,
// pointer positioning, and responsive rendering are checked in Storybook browsers.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    dispatchEvent: () => false,
  }));
}
HTMLElement.prototype.scrollIntoView ??= function () {};
HTMLElement.prototype.hasPointerCapture ??= function () { return false; };
HTMLElement.prototype.setPointerCapture ??= function () {};
HTMLElement.prototype.releasePointerCapture ??= function () {};
