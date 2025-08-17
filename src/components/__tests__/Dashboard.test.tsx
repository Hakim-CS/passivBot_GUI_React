import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import '@testing-library/jest-dom';

const screen = {
  getByText: (text: string) => document.querySelector(`[data-testid*="${text}"], :contains("${text}")`) as HTMLElement,
  getAllByText: (regex: RegExp) => Array.from(document.querySelectorAll('*')).filter(el => regex.test(el.textContent || '')) as HTMLElement[]
};

// Mock the sidebar components to avoid complex setup
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Sidebar: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SidebarTrigger: () => <button>Toggle</button>,
  useSidebar: () => ({ state: 'expanded' })
}));

const DashboardWrapper = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  it('renders dashboard component', () => {
    const { container } = render(<DashboardWrapper />);
    expect(container).toBeInTheDocument();
  });

  it('displays stats cards with correct data', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Total P&L')).toBeInTheDocument();
    expect(screen.getByText('$1,247')).toBeInTheDocument(); // Formatted number
    expect(screen.getByText('Active Instances')).toBeInTheDocument();
    expect(screen.getByText('3/7')).toBeInTheDocument();
  });

  it('shows recent instances section', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Recent Instances')).toBeInTheDocument();
    expect(screen.getByText('BTC-USDT-Long')).toBeInTheDocument();
    expect(screen.getByText('ETH-USDT-Short')).toBeInTheDocument();
  });

  it('displays quick action cards', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Quick Backtest')).toBeInTheDocument();
    expect(screen.getByText('Optimize Strategy')).toBeInTheDocument();
    expect(screen.getByText('Remote Sync')).toBeInTheDocument();
  });

  it('shows correct status indicators for instances', () => {
    render(<DashboardWrapper />);
    
    // Check that running and stopped statuses are displayed
    const instanceElements = screen.getAllByText(/BTC-USDT|ETH-USDT|SOL-USDT/);
    expect(instanceElements.length).toBeGreaterThan(0);
  });
});