/**
 * Vitest setup file, loaded before every frontend test file.
 *
 * Registers the DOM matchers (`toBeInTheDocument`, `toBeDisabled`…) and clears
 * the rendered tree between tests: Testing Library only auto-cleans when it can
 * detect the runner's global hooks, which is not guaranteed here.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

/**
 * jsdom implements neither of these browser APIs, and the Radix primitives behind
 * the shadcn/ui components call them on mount. Without the stubs, rendering any
 * view containing a checkbox, a select or a dialog throws before a single
 * assertion runs.
 */
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {
      /* no layout in jsdom, so nothing to report */
    }
    unobserve() {
      /* no-op */
    }
    disconnect() {
      /* no-op */
    }
  };
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}
