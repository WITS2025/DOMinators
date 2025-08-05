import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock AuthContext globally (this is the main one causing failures)
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      userId: 'test-user-id-123',
      username: 'testuser'
    },
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock react-router-dom globally
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-trip-id' }),
    useLocation: () => ({ pathname: '/test' }),
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ trips: [] })
  })
);

beforeEach(() => {
  vi.clearAllMocks();
  fetch.mockClear();
});

