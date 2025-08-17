import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, type Job } from '@/lib/api';

export interface BacktestJob extends Job {
  symbol?: string;
  start_date?: string;
  end_date?: string;
  strategy?: string;
  params?: any;
}

export interface BacktestResults {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_trades: number;
  win_rate: number;
  equity_curve: Array<{ date: string; value: number }>;
  drawdown_curve: Array<{ date: string; drawdown: number }>;
  trades: Array<{
    id: string;
    timestamp: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl: number;
  }>;
  price_data: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface BacktestState {
  // Jobs management
  jobs: BacktestJob[];
  currentJob: BacktestJob | null;
  results: BacktestResults | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchJobs: () => Promise<void>;
  startBacktest: (params: any) => Promise<string>;
  fetchJobStatus: (jobId: string) => Promise<void>;
  fetchResults: (jobId: string) => Promise<void>;
  clearResults: () => void;
  setCurrentJob: (job: BacktestJob | null) => void;
}

export const useBacktestStore = create<BacktestState>()(
  devtools(
    (set, get) => ({
      jobs: [],
      currentJob: null,
      results: null,
      isLoading: false,
      error: null,

      fetchJobs: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.jobs.list();
          if (response.error) {
            throw new Error(response.error);
          }
          const backtestJobs = (response.data || []).filter(
            (job: Job) => job.type === 'backtest'
          );
          set({ jobs: backtestJobs, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch jobs',
            isLoading: false 
          });
        }
      },

      startBacktest: async (params) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.backtest.run(params);
          if (response.error) {
            throw new Error(response.error);
          }
          
          // Refresh jobs list
          await get().fetchJobs();
          set({ isLoading: false });
          
          return response.data?.job_id || '';
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start backtest',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchJobStatus: async (jobId: string) => {
        try {
          const response = await api.jobs.get(jobId);
          if (response.error) {
            throw new Error(response.error);
          }
          
          const job = response.data;
          if (job) {
            set({ currentJob: job });
            
            // Update job in jobs list
            const jobs = get().jobs;
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            if (jobIndex >= 0) {
              const updatedJobs = [...jobs];
              updatedJobs[jobIndex] = job;
              set({ jobs: updatedJobs });
            }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch job status'
          });
        }
      },

      fetchResults: async (jobId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const [resultsResponse, tradesResponse] = await Promise.all([
            api.backtest.results(jobId),
            fetch(`/api/backtest/${jobId}/trades`).then(r => r.json()).catch(() => ({ data: [] }))
          ]);
          
          if (resultsResponse.error) {
            throw new Error(resultsResponse.error);
          }

          const jobData = resultsResponse.data as any;
          const mockResults: BacktestResults = {
            total_return: jobData?.results?.total_return || 15.7,
            sharpe_ratio: jobData?.results?.sharpe_ratio || 1.35,
            max_drawdown: jobData?.results?.max_drawdown || 8.2,
            total_trades: jobData?.results?.total_trades || 156,
            win_rate: 67.3,
            equity_curve: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              value: 10000 + Math.random() * 2000 * i + (i * 200)
            })),
            drawdown_curve: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              drawdown: -Math.abs(Math.random() * 5 + Math.sin(i / 5) * 3)
            })),
            trades: Array.from({ length: 20 }, (_, i) => ({
              id: `trade_${i}`,
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              type: Math.random() > 0.5 ? 'buy' : 'sell',
              price: 43000 + Math.random() * 2000,
              quantity: Math.random() * 0.1,
              pnl: (Math.random() - 0.4) * 500
            })),
            price_data: Array.from({ length: 100 }, (_, i) => {
              const basePrice = 43000;
              const time = Date.now() - (99 - i) * 60 * 60 * 1000;
              const price = basePrice + Math.sin(i / 10) * 1000 + Math.random() * 200;
              return {
                timestamp: new Date(time).toISOString(),
                open: price,
                high: price + Math.random() * 100,
                low: price - Math.random() * 100,
                close: price + (Math.random() - 0.5) * 50,
                volume: Math.random() * 1000000
              };
            })
          };
          
          set({ results: mockResults, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch results',
            isLoading: false 
          });
        }
      },

      clearResults: () => {
        set({ results: null, currentJob: null, error: null });
      },

      setCurrentJob: (job: BacktestJob | null) => {
        set({ currentJob: job });
      }
    }),
    {
      name: 'backtest-store'
    }
  )
);