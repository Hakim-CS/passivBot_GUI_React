/**
 * Backtest.tsx
 *
 * Modernized Phase 1 (enhanced) version of the Backtest page.
 * This keeps compatibility with the existing backtest store while:
 *  - Adding stronger local typing
 *  - Introducing phase/progress mapping (synthetic until real backend)
 *  - Auto–refreshing job list while there are active jobs
 *  - Improving tab UX (disable Results when nothing selected)
 *  - Resetting currentJob when clearing results
 *  - Adding quick actions (View Log placeholder, Re‑Queue placeholder)
 *
 * NOTE:
 *  - This file assumes the existing store API:
 *      useBacktestStore(): {
 *        jobs, currentJob, results, isLoading, error,
 *        fetchJobs(), startBacktest(formData),
 *        fetchResults(jobId), clearResults(), setCurrentJob(job)
 *      }
 *  - If you later extend the store with richer types (BacktestPhase etc.),
 *    you can remove the synthetic helpers below.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BacktestForm } from '@/components/backtest/BacktestForm';
import { JobStatus } from '@/components/backtest/JobStatus';
import { ResultsCharts } from '@/components/backtest/ResultsCharts';
import { TradeHistory } from '@/components/backtest/TradeHistory';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, FileText, Repeat2 } from 'lucide-react';
import { useBacktestStore } from '@/store/backtestStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ---------- Local Typing (lightweight until store refactor) ----------
type RawJob = {
  id: string;
  type: 'backtest' | 'optimize';  // Required by BacktestJob
  status: 'queued' | 'running' | 'completed' | 'failed';  // Match exact union type
  progress: number;        // Required by BacktestJob
  created_at: string;      // Required by BacktestJob (note: underscore format)
  symbol?: string;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  params?: Record<string, any>;
  // Optional fields you might add later:
  // phase?: string;
  // progressPct?: number;
};

type BacktestResult = any; // Replace with richer interface once store updated.

// Synthetic phase mapping (if backend does not yet differentiate)
type BacktestPhase = 'queued' | 'downloading' | 'backtesting' | 'plotting' | 'completed' | 'error';

interface PhaseInfo {
  phase: BacktestPhase;
  progressPct: number;
}

function derivePhase(job: RawJob): PhaseInfo {
  // If backend starts returning explicit phase / progress, just return those.
  switch (job.status) {
    case 'failed':
      return { phase: 'error', progressPct: 100 };
    case 'completed':
      return { phase: 'completed', progressPct: 100 };
    case 'running':
      // Without granular info we "simulate" phases based on elapsed time.
      // This is placeholder logic; replace once backend supplies phase data.
      const started = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
      const elapsedSec = (Date.now() - started) / 1000;
      if (elapsedSec < 5) return { phase: 'downloading', progressPct: 10 + elapsedSec * 2 };
      if (elapsedSec < 15) return { phase: 'backtesting', progressPct: 30 + (elapsedSec - 5) * 4 };
      if (elapsedSec < 22) return { phase: 'plotting', progressPct: 70 + (elapsedSec - 15) * 4 };
      return { phase: 'plotting', progressPct: 90 };
    case 'queued':
      return { phase: 'queued', progressPct: 0 };
    default:
      return { phase: 'queued', progressPct: 0 };
  }
}

// Human readable labels
const phaseLabel: Record<BacktestPhase, string> = {
  queued: 'Queued',
  downloading: 'Downloading Data',
  backtesting: 'Running Backtest',
  plotting: 'Generating Plots',
  completed: 'Completed',
  error: 'Error'
};

// Color classes (Tailwind)
const phaseColor: Record<BacktestPhase, string> = {
  queued: 'bg-muted text-muted-foreground',
  downloading: 'bg-blue-100 text-blue-700 dark:bg-blue-800/40 dark:text-blue-300',
  backtesting: 'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300',
  plotting: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800/40 dark:text-indigo-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300',
  error: 'bg-destructive/15 text-destructive'
};

// ---------- Component ----------
export default function Backtest() {
  const {
    jobs,
    currentJob,
    results,
    isLoading,
    error,
    fetchJobs,
    startBacktest,
    fetchResults,
    clearResults,
    setCurrentJob
  } = useBacktestStore();

  const [activeTab, setActiveTab] = useState<'form' | 'jobs' | 'results'>('form');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto polling while there are active jobs (running/queued) and autoRefresh enabled
  useEffect(() => {
    const hasActive = jobs.some(j => ['queued', 'running'].includes(j.status));
    if (!hasActive || !autoRefresh) return;
    const id = setInterval(() => {
      fetchJobs();
      // If currently viewing a running job's results, refetch them for near-real-time charts
      if (currentJob && ['running', 'queued'].includes(currentJob.status)) {
        fetchResults(currentJob.id).catch(() => {});
      }
    }, 4000);
    return () => clearInterval(id);
  }, [jobs, autoRefresh, fetchJobs, currentJob, fetchResults]);

  const handleSubmitBacktest = async (formData: Record<string, any>) => {
    try {
      const jobId = await startBacktest(formData);
      toast({
        title: 'Backtest Started',
        description: `Job ${jobId} has been queued for processing.`
      });
      setActiveTab('jobs');
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to start backtest. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleViewResults = useCallback(
    async (job: RawJob) => {
      setCurrentJob(job);
      await fetchResults(job.id);
      setActiveTab('results');
    },
    [setCurrentJob, fetchResults]
  );

  const handleRefreshJobs = () => {
    fetchJobs();
  };

  const handleClearResults = () => {
    clearResults();
    // Also drop current job reference so the Results tab shows the empty state
    try {
      setCurrentJob(undefined);
    } catch {
      /* swallow if store enforces non-null */
    }
  };

  const completedJobs = useMemo(
    () => jobs.filter(job => job.status === 'completed'),
    [jobs]
  );
  const activeJobs = useMemo(
    () => jobs.filter(job => ['running', 'queued'].includes(job.status)),
    [jobs]
  );

  const resultsTabDisabled = !results || !currentJob;

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      }),
    [jobs]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Backtesting</h1>
          <p className="text-muted-foreground">
            Test your strategies against historical data
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as typeof activeTab)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">New Backtest</TabsTrigger>
            <TabsTrigger value="jobs" className="relative">
              Job Status
              {activeJobs.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={resultsTabDisabled}
              className={cn(resultsTabDisabled && 'cursor-not-allowed opacity-50')}
            >
              Results
            </TabsTrigger>
          </TabsList>

            {/* New Backtest */}
          <TabsContent value="form">
            <BacktestForm onSubmit={handleSubmitBacktest} isLoading={isLoading} />
          </TabsContent>

            {/* Job Status */}
          <TabsContent value="jobs" className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Backtest Jobs</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshJobs}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={cn(
                        'h-4 w-4 mr-2',
                        isLoading && 'animate-spin'
                      )}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant={autoRefresh ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAutoRefresh(a => !a)}
                  >
                    {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Active: {activeJobs.length} • Completed: {completedJobs.length}
              </p>
            </div>

            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {sortedJobs.length > 0 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    All Jobs
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sortedJobs.map(job => {
                      const { phase, progressPct } = derivePhase(job);
                      return (
                        <div key={job.id} className="group relative">
                          <JobStatus
                            job={job}
                            onViewResults={() =>
                              job.status === 'completed'
                                ? handleViewResults(job)
                                : toast({
                                    title: 'Not Ready',
                                    description:
                                      'Results available after completion.'
                                  })
                            }
                          />
                          {/* Inline progress + phase */}
                          {phase !== 'completed' && phase !== 'error' && (
                            <div className="mt-2 space-y-1 px-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {phaseLabel[phase]}
                                </span>
                                <span className="text-xs font-medium">
                                  {Math.min(100, Math.round(progressPct))}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded bg-muted">
                                <div
                                  className={cn(
                                    'h-full rounded transition-all',
                                    phase === 'downloading' && 'bg-blue-500',
                                    phase === 'backtesting' && 'bg-amber-500',
                                    phase === 'plotting' && 'bg-indigo-500',
                                    phase === 'queued' && 'bg-muted-foreground/30'
                                  )}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {/* Phase Badge */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={cn(
                                'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                phaseColor[phase]
                              )}
                            >
                              {phaseLabel[phase]}
                            </span>
                          </div>
                          {/* Quick Actions (placeholders) */}
                          <div className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 translate-y-full gap-2 rounded-md border bg-background p-2 shadow-md group-hover:flex">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="View Log (Coming Soon)"
                              onClick={() =>
                                toast({
                                  title: 'Coming Soon',
                                  description: 'Log viewer not implemented yet.'
                                })
                              }
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Re-Queue (Coming Soon)"
                              onClick={() =>
                                toast({
                                  title: 'Coming Soon',
                                  description:
                                    'Re-queue functionality not implemented yet.'
                                })
                              }
                            >
                              <Repeat2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recently Completed (top 5) */}
                {completedJobs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-lg font-medium">
                      <History className="h-5 w-5" />
                      Recent Completed
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {completedJobs
                        .slice(0, 5)
                        .map(job => (
                          <JobStatus
                            key={job.id}
                            job={job}
                            onViewResults={() => handleViewResults(job)}
                          />
                        ))}
                    </div>
                    {completedJobs.length > 5 && (
                      <p className="text-center text-xs text-muted-foreground">
                        Showing the 5 most recent completed jobs
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {jobs.length === 0 && !isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>No Jobs Found</CardTitle>
                  <CardDescription>
                    Start your first backtest to see job status here.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

            {/* Results */}
          <TabsContent value="results" className="space-y-6">
            {results && currentJob ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Backtest Results – {currentJob.symbol || 'Unknown Symbol'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {(currentJob.params?.strategy ||
                        currentJob.params?.strategyMode ||
                        'Strategy')}{' '}
                      • {currentJob.params?.start_date || '—'} to{' '}
                      {currentJob.params?.end_date || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearResults}
                      disabled={isLoading}
                    >
                      Clear Results
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentJob) {
                          fetchResults(currentJob.id);
                        }
                      }}
                      disabled={
                        !currentJob ||
                        ['queued', 'running'].includes(currentJob.status)
                      }
                    >
                      Refresh Results
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="charts" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="trades">Trade History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="charts">
                    <ResultsCharts results={results as BacktestResult} />
                  </TabsContent>

                  <TabsContent value="trades">
                    <TradeHistory results={results as BacktestResult} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Results Selected</CardTitle>
                  <CardDescription>
                    Complete a backtest and open results from the Job Status tab.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}