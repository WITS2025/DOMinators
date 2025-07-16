// ✅ MOCK REACT ROUTER BEFORE ANYTHING ELSE
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// ✅ IMPORTS AFTER MOCK
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Home from './Home';

describe('Home component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear(); // reset between tests
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the main heading', () => {
    render(<Home />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('heading', {
        name: /TripTrek: Where Adventures Begin with a Plan/i,
      })
    ).toBeInTheDocument();
  });

  it('renders the "Plan Your Next Trip" button', () => {
    render(<Home />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('button', { name: /Plan Your Next Trip/i })
    ).toBeInTheDocument();
  });

  it('calls navigate when the button is clicked', async () => {
    render(<Home />, { wrapper: MemoryRouter });

    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Plan Your Next Trip/i });

    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/trips');
  });

  it('renders all expected carousel captions', () => {
    render(<Home />, { wrapper: MemoryRouter });

    expect(screen.getAllByText(/Turn Dreams Into Destinations/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Every Stop, Right Where It Belongs/i)).toBeInTheDocument();
    expect(screen.getByText(/Don’t Just Travel. Trek with a Plan/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Because the Best Trips Start with a Plan/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No More Guesswork – Just Great Adventures/i)).toBeInTheDocument();
  });
});
