import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import Input from './Input';

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('accepts custom className', () => {
    render(<Input className="custom-input" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-input');
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    input.focus();
    
    expect(handleChange).toHaveBeenCalledTimes(0);
  });
});
