/**
 * API client for PBGui React
 * Centralized API management with type safety
 */

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface Instance {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  status: 'running' | 'stopped' | 'error';
  pnl: number;
  position: number;
  created_at: string;
  updated_at: string;
}

interface BacktestParams {
  symbol: string;
  start_date: string;
  end_date: string;
  strategy: string;
  parameters: Record<string, any>;
}

interface OptimizeParams extends BacktestParams {
  optimization_method: 'grid' | 'genetic' | 'random';
  parameter_ranges: Record<string, [number, number]>;
}

interface Job {
  id: string;
  type: 'backtest' | 'optimize';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  results?: any;
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Instance Management
  instances = {
    list: () => this.request<Instance[]>('/instances'),
    
    get: (id: string) => this.request<Instance>(`/instances/${id}`),
    
    create: (data: Partial<Instance>) =>
      this.request<Instance>('/instances', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<Instance>) =>
      this.request<Instance>(`/instances/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      this.request(`/instances/${id}`, { method: 'DELETE' }),
    
    start: (id: string) =>
      this.request(`/instances/${id}/start`, { method: 'POST' }),
    
    stop: (id: string) =>
      this.request(`/instances/${id}/stop`, { method: 'POST' }),
    
    logs: (id: string) => {
      return new EventSource(`${this.baseUrl}/instances/${id}/logs`);
    },
  };

  // Backtesting
  backtest = {
    run: (params: BacktestParams) =>
      this.request<{ job_id: string }>('/run/backtest', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    
    results: (jobId: string) =>
      this.request(`/jobs/${jobId}/results`),
  };

  // Optimization
  optimize = {
    run: (params: OptimizeParams) =>
      this.request<{ job_id: string }>('/run/optimize', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    
    progress: (jobId: string) => {
      return new EventSource(`${this.baseUrl}/jobs/${jobId}/progress`);
    },
  };

  // Dashboard
  dashboard = {
    stats: () => this.request('/dashboard/stats'),
    
    performance: () => this.request('/dashboard/performance'),
    
    instancesSummary: () => this.request('/dashboard/instances/summary'),
  };

  // Remote Management
  remote = {
    sync: () => this.request('/remote/sync', { method: 'POST' }),
    
    status: () => this.request('/remote/status'),
    
    config: () => this.request('/remote/config'),
  };

  // Settings
  settings = {
    get: () => this.request('/settings'),
    
    update: (data: Record<string, any>) =>
      this.request('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    getPaths: () => this.request('/settings/paths'),
    
    updatePaths: (paths: Record<string, string>) =>
      this.request('/settings/paths', {
        method: 'PUT',
        body: JSON.stringify(paths),
      }),
  };

  // Market Data
  coins = {
    list: () => this.request('/coins'),
    
    markets: () => this.request('/coins/markets'),
    
    analyze: (symbol: string) =>
      this.request('/coins/analyze', {
        method: 'POST',
        body: JSON.stringify({ symbol }),
      }),
  };

  // Jobs
  jobs = {
    list: () => this.request<Job[]>('/jobs'),
    
    get: (id: string) => this.request<Job>(`/jobs/${id}`),
    
    cancel: (id: string) =>
      this.request(`/jobs/${id}/cancel`, { method: 'POST' }),
  };
}

export const api = new ApiClient();

// Type exports
export type {
  ApiResponse,
  Instance,
  BacktestParams,
  OptimizeParams,
  Job,
};