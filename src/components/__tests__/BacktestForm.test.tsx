import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BacktestForm } from '@/components/backtest/BacktestForm';

describe('BacktestForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    const { getByText } = render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(getByText('Backtest Configuration')).toBeInTheDocument();
    expect(getByText('Exchange')).toBeInTheDocument();
    expect(getByText('Trading Pair')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<BacktestForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /starting backtest/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /start backtest/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    // Clear a required field
    const leverageInput = screen.getByDisplayValue('10');
    fireEvent.change(leverageInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button', { name: /start backtest/i });
    fireEvent.click(submitButton);
    
    // Form should not submit with invalid data
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});