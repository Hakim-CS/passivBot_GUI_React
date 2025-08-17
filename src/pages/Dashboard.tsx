import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  AlertTriangle,
  Play,
  Square
} from "lucide-react";

export default function Dashboard() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalPnL: 1247.83,
    totalPnLChange: 12.5,
    activeInstances: 3,
    totalInstances: 7,
    todayTrades: 24,
    successRate: 67.8
  };

  const recentInstances = [
    {
      id: "1",
      name: "BTC-USDT-Long",
      status: "running" as const,
      pnl: 234.56,
      symbol: "BTCUSDT",
      strategy: "grid"
    },
    {
      id: "2", 
      name: "ETH-USDT-Short",
      status: "running" as const,
      pnl: -45.23,
      symbol: "ETHUSDT",
      strategy: "dca"
    },
    {
      id: "3",
      name: "SOL-USDT-Grid",
      status: "stopped" as const,
      pnl: 89.12,
      symbol: "SOLUSDT", 
      strategy: "grid"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your Passivbot instances and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:opacity-90">
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-profit" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">
              ${stats.totalPnL.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-profit" />
              +{stats.totalPnLChange}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Instances</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeInstances}/{stats.totalInstances}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInstances - stats.activeInstances} stopped
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Trades</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTrades}</div>
            <p className="text-xs text-muted-foreground">
              Across all instances
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Profitable trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Instances */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Instances
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInstances.map((instance) => (
              <div 
                key={instance.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {instance.status === "running" ? (
                      <div className="w-2 h-2 bg-running rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-stopped rounded-full" />
                    )}
                    <span className="font-medium">{instance.name}</span>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    {instance.symbol}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    {instance.strategy}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`text-sm font-medium ${
                    instance.pnl >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {instance.pnl >= 0 ? '+' : ''}${instance.pnl}
                  </div>
                  
                  <div className="flex gap-1">
                    {instance.status === "running" ? (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Square className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-primary text-white border-primary/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Backtest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 text-sm mb-4">
              Run a quick backtest on your favorite strategy
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Start Backtest
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-success text-white border-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Optimize Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 text-sm mb-4">
              Find optimal parameters for maximum profit
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Start Optimization
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle>Remote Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Sync configurations with remote VPS
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Sync Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}