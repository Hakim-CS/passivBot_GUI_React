import { useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBacktestStore, type BacktestJob } from '@/store/backtestStore';

interface JobStatusProps {
  job: BacktestJob;
  onViewResults?: () => void;
}

export function JobStatus({ job, onViewResults }: JobStatusProps) {
  const { fetchJobStatus } = useBacktestStore();

  useEffect(() => {
    if (job.status === 'running' || job.status === 'queued') {
      const interval = setInterval(() => {
        fetchJobStatus(job.id);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [job.id, job.status, fetchJobStatus]);

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'queued':
        return 'secondary';
      case 'running':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            {getStatusIcon()}
            Job {job.id}
          </CardTitle>
          <CardDescription>
            {job.symbol} • {job.strategy} • Started {formatDate(job.created_at)}
          </CardDescription>
        </div>
        <Badge variant={getStatusColor()}>
          {job.status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {(job.status === 'running' || job.status === 'queued') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Exchange:</span> {job.params?.exchange || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Symbol:</span> {job.params?.symbol || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Start:</span> {job.params?.start_date || 'N/A'}
              </div>
              <div>
                <span className="font-medium">End:</span> {job.params?.end_date || 'N/A'}
              </div>
            </div>
          </div>

          {job.status === 'completed' && job.results && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Return:</span>
                  <span className="font-mono text-success">
                    +{job.results.total_return}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Drawdown:</span>
                  <span className="font-mono text-destructive">
                    -{job.results.max_drawdown}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span className="font-mono">{job.results.total_trades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio:</span>
                  <span className="font-mono">{job.results.sharpe_ratio}</span>
                </div>
              </div>
              
              {onViewResults && (
                <Button 
                  onClick={onViewResults} 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  View Detailed Results
                </Button>
              )}
            </div>
          )}

          {job.status === 'failed' && (
            <div className="text-sm text-destructive">
              Backtest failed. Please check your parameters and try again.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}