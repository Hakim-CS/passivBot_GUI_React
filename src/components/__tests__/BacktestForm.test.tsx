import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
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
    const { getByRole } = render(<BacktestForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = getByRole('button', { name: /starting backtest/i });
    expect(submitButton).toBeDisabled();
  });

  it('renders submit button correctly', () => {
    const { getByRole } = render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = getByRole('button', { name: /start backtest/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('renders all required form fields', () => {
    const { getByText } = render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(getByText('Strategy')).toBeInTheDocument();
    expect(getByText('Leverage')).toBeInTheDocument();
    expect(getByText('Position Size')).toBeInTheDocument();
    expect(getByText('Grid Span')).toBeInTheDocument();
  });

  it('displays form description correctly', () => {
    const { getByText } = render(<BacktestForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(getByText('Configure your backtesting parameters to simulate trading strategies')).toBeInTheDocument();
  });
});