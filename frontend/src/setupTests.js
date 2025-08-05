import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Setup default fetch responses
beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ trips: [] }),
  });
});

