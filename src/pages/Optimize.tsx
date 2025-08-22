import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Play, TrendingUp, Settings, Target, BarChart3, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const optimizationSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  strategy: z.string().min(1, 'Strategy is required'),
  objective: z.string().min(1, 'Optimization objective is required'),
  max_iterations: z.number().min(10).max(1000),
  
  // Parameter ranges
  leverage_min: z.number().min(1).max(100),
  leverage_max: z.number().min(1).max(100),
  position_size_min: z.number().min(0.01).max(1),
  position_size_max: z.number().min(0.01).max(1),
  grid_span_min: z.number().min(0.001).max(0.1),
  grid_span_max: z.number().min(0.001).max(0.1),
  safety_orders_min: z.number().min(1).max(10),
  safety_orders_max: z.number().min(1).max(10),
});

type OptimizationFormData = z.infer<typeof optimizationSchema>;

interface OptimizationJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  current_iteration: number;
  total_iterations: number;
  best_result?: OptimizationResult;
}

interface OptimizationResult {
  parameters: {
    leverage: number;
    position_size: number;
    grid_span: number;
    safety_orders: number;
  };
  metrics: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    total_trades: number;
    objective_value: number;
  };
}

const exchanges = [
  { value: 'binance', label: 'Binance' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'okx', label: 'OKX' },
  { value: 'kucoin', label: 'KuCoin' }
];

const strategies = [
  { value: 'grid', label: 'Grid Trading' },
  { value: 'dca', label: 'Dollar Cost Average' },
  { value: 'scalp', label: 'Scalping' },
  { value: 'swing', label: 'Swing Trading' }
];

const symbols = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'ADAUSDT', label: 'ADA/USDT' }
];

const objectives = [
  { value: 'total_return', label: 'Total Return' },
  { value: 'sharpe_ratio', label: 'Sharpe Ratio' },
  { value: 'profit_factor', label: 'Profit Factor' },
  { value: 'risk_adjusted_return', label: 'Risk-Adjusted Return' }
];

