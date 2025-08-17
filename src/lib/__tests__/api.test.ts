import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('instances API', () => {
    it('should list instances successfully', async () => {
      const mockInstances = [
        { id: '1', name: 'BTC-USDT', status: 'running', pnl: 100 }
      ];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockInstances })
      });

      const result = await api.instances.list();
      
      expect(fetch).toHaveBeenCalledWith('/api/instances', {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result.data).toEqual(mockInstances);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await api.instances.list();
      
      expect(result.error).toBe('HTTP 500: Internal Server Error');
      expect(result.data).toBeUndefined();
    });

    it('should create instance with correct data', async () => {
      const newInstance = { 
        name: 'ETH-USDT', 
        exchange: 'binance', 
        symbol: 'ETHUSDT' 
      };
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '2', ...newInstance } })
      });

      const result = await api.instances.create(newInstance);
      
      expect(fetch).toHaveBeenCalledWith('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstance)
      });
      expect(result.data?.name).toBe(newInstance.name);
    });
  });

  describe('backtest API', () => {
    it('should start backtest job', async () => {
      const backtestParams = {
        symbol: 'BTCUSDT',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        strategy: 'grid',
        parameters: { grid_span: 0.02 }
      };
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: 'bt_1', status: 'queued' })
      });

      const result = await api.backtest.run(backtestParams);
      
      expect(fetch).toHaveBeenCalledWith('/api/run/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backtestParams)
      });
      expect(result.data?.job_id).toBe('bt_1');
    });
  });

  describe('dashboard API', () => {
    it('should fetch dashboard stats', async () => {
      const mockStats = {
        total_instances: 5,
        running_instances: 3,
        total_pnl: 1247.83
      };
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStats })
      });

      const result = await api.dashboard.stats();
      
      expect(result.data).toEqual(mockStats);
    });
  });
});