import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';

// View di-lazy-load; muat pertama di jsdom bisa >1 dtk (batas default findBy).
configure({ asyncUtilTimeout: 8000 });

beforeEach(() => {
  localStorage.clear();
  // jsdom tidak mengimplementasi scroll
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  cleanup();
});