export default function Optimize() {
  const [activeTab, setActiveTab] = useState('setup');
  const [currentJob, setCurrentJob] = useState<OptimizationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);

  const form = useForm<OptimizationFormData>({
    resolver: zodResolver(optimizationSchema),
    defaultValues: {
      exchange: 'binance',
      symbol: 'BTCUSDT',
      strategy: 'grid',
      objective: 'sharpe_ratio',
      max_iterations: 100,
      leverage_min: 5,
      leverage_max: 20,
      position_size_min: 0.05,
      position_size_max: 0.3,
      grid_span_min: 0.01,
      grid_span_max: 0.05,
      safety_orders_min: 2,
      safety_orders_max: 6,
      start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      end_date: new Date(),
    },
  });

  const handleStartOptimization = async (data: OptimizationFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate starting optimization
      const jobId = `opt_${Date.now()}`;
      const newJob: OptimizationJob = {
        id: jobId,
        status: 'running',
        progress: 0,
        created_at: new Date().toISOString(),
        current_iteration: 0,
        total_iterations: data.max_iterations,
      };
      
      setCurrentJob(newJob);
      setActiveTab('progress');
      
      // Simulate optimization progress
      simulateOptimization(newJob);
      
      toast({
        title: "Optimization Started",
        description: `Job ${jobId} has been queued for processing.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start optimization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOptimization = (job: OptimizationJob) => {
    const interval = setInterval(() => {
      setCurrentJob(prevJob => {
        if (!prevJob) return null;
        
        const newIteration = prevJob.current_iteration + 1;
        const progress = (newIteration / prevJob.total_iterations) * 100;
        
        if (newIteration >= prevJob.total_iterations) {
          clearInterval(interval);
          
          // Generate final result
          const finalResult: OptimizationResult = {
            parameters: {
              leverage: 12.5,
              position_size: 0.15,
              grid_span: 0.025,
              safety_orders: 4,
            },
            metrics: {
              total_return: 28.5,
              sharpe_ratio: 1.85,
              max_drawdown: -8.2,
              win_rate: 72.3,
              total_trades: 145,
              objective_value: 1.85,
            }
          };
          
          setOptimizationHistory(prev => [finalResult, ...prev]);
          
          return {
            ...prevJob,
            status: 'completed',
            progress: 100,
            current_iteration: newIteration,
            completed_at: new Date().toISOString(),
            best_result: finalResult,
          };
        }
        
        return {
          ...prevJob,
          progress,
          current_iteration: newIteration,
        };
      });
    }, 100); // Update every 100ms for demo
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Optimization</h1>
          <p className="text-muted-foreground">
            Find optimal parameters for your trading strategies using advanced optimization algorithms
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleStartOptimization)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Basic Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Configuration</CardTitle>
                      <CardDescription>
                        Set up your optimization parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="exchange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exchange</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select exchange" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {exchanges.map(exchange => (
                                  <SelectItem key={exchange.value} value={exchange.value}>
                                    {exchange.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trading Pair</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select symbol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {symbols.map(symbol => (
                                  <SelectItem key={symbol.value} value={symbol.value}>
                                    {symbol.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="strategy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strategy</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select strategy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {strategies.map(strategy => (
                                  <SelectItem key={strategy.value} value={strategy.value}>
                                    {strategy.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="objective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Optimization Objective</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select objective" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {objectives.map(objective => (
                                  <SelectItem key={objective.value} value={objective.value}>
                                    {objective.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_iterations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Iterations</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Date Range */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Date Range</CardTitle>
                      <CardDescription>
                        Select the period for optimization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Parameter Ranges */}
                <Card>
                  <CardHeader>
                    <CardTitle>Parameter Ranges</CardTitle>
                    <CardDescription>
                      Define the ranges for each parameter to optimize
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Leverage Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Leverage</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="leverage_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Min"
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="leverage_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Max"
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Position Size Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Position Size</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="position_size_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Min"
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="position_size_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Max"
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Grid Span Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Grid Span</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="grid_span_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Min"
                                    type="number"
                                    step="0.001"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="grid_span_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Max"
                                    type="number"
                                    step="0.001"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Safety Orders Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Safety Orders</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="safety_orders_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Min"
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="safety_orders_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Max"
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start Optimization
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {currentJob ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Optimization Progress</span>
                      <Badge variant={currentJob.status === 'running' ? 'default' : 
                                   currentJob.status === 'completed' ? 'secondary' : 'destructive'}>
                        {currentJob.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Job ID: {currentJob.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(currentJob.progress)}%</span>
                      </div>
                      <Progress value={currentJob.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Iteration:</span>
                        <span className="ml-2 font-mono">{currentJob.current_iteration}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Iterations:</span>
                        <span className="ml-2 font-mono">{currentJob.total_iterations}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <span className="ml-2">{format(new Date(currentJob.created_at), 'PPp')}</span>
                      </div>
                      {currentJob.completed_at && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="ml-2">{format(new Date(currentJob.completed_at), 'PPp')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {currentJob.best_result && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Best Result So Far</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <h4 className="font-medium">Optimal Parameters</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Leverage:</span>
                              <span className="font-mono">{currentJob.best_result.parameters.leverage}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Position Size:</span>
                              <span className="font-mono">{(currentJob.best_result.parameters.position_size * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Grid Span:</span>
                              <span className="font-mono">{(currentJob.best_result.parameters.grid_span * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Safety Orders:</span>
                              <span className="font-mono">{currentJob.best_result.parameters.safety_orders}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Performance Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Return:</span>
                              <span className="font-mono text-green-600">+{currentJob.best_result.metrics.total_return.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sharpe Ratio:</span>
                              <span className="font-mono">{currentJob.best_result.metrics.sharpe_ratio.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Drawdown:</span>
                              <span className="font-mono text-red-600">{currentJob.best_result.metrics.max_drawdown.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Win Rate:</span>
                              <span className="font-mono">{currentJob.best_result.metrics.win_rate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No optimization job running. Start a new optimization from the Setup tab.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {currentJob?.best_result ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Optimization Results</h3>
                    <p className="text-muted-foreground">Best configuration found</p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Results
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Optimal Parameters */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Optimal Parameters</CardTitle>
                      <CardDescription>
                        The best parameter combination found
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Leverage</Label>
                          <div className="text-2xl font-bold">{currentJob.best_result.parameters.leverage}x</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Position Size</Label>
                          <div className="text-2xl font-bold">{(currentJob.best_result.parameters.position_size * 100).toFixed(1)}%</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Grid Span</Label>
                          <div className="text-2xl font-bold">{(currentJob.best_result.parameters.grid_span * 100).toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Safety Orders</Label>
                          <div className="text-2xl font-bold">{currentJob.best_result.parameters.safety_orders}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Total Return</Label>
                          <div className="text-2xl font-bold text-green-600">+{currentJob.best_result.metrics.total_return.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Sharpe Ratio</Label>
                          <div className="text-2xl font-bold">{currentJob.best_result.metrics.sharpe_ratio.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Max Drawdown</Label>
                          <div className="text-2xl font-bold text-red-600">{currentJob.best_result.metrics.max_drawdown.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Win Rate</Label>
                          <div className="text-2xl font-bold">{currentJob.best_result.metrics.win_rate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Run Backtest with Optimal Parameters
                  </Button>
                  <Button variant="outline">
                    Save Configuration
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No results available. Complete an optimization to see results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Optimization History</h3>
                <p className="text-muted-foreground">Previous optimization results</p>
              </div>
            </div>

            {optimizationHistory.length > 0 ? (
              <div className="space-y-4">
                {optimizationHistory.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Configuration</Label>
                          <div className="text-sm font-mono">
                            L:{result.parameters.leverage}x, PS:{(result.parameters.position_size * 100).toFixed(1)}%, 
                            GS:{(result.parameters.grid_span * 100).toFixed(2)}%, SO:{result.parameters.safety_orders}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Total Return</Label>
                          <div className="text-sm font-bold text-green-600">+{result.metrics.total_return.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Sharpe Ratio</Label>
                          <div className="text-sm font-bold">{result.metrics.sharpe_ratio.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Max Drawdown</Label>
                          <div className="text-sm font-bold text-red-600">{result.metrics.max_drawdown.toFixed(2)}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No optimization history available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
