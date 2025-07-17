import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ContactUs from './ContactUs'; // Adjust the path if needed

describe('ContactUs component', () => {
  it('renders the heading and intro text', () => {
    render(<ContactUs />);
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByText(/have questions about your itinerary/i)).toBeInTheDocument();
  });

  it('renders the form fields', () => {
    render(<ContactUs />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<ContactUs />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('allows typing into the form fields', async () => {
    render(<ContactUs />);
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'jane@example.com');
    await user.type(messageInput, 'I would like help planning a trip.');

    expect(nameInput).toHaveValue('Jane Doe');
    expect(emailInput).toHaveValue('jane@example.com');
    expect(messageInput).toHaveValue('I would like help planning a trip.');
  });
});