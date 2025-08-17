import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { BacktestForm } from '@/components/backtest/BacktestForm';
import { JobStatus } from '@/components/backtest/JobStatus';
import { ResultsCharts } from '@/components/backtest/ResultsCharts';
import { TradeHistory } from '@/components/backtest/TradeHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, History } from 'lucide-react';
import { useBacktestStore } from '@/store/backtestStore';
import { toast } from '@/hooks/use-toast';

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

  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSubmitBacktest = async (formData: any) => {
    try {
      const jobId = await startBacktest(formData);
      toast({
        title: "Backtest Started",
        description: `Job ${jobId} has been queued for processing.`,
      });
      
      // Switch to jobs tab to show progress
      setActiveTab('jobs');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start backtest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewResults = async (job: any) => {
    setCurrentJob(job);
    await fetchResults(job.id);
    setActiveTab('results');
  };

  const handleRefreshJobs = () => {
    fetchJobs();
  };

  const completedJobs = jobs.filter(job => job.status === 'completed');
  const activeJobs = jobs.filter(job => job.status === 'running' || job.status === 'queued');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backtesting</h1>
          <p className="text-muted-foreground">
            Test your strategies against historical data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">New Backtest</TabsTrigger>
            <TabsTrigger value="jobs" className="relative">
              Job Status
              {activeJobs.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <BacktestForm onSubmit={handleSubmitBacktest} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Backtest Jobs</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshJobs}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Active Jobs</h3>
                <div className="grid gap-4">
                  {activeJobs.map((job) => (
                    <JobStatus 
                      key={job.id} 
                      job={job}
                      onViewResults={() => handleViewResults(job)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Completed Jobs
                </h3>
                <div className="grid gap-4">
                  {completedJobs.slice(0, 5).map((job) => (
                    <JobStatus 
                      key={job.id} 
                      job={job}
                      onViewResults={() => handleViewResults(job)}
                    />
                  ))}
                </div>
                {completedJobs.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing 5 most recent completed jobs
                  </p>
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

          <TabsContent value="results" className="space-y-6">
            {results && currentJob ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Backtest Results - {currentJob.symbol}
                    </h2>
                    <p className="text-muted-foreground">
                      {currentJob.params?.strategy} strategy • {currentJob.params?.start_date} to {currentJob.params?.end_date}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearResults}
                  >
                    Clear Results
                  </Button>
                </div>

                <Tabs defaultValue="charts" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="trades">Trade History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="charts">
                    <ResultsCharts results={results} />
                  </TabsContent>

                  <TabsContent value="trades">
                    <TradeHistory results={results} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Results Selected</CardTitle>
                  <CardDescription>
                    Complete a backtest and view results from the Job Status tab.
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