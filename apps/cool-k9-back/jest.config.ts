/**
 * Jest configuration for the NestJS backend.
 *
 * The Nx preset already wires ts-jest against `tsconfig.spec.json`, which
 * carries the `experimentalDecorators` / `emitDecoratorMetadata` flags Nest
 * relies on for dependency injection. Only the node environment and the
 * project-specific paths are overridden here.
 */
export default {
  displayName: 'cool-k9-back',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  // The repo convention is a single `.spec` suffix (see CLAUDE.md); the Nx preset
  // would also pick up `.test`, which would let the two drift apart again.
  testMatch: ['**/?(*.)+(spec).?([mc])[jt]s?(x)'],
  // A run that matches no test file is a tooling failure, not a success: it is
  // exactly how the previous `passWithNoTests` target hid the absence of tests.
  passWithNoTests: false,
  coverageDirectory: '../../coverage/apps/cool-k9-back',
  /**
   * The threshold covers the layers that carry logic — services, controllers and
   * guards — and nothing else. Modules, DTOs, the entry point and the Supabase
   * wiring are declaration or plumbing: including them would inflate the figure
   * with code that has nothing to assert, and invite tests written to lift a
   * percentage rather than to catch a defect.
   */
  collectCoverageFrom: [
    'src/app/**/*.service.ts',
    'src/app/**/*.controller.ts',
    'src/app/auth/*.guard.ts',
    '!src/app/supabase/supabase.service.ts',
  ],
  /**
   * Set just under the level actually reached, so a genuine regression trips the
   * build while an unrelated refactor does not. Branches sit lower than the rest:
   * much of what remains is `?? null` fallbacks on optional columns.
   */
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 75,
      functions: 100,
      lines: 95,
    },
  },
  moduleNameMapper: {
    '^@models$': '<rootDir>/../../libs/models/src/index.ts',
  },
};
