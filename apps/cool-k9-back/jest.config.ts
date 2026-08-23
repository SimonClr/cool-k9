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
  // A run that matches no test file is a tooling failure, not a success: it is
  // exactly how the previous `passWithNoTests` target hid the absence of tests.
  passWithNoTests: false,
  coverageDirectory: '../../coverage/apps/cool-k9-back',
  moduleNameMapper: {
    '^@models$': '<rootDir>/../../libs/models/src/index.ts',
  },
};
