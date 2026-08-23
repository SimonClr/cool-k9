/**
 * Vitest setup file, loaded before every frontend test file.
 *
 * Registers the DOM matchers (`toBeInTheDocument`, `toBeDisabled`…) and clears
 * the rendered tree between tests: Testing Library only auto-cleans when it can
 * detect the runner's global hooks, which is not guaranteed here.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
