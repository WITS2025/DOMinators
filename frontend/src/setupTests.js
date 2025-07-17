
import '@testing-library/jest-dom'

// Mock fetch globally for all tests
import { vi } from 'vitest'

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
)

import '@testing-library/jest-dom';

