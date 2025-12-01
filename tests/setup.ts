import { cleanup } from '@testing-library/react';

// React 19 strict effects guard
// @ts-expect-error: global flag for React Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
