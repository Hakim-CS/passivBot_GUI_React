import { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Target, 
  PieChart,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Mock data for analytics
const portfolioMetrics = {
  totalEquity: 25847.32,
  totalPnL: 3247.85,
  totalPnLPercent: 14.38,
  dailyPnL: 127.45,
  dailyPnLPercent: 0.49,
  sharpeRatio: 1.85,
  maxDrawdown: -8.2,
  winRate: 68.5,
  totalTrades: 342,
  avgTradeSize: 156.78,
  profitFactor: 1.42,
  sortinoRatio: 2.31,
  calmarRatio: 1.75,
  volatility: 12.4
};

const performanceData = [
  { date: '2024-01-01', value: 22599.47, pnl: 0 },
  { date: '2024-01-08', value: 23156.82, pnl: 557.35 },
  { date: '2024-01-15', value: 22987.14, pnl: 387.67 },
  { date: '2024-01-22', value: 24123.69, pnl: 1524.22 },
  { date: '2024-01-29', value: 23897.41, pnl: 1297.94 },
  { date: '2024-02-05', value: 24567.88, pnl: 1968.41 },
  { date: '2024-02-12', value: 25234.15, pnl: 2634.68 },
  { date: '2024-02-19', value: 24891.33, pnl: 2291.86 },
  { date: '2024-02-26', value: 25847.32, pnl: 3247.85 }
];

const drawdownData = [
  { date: '2024-01-01', drawdown: 0 },
  { date: '2024-01-08', drawdown: -2.1 },
  { date: '2024-01-15', drawdown: -5.8 },
  { date: '2024-01-22', drawdown: -1.2 },
  { date: '2024-01-29', drawdown: -3.4 },
  { date: '2024-02-05', drawdown: -0.8 },
  { date: '2024-02-12', drawdown: 0 },
  { date: '2024-02-19', drawdown: -4.1 },
  { date: '2024-02-26', drawdown: -1.5 }
];

const instancePerformance = [
  {
    id: '1',
    name: 'BTC Grid Bot',
    symbol: 'BTCUSDT',
    strategy: 'grid',
    pnl: 1847.23,
    pnlPercent: 18.47,
    trades: 89,
    winRate: 74.2,
    sharpe: 2.1,
    maxDD: -5.2,
    status: 'running' as const
  },
  {
    id: '2',
    name: 'ETH DCA Bot',
    symbol: 'ETHUSDT',
    strategy: 'dca',
    pnl: 923.87,
    pnlPercent: 15.31,
    trades: 67,
    winRate: 65.7,
    sharpe: 1.8,
    maxDD: -7.1,
    status: 'running' as const
  },
  {
    id: '3',
    name: 'SOL Scalper',
    symbol: 'SOLUSDT',
    strategy: 'scalp',
    pnl: 476.75,
    pnlPercent: 9.54,
    trades: 186,
    winRate: 61.3,
    sharpe: 1.4,
    maxDD: -8.2,
    status: 'paused' as const
  },
  {
    id: '4',
    name: 'ADA Swing',
    symbol: 'ADAUSDT',
    strategy: 'swing',
    pnl: -89.12,
    pnlPercent: -2.97,
    trades: 23,
    winRate: 43.5,
    sharpe: -0.3,
    maxDD: -12.4,
    status: 'stopped' as const
  }
];

const strategyAllocation = [
  { strategy: 'Grid Trading', allocation: 45.2, pnl: 2156.78, color: 'bg-blue-500' },
  { strategy: 'DCA', allocation: 28.7, pnl: 923.87, color: 'bg-green-500' },
  { strategy: 'Scalping', allocation: 18.5, pnl: 476.75, color: 'bg-purple-500' },
  { strategy: 'Swing Trading', allocation: 7.6, pnl: -89.12, color: 'bg-red-500' }
];

const riskMetrics = [
  { metric: 'Value at Risk (95%)', value: '-$1,247.83', status: 'normal' },
  { metric: 'Expected Shortfall', value: '-$1,892.44', status: 'normal' },
  { metric: 'Beta vs BTC', value: '1.23', status: 'elevated' },
  { metric: 'Correlation to Market', value: '0.78', status: 'normal' },
  { metric: 'Portfolio Volatility', value: '12.4%', status: 'normal' },
  { metric: 'Information Ratio', value: '1.67', status: 'good' }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedMetric, setSelectedMetric] = useState('pnl');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskStatus = (status: string) => {
    switch (status) {
      case 'good': return { color: 'text-green-600', icon: CheckCircle };
      case 'elevated': return { color: 'text-yellow-600', icon: AlertTriangle };
      case 'high': return { color: 'text-red-600', icon: AlertTriangle };
      default: return { color: 'text-blue-600', icon: Activity };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive portfolio and strategy performance analysis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalEquity)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                {formatPercent(portfolioMetrics.totalPnLPercent)} total return
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(portfolioMetrics.totalPnL)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                Today: <span className="text-green-600 ml-1">{formatCurrency(portfolioMetrics.dailyPnL)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioMetrics.sharpeRatio}</div>
              <div className="text-xs text-muted-foreground">
                Risk-adjusted return
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {portfolioMetrics.maxDrawdown}%
              </div>
              <div className="text-xs text-muted-foreground">
                Peak-to-trough decline
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="instances" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Instances
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Equity Curve */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Equity Curve</CardTitle>
                  <CardDescription>Total portfolio value over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Interactive chart would render here</p>
                      <p className="text-sm mt-2">
                        Current: {formatCurrency(portfolioMetrics.totalEquity)}
                        <br />
                        Total Return: {formatPercent(portfolioMetrics.totalPnLPercent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Drawdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Drawdown Analysis</CardTitle>
                  <CardDescription>Portfolio drawdown periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-600" />
                      <p>Drawdown chart would render here</p>
                      <p className="text-sm mt-2">
                        Max Drawdown: {portfolioMetrics.maxDrawdown}%
                        <br />
                        Current Drawdown: -1.5%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">RETURNS</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Return</span>
                        <span className="text-sm font-mono text-green-600">
                          {formatPercent(portfolioMetrics.totalPnLPercent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Daily Return</span>
                        <span className="text-sm font-mono text-green-600">
                          {formatPercent(portfolioMetrics.dailyPnLPercent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annualized Return</span>
                        <span className="text-sm font-mono">+24.7%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">RISK METRICS</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Sharpe Ratio</span>
                        <span className="text-sm font-mono">{portfolioMetrics.sharpeRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sortino Ratio</span>
                        <span className="text-sm font-mono">{portfolioMetrics.sortinoRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Calmar Ratio</span>
                        <span className="text-sm font-mono">{portfolioMetrics.calmarRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Volatility</span>
                        <span className="text-sm font-mono">{portfolioMetrics.volatility}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">TRADING</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Trades</span>
                        <span className="text-sm font-mono">{portfolioMetrics.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Win Rate</span>
                        <span className="text-sm font-mono">{portfolioMetrics.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Profit Factor</span>
                        <span className="text-sm font-mono">{portfolioMetrics.profitFactor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Trade Size</span>
                        <span className="text-sm font-mono">{formatCurrency(portfolioMetrics.avgTradeSize)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instance Performance Breakdown</CardTitle>
                <CardDescription>Individual trading instance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instancePerformance.map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{instance.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {instance.symbol} • {instance.strategy}
                          </div>
                        </div>
                        <Badge variant={instance.status === 'running' ? 'default' : 
                                      instance.status === 'paused' ? 'secondary' : 'outline'}>
                          {instance.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-8 text-right text-sm">
                        <div>
                          <div className="font-medium">P&L</div>
                          <div className={instance.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(instance.pnl)}
                          </div>
                          <div className={`text-xs ${instance.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(instance.pnlPercent)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium">Trades</div>
                          <div>{instance.trades}</div>
                          <div className="text-xs text-muted-foreground">
                            {instance.winRate}% win
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium">Sharpe</div>
                          <div>{instance.sharpe}</div>
                        </div>
                        
                        <div>
                          <div className="font-medium">Max DD</div>
                          <div className="text-red-600">{instance.maxDD}%</div>
                        </div>
                        
                        <div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Allocation</CardTitle>
                  <CardDescription>Capital distribution by strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategyAllocation.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.strategy}</span>
                          <span className="text-sm text-muted-foreground">{item.allocation}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.allocation}%` }}
                            />
                          </div>
                          <span className={`text-sm font-mono ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(item.pnl)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exchange Distribution</CardTitle>
                  <CardDescription>Capital allocation across exchanges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Binance</span>
                        <span className="text-sm text-muted-foreground">52.3%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-yellow-500" style={{ width: '52.3%' }} />
                        </div>
                        <span className="text-sm font-mono text-green-600">+{formatCurrency(1698.42)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Bybit</span>
                        <span className="text-sm text-muted-foreground">31.7%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-orange-500" style={{ width: '31.7%' }} />
                        </div>
                        <span className="text-sm font-mono text-green-600">+{formatCurrency(1023.87)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">OKX</span>
                        <span className="text-sm text-muted-foreground">16.0%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: '16.0%' }} />
                        </div>
                        <span className="text-sm font-mono text-green-600">+{formatCurrency(525.56)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                  <CardDescription>Portfolio risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskMetrics.map((metric, index) => {
                      const { color, icon: Icon } = getRiskStatus(metric.status);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-sm font-medium">{metric.metric}</span>
                          </div>
                          <span className={`text-sm font-mono ${color}`}>
                            {metric.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Exposure</CardTitle>
                  <CardDescription>Current risk levels by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Market Risk</span>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Exposure to market volatility
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Concentration Risk</span>
                        <span className="text-sm text-muted-foreground">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Risk from concentrated positions
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Liquidity Risk</span>
                        <span className="text-sm text-muted-foreground">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Risk from illiquid positions
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Leverage Risk</span>
                        <span className="text-sm text-muted-foreground">73%</span>
                      </div>
                      <Progress value={73} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Risk from leveraged positions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}