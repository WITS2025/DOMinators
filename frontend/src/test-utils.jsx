// Create a new file: src/test-utils.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

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
  Form: ({ children, ...props }) => <form {...props}>{children}</form>,
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  Row: ({ children, ...props }) => <div {...props}>{children}</div>,
  Col: ({ children, ...props }) => <div {...props}>{children}</div>,
  Spinner: ({ children, ...props }) => <div {...props}>Loading...</div>
}));

// Mock fetch globally for API calls
global.fetch = vi.fn();

// Custom render function with providers
const customRender = (ui, options) => render(ui, options);

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };