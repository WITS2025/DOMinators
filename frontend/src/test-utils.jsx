// Create a new file: src/test-utils.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom'; // Add this import for toBeInTheDocument

// Mock AuthContext globally for all tests
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      userId: 'test-user-id-123',
      username: 'testuser',
      signInDetails: { loginId: 'testuser' },
      attributes: {
        email: 'test@example.com'
      }
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
    BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-trip-id' }),
    useLocation: () => ({ pathname: '/test' })
  };
});

// Mock react-bootstrap globally
vi.mock('react-bootstrap', () => ({
  Navbar: {
    Brand: ({ children, ...props }) => <div {...props}>{children}</div>,
    Toggle: ({ children, ...props }) => <button {...props}>{children}</button>,
    Collapse: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  Nav: {
    Link: ({ children, ...props }) => <a {...props}>{children}</a>
  },
  Container: ({ children, ...props }) => <div {...props}>{children}</div>,
  Dropdown: {
    Toggle: ({ children, ...props }) => <div {...props}>{children}</div>,
    Menu: ({ children, ...props }) => <div {...props}>{children}</div>,
    Header: ({ children, ...props }) => <div {...props}>{children}</div>,
    Divider: (props) => <hr {...props} />,
    Item: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Form: {
    Group: ({ children, ...props }) => <div {...props}>{children}</div>,
    Label: ({ children, ...props }) => <label {...props}>{children}</label>,
    Control: ({ children, ...props }) => <input {...props}>{children}</input>,
    Select: ({ children, ...props }) => <select {...props}>{children}</select>
  },
  Card: {
    Body: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  Row: ({ children, ...props }) => <div {...props}>{children}</div>,
  Col: ({ children, ...props }) => <div {...props}>{children}</div>,
  Spinner: ({ children, ...props }) => <div {...props}>Loading...</div>,
  Alert: ({ children, ...props }) => <div {...props}>{children}</div>
}));

// Mock date-fns functions to prevent padStart errors
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return '2024-01-01'; // Return a valid date string
  }),
  eachDayOfInterval: vi.fn(() => [new Date('2024-01-01'), new Date('2024-01-02')]),
  parse: vi.fn((dateStr, formatStr, baseDate) => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
  })
}));

// Mock fetch globally for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ trips: [] })
  })
);

// Custom render function with providers
const customRender = (ui, options) => render(ui, options);

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };