import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const instanceSchema = z.object({
  name: z.string().min(1, 'Instance name is required'),
  exchange: z.string().min(1, 'Exchange is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  strategy: z.string().min(1, 'Strategy is required'),
  leverage: z.number().min(1).max(100),
  position_size: z.number().min(0.01).max(1),
  grid_span: z.number().min(0.001).max(0.1),
  safety_orders: z.number().min(1).max(10),
  auto_restart: z.boolean(),
  enable_notifications: z.boolean(),
  max_position_size: z.number().min(0.01).max(10),
  take_profit: z.number().min(0.001).max(0.1),
  stop_loss: z.number().min(0.001).max(0.1).optional(),
});

type InstanceFormData = z.infer<typeof instanceSchema>;

interface TradingInstance {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  created_at: string;
  last_update: string;
  uptime: number;
  
  // Configuration
  config: {
    leverage: number;
    position_size: number;
    grid_span: number;
    safety_orders: number;
    auto_restart: boolean;
    enable_notifications: boolean;
    max_position_size: number;
    take_profit: number;
    stop_loss?: number;
  };
  
  // Performance metrics
  metrics: {
    total_pnl: number;
    daily_pnl: number;
    total_trades: number;
    win_rate: number;
    current_position: number;
    position_value: number;
    unrealized_pnl: number;
  };
  
  // Health status
  health: {
    cpu_usage: number;
    memory_usage: number;
    api_latency: number;
    last_error?: string;
    error_count: number;
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
  { value: 'ADAUSDT', label: 'ADA/USDT' },
  { value: 'DOGEUSDT', label: 'DOGE/USDT' },
  { value: 'AVAXUSDT', label: 'AVAX/USDT' }
];

// Mock data for demonstration
const mockInstances: TradingInstance[] = [
  {
    id: 'inst_001',
    name: 'BTC Grid Bot',
    exchange: 'binance',
    symbol: 'BTCUSDT',
    strategy: 'grid',
    status: 'running',
    created_at: '2024-01-15T10:30:00Z',
    last_update: new Date().toISOString(),
    uptime: 7200, // 2 hours
    config: {
      leverage: 10,
      position_size: 0.1,
      grid_span: 0.02,
      safety_orders: 4,
      auto_restart: true,
      enable_notifications: true,
      max_position_size: 1.0,
      take_profit: 0.015,
      stop_loss: 0.05,
    },
    metrics: {
      total_pnl: 1250.75,
      daily_pnl: 85.30,
      total_trades: 47,
      win_rate: 72.3,
      current_position: 0.025,
      position_value: 1680.50,
      unrealized_pnl: 45.20,
    },
    health: {
      cpu_usage: 15.3,
      memory_usage: 245.8,
      api_latency: 45,
      error_count: 2,
    }
  },
  {
    id: 'inst_002',
    name: 'ETH DCA',
    exchange: 'bybit',
    symbol: 'ETHUSDT',
    strategy: 'dca',
    status: 'paused',
    created_at: '2024-01-10T14:20:00Z',
    last_update: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    uptime: 432000, // 5 days
    config: {
      leverage: 5,
      position_size: 0.2,
      grid_span: 0.03,
      safety_orders: 3,
      auto_restart: false,
      enable_notifications: true,
      max_position_size: 0.8,
      take_profit: 0.02,
    },
    metrics: {
      total_pnl: -125.40,
      daily_pnl: -15.20,
      total_trades: 23,
      win_rate: 65.2,
      current_position: 0.15,
      position_value: 890.30,
      unrealized_pnl: -22.10,
    },
    health: {
      cpu_usage: 8.7,
      memory_usage: 189.2,
      api_latency: 72,
      error_count: 0,
    }
  },
  {
    id: 'inst_003',
    name: 'SOL Scalper',
    exchange: 'okx',
    symbol: 'SOLUSDT',
    strategy: 'scalp',
    status: 'error',
    created_at: '2024-01-18T09:15:00Z',
    last_update: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    uptime: 0,
    config: {
      leverage: 20,
      position_size: 0.05,
      grid_span: 0.01,
      safety_orders: 2,
      auto_restart: true,
      enable_notifications: true,
      max_position_size: 0.5,
      take_profit: 0.008,
      stop_loss: 0.02,
    },
    metrics: {
      total_pnl: 0,
      daily_pnl: 0,
      total_trades: 0,
      win_rate: 0,
      current_position: 0,
      position_value: 0,
      unrealized_pnl: 0,
    },
    health: {
      cpu_usage: 0,
      memory_usage: 0,
      api_latency: 0,
      last_error: 'API key authentication failed',
      error_count: 5,
    }
  }
];

export default function Instances() {
  const [instances, setInstances] = useState<TradingInstance[]>(mockInstances);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<TradingInstance | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<InstanceFormData>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      name: '',
      exchange: 'binance',
      symbol: 'BTCUSDT',
      strategy: 'grid',
      leverage: 10,
      position_size: 0.1,
      grid_span: 0.02,
      safety_orders: 3,
      auto_restart: true,
      enable_notifications: true,
      max_position_size: 1.0,
      take_profit: 0.015,
    },
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'paused': return 'secondary';
      case 'stopped': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCreateInstance = async (data: InstanceFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInstance: TradingInstance = {
        id: `inst_${Date.now()}`,
        name: data.name,
        exchange: data.exchange,
        symbol: data.symbol,
        strategy: data.strategy,
        status: 'stopped',
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        uptime: 0,
        config: {
          leverage: data.leverage,
          position_size: data.position_size,
          grid_span: data.grid_span,
          safety_orders: data.safety_orders,
          auto_restart: data.auto_restart,
          enable_notifications: data.enable_notifications,
          max_position_size: data.max_position_size,
          take_profit: data.take_profit,
          stop_loss: data.stop_loss,
        },
        metrics: {
          total_pnl: 0,
          daily_pnl: 0,
          total_trades: 0,
          win_rate: 0,
          current_position: 0,
          position_value: 0,
          unrealized_pnl: 0,
        },
        health: {
          cpu_usage: 0,
          memory_usage: 0,
          api_latency: 0,
          error_count: 0,
        }
      };
      
      setInstances(prev => [newInstance, ...prev]);
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Instance Created",
        description: `Trading instance "${data.name}" has been created successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create instance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstanceAction = async (instanceId: string, action: 'start' | 'pause' | 'stop' | 'restart') => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInstances(prev => prev.map(instance => {
        if (instance.id === instanceId) {
          let newStatus: TradingInstance['status'];
          switch (action) {
            case 'start':
            case 'restart':
              newStatus = 'running';
              break;
            case 'pause':
              newStatus = 'paused';
              break;
            case 'stop':
              newStatus = 'stopped';
              break;
            default:
              newStatus = instance.status;
          }
          
          return {
            ...instance,
            status: newStatus,
            last_update: new Date().toISOString(),
            uptime: action === 'start' || action === 'restart' ? 0 : instance.uptime,
          };
        }
        return instance;
      }));
      
      toast({
        title: "Action Completed",
        description: `Instance ${action} completed successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} instance. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInstances(prev => prev.filter(instance => instance.id !== instanceId));
      
      toast({
        title: "Instance Deleted",
        description: "Trading instance has been deleted successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete instance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPnl = instances.reduce((sum, instance) => sum + instance.metrics.total_pnl, 0);
  const runningInstances = instances.filter(instance => instance.status === 'running').length;
  const totalTrades = instances.reduce((sum, instance) => sum + instance.metrics.total_trades, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instance Manager</h1>
            <p className="text-muted-foreground">
              Manage your Passivbot trading instances
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Instance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Trading Instance</DialogTitle>
                <DialogDescription>
                  Configure a new Passivbot trading instance with your desired parameters.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateInstance)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instance Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Trading Bot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leverage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leverage</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="position_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Size</FormLabel>
                          <FormControl>
                            <Input
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="grid_span"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grid Span</FormLabel>
                          <FormControl>
                            <Input
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
                      name="safety_orders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Orders</FormLabel>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="take_profit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Take Profit</FormLabel>
                          <FormControl>
                            <Input
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
                      name="stop_loss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stop Loss (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="auto_restart"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Restart</FormLabel>
                            <FormDescription>
                              Automatically restart the instance if it stops unexpectedly
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enable_notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications for trades and status changes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Instance
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalPnl)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all instances
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Instances</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{runningInstances}</div>
              <p className="text-xs text-muted-foreground">
                Out of {instances.length} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <p className="text-xs text-muted-foreground">
                All instances combined
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {instances.length > 0 
                  ? (instances.reduce((sum, instance) => sum + instance.metrics.win_rate, 0) / instances.length).toFixed(1)
                  : '0.0'
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across instances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instances Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trading Instances</span>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {instances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instance.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {instance.exchange.toUpperCase()} • {instance.symbol}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(instance.status)}`} />
                          <Badge variant={getStatusVariant(instance.status)}>
                            {instance.status}
                          </Badge>
                        </div>
                        {instance.health.last_error && (
                          <div className="text-xs text-red-600 mt-1">
                            {instance.health.last_error}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{instance.strategy}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className={`font-medium ${instance.metrics.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(instance.metrics.total_pnl)}
                          </div>
                          <div className={`text-xs ${instance.metrics.daily_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {instance.metrics.daily_pnl >= 0 ? '+' : ''}{formatCurrency(instance.metrics.daily_pnl)} today
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instance.metrics.current_position.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(instance.metrics.position_value)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instance.metrics.total_trades}</div>
                          <div className="text-xs text-muted-foreground">
                            {instance.metrics.win_rate.toFixed(1)}% win rate
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {instance.status === 'running' ? formatUptime(instance.uptime) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {instance.status === 'running' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInstanceAction(instance.id, 'pause')}
                              disabled={isLoading}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInstanceAction(instance.id, 'start')}
                              disabled={isLoading}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInstanceAction(instance.id, 'stop')}
                            disabled={isLoading}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInstance(instance);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Instance</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{instance.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInstance(instance.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">No Instances</h3>
                    <p className="text-muted-foreground">Create your first trading instance to get started.</p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Instance
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}