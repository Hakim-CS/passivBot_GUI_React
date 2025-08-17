import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { type BacktestResults } from '@/store/backtestStore';

interface ResultsChartsProps {
  results: BacktestResults;
}

export function ResultsCharts({ results }: ResultsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Return</CardDescription>
            <CardTitle className="text-2xl text-success">
              +{formatPercentage(results.total_return)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Max Drawdown</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              -{formatPercentage(results.max_drawdown)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sharpe Ratio</CardDescription>
            <CardTitle className="text-2xl">
              {results.sharpe_ratio.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">
              {formatPercentage(results.win_rate)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-2xl">
              {results.total_trades}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="equity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="price">Price & Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="equity">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Equity Over Time</CardTitle>
              <CardDescription>
                Shows how your portfolio value changed throughout the backtest period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.equity_curve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown">
          <Card>
            <CardHeader>
              <CardTitle>Drawdown Analysis</CardTitle>
              <CardDescription>
                Percentage decline from previous peaks in portfolio value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={results.drawdown_curve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      tickFormatter={formatPercentage}
                    />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [formatPercentage(value), 'Drawdown']}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                    <Bar 
                      dataKey="drawdown" 
                      fill="hsl(var(--destructive))" 
                      opacity={0.6}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price">
          <Card>
            <CardHeader>
              <CardTitle>Price Action & Trade Execution</CardTitle>
              <CardDescription>
                Asset price movement with buy/sell trade markers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.price_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="hsl(var(--foreground))" 
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  Trade markers will be displayed once the backend provides detailed trade execution data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}