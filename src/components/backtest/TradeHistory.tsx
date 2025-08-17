import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type BacktestResults } from '@/store/backtestStore';

interface TradeHistoryProps {
  results: BacktestResults;
}

export function TradeHistory({ results }: TradeHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTradeIcon = (type: 'buy' | 'sell') => {
    return type === 'buy' ? (
      <ArrowUpIcon className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-destructive" />
    );
  };

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? 'text-success' : 'text-destructive';
  };

  const getPnlIcon = (pnl: number) => {
    return pnl >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  // Sort trades by timestamp (newest first)
  const sortedTrades = [...results.trades].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalPnL = results.trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = results.trades.filter(trade => trade.pnl > 0).length;
  const losingTrades = results.trades.filter(trade => trade.pnl < 0).length;

  return (
    <div className="space-y-6">
      {/* Trade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total P&L</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColor(totalPnL)}`}>
              {formatCurrency(totalPnL)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Winning Trades</CardDescription>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {winningTrades}
            </div>
            <p className="text-xs text-muted-foreground">
              {((winningTrades / results.trades.length) * 100).toFixed(1)}% win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Losing Trades</CardDescription>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {losingTrades}
            </div>
            <p className="text-xs text-muted-foreground">
              {((losingTrades / results.trades.length) * 100).toFixed(1)}% loss rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Avg Trade</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColor(totalPnL / results.trades.length)}`}>
              {formatCurrency(totalPnL / results.trades.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>
            Detailed breakdown of all trades executed during the backtest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade, index) => (
                  <TableRow key={trade.id || index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTradeIcon(trade.type)}
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(trade.timestamp)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(trade.price)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {trade.quantity.toFixed(6)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getPnlColor(trade.pnl)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getPnlIcon(trade.pnl)}
                        {formatCurrency(trade.pnl)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {results.trades.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No trades executed during this backtest period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}