import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  BarChart3, 
  DollarSign, 
  Volume, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  SortAsc,
  SortDesc,
  Zap
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  supply: number;
  volatility: number;
  rsi: number;
  ema20: number;
  ema50: number;
  support: number;
  resistance: number;
  liquidationData: {
    long: number;
    short: number;
  };
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  enabled: boolean;
  exchanges: string[];
  pairs: string[];
  lastAnalyzed: string;
}

interface FilterOptions {
  exchange: string;
  minVolume: number;
  maxVolatility: number;
  suitability: string;
  priceRange: { min: number; max: number };
  onlyEnabled: boolean;
}

const mockCoins: CoinData[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.00,
    change24h: 2.45,
    volume24h: 28500000000,
    marketCap: 847000000000,
    supply: 19580000,
    volatility: 3.2,
    rsi: 58.4,
    ema20: 42800,
    ema50: 41200,
    support: 41000,
    resistance: 45000,
    liquidationData: { long: 120000000, short: 85000000 },
    suitability: 'excellent',
    enabled: true,
    exchanges: ['binance', 'bybit', 'okx'],
    pairs: ['USDT', 'BUSD', 'USD'],
    lastAnalyzed: "2024-01-15 14:30:00"
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 2580.50,
    change24h: -1.23,
    volume24h: 15200000000,
    marketCap: 310000000000,
    supply: 120280000,
    volatility: 4.1,
    rsi: 45.2,
    ema20: 2620,
    ema50: 2480,
    support: 2400,
    resistance: 2700,
    liquidationData: { long: 95000000, short: 68000000 },
    suitability: 'excellent',
    enabled: true,
    exchanges: ['binance', 'bybit', 'okx'],
    pairs: ['USDT', 'BTC', 'USD'],
    lastAnalyzed: "2024-01-15 14:25:00"
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 98.75,
    change24h: 5.67,
    volume24h: 2800000000,
    marketCap: 42000000000,
    supply: 425000000,
    volatility: 7.8,
    rsi: 72.1,
    ema20: 95.20,
    ema50: 88.40,
    support: 85.00,
    resistance: 105.00,
    liquidationData: { long: 45000000, short: 32000000 },
    suitability: 'good',
    enabled: true,
    exchanges: ['binance', 'bybit'],
    pairs: ['USDT', 'USD'],
    lastAnalyzed: "2024-01-15 14:20:00"
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.485,
    change24h: -3.21,
    volume24h: 420000000,
    marketCap: 17200000000,
    supply: 35500000000,
    volatility: 6.2,
    rsi: 38.5,
    ema20: 0.492,
    ema50: 0.468,
    support: 0.450,
    resistance: 0.520,
    liquidationData: { long: 28000000, short: 35000000 },
    suitability: 'fair',
    enabled: false,
    exchanges: ['binance', 'okx'],
    pairs: ['USDT', 'BTC'],
    lastAnalyzed: "2024-01-15 14:15:00"
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.0825,
    change24h: 8.94,
    volume24h: 950000000,
    marketCap: 11800000000,
    supply: 143000000000,
    volatility: 12.5,
    rsi: 78.2,
    ema20: 0.0798,
    ema50: 0.0745,
    support: 0.0750,
    resistance: 0.0900,
    liquidationData: { long: 65000000, short: 42000000 },
    suitability: 'poor',
    enabled: false,
    exchanges: ['binance', 'bybit'],
    pairs: ['USDT', 'USD'],
    lastAnalyzed: "2024-01-15 14:10:00"
  }
];

const suitabilityColors = {
  excellent: "bg-green-500",
  good: "bg-blue-500", 
  fair: "bg-yellow-500",
  poor: "bg-red-500"
};

const suitabilityIcons = {
  excellent: CheckCircle,
  good: TrendingUp,
  fair: AlertTriangle,
  poor: XCircle
};

export default function Coins() {
  const [coins, setCoins] = useState<CoinData[]>(mockCoins);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof CoinData>("marketCap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterOptions>({
    exchange: "all",
    minVolume: 0,
    maxVolatility: 100,
    suitability: "all",
    priceRange: { min: 0, max: 100000 },
    onlyEnabled: false
  });
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredCoins = useMemo(() => {
    let filtered = coins.filter(coin => {
      const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesExchange = filters.exchange === "all" || coin.exchanges.includes(filters.exchange);
      const matchesVolume = coin.volume24h >= filters.minVolume * 1000000;
      const matchesVolatility = coin.volatility <= filters.maxVolatility;
      const matchesSuitability = filters.suitability === "all" || coin.suitability === filters.suitability;
      const matchesPrice = coin.price >= filters.priceRange.min && coin.price <= filters.priceRange.max;
      const matchesEnabled = !filters.onlyEnabled || coin.enabled;

      return matchesSearch && matchesExchange && matchesVolume && 
             matchesVolatility && matchesSuitability && matchesPrice && matchesEnabled;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      return sortDirection === "asc" 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return filtered;
  }, [coins, searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field: keyof CoinData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleCoin = (coinId: string) => {
    setCoins(coins.map(coin => 
      coin.id === coinId ? { ...coin, enabled: !coin.enabled } : coin
    ));
  };

  const toggleSelection = (coinId: string) => {
    setSelectedCoins(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const analyzeCoins = () => {
    const count = selectedCoins.length || filteredCoins.length;
    toast({
      title: "Analysis Started",
      description: `Analyzing ${count} coins for trading opportunities...`
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return "text-red-500";
    if (rsi <= 30) return "text-green-500";
    return "text-yellow-500";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coin Analysis</h1>
            <p className="text-muted-foreground">
              Browse and analyze cryptocurrencies for trading opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={analyzeCoins}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Selected
            </Button>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Auto-Select Best
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
            <TabsTrigger value="liquidation">Liquidation Data</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filters.exchange} onValueChange={(value) => setFilters({ ...filters, exchange: value })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exchanges</SelectItem>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="bybit">Bybit</SelectItem>
                    <SelectItem value="okx">OKX</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.suitability} onValueChange={(value) => setFilters({ ...filters, suitability: value })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Cryptocurrency Overview
                  <div className="flex items-center gap-2">
                    <Label htmlFor="enabled-only">Enabled Only</Label>
                    <Switch 
                      id="enabled-only"
                      checked={filters.onlyEnabled}
                      onCheckedChange={(checked) => setFilters({ ...filters, onlyEnabled: checked })}
                    />
                  </div>
                </CardTitle>
                <CardDescription>
                  {filteredCoins.length} coins found • {selectedCoins.length} selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Coin
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Price
                          {sortField === 'price' && (
                            sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('change24h')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          24h Change
                          {sortField === 'change24h' && (
                            sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('volume24h')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Volume
                          {sortField === 'volume24h' && (
                            sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('volatility')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Volatility
                          {sortField === 'volatility' && (
                            sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Suitability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoins.map((coin) => {
                      const SuitabilityIcon = suitabilityIcons[coin.suitability];
                      return (
                        <TableRow key={coin.id} className={selectedCoins.includes(coin.id) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedCoins.includes(coin.id)}
                              onChange={() => toggleSelection(coin.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {coin.symbol.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">{coin.symbol}</div>
                                <div className="text-xs text-muted-foreground">{coin.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">${coin.price.toLocaleString()}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(coin.change24h).toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">${formatNumber(coin.volume24h)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <div className="text-sm">{coin.volatility.toFixed(1)}%</div>
                              <div className={`w-2 h-2 rounded-full ${coin.volatility > 10 ? 'bg-red-500' : coin.volatility > 5 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <SuitabilityIcon className={`h-4 w-4 ${coin.suitability === 'excellent' ? 'text-green-500' : coin.suitability === 'good' ? 'text-blue-500' : coin.suitability === 'fair' ? 'text-yellow-500' : 'text-red-500'}`} />
                              <Badge variant="outline" className={`${suitabilityColors[coin.suitability]} text-white border-0`}>
                                {coin.suitability}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={coin.enabled}
                              onCheckedChange={() => toggleCoin(coin.id)}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4">
              {filteredCoins.map((coin) => (
                <Card key={coin.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {coin.symbol.substring(0, 1)}
                        </div>
                        {coin.symbol} Technical Analysis
                      </div>
                      <Badge variant="outline">${coin.price.toLocaleString()}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">RSI (14)</Label>
                        <div className={`text-lg font-bold ${getRSIColor(coin.rsi)}`}>
                          {coin.rsi.toFixed(1)}
                        </div>
                        <Progress value={coin.rsi} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">EMA 20</Label>
                        <div className="text-sm font-medium">${coin.ema20.toLocaleString()}</div>
                        <div className={`text-xs ${coin.price > coin.ema20 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.price > coin.ema20 ? 'Above' : 'Below'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Support</Label>
                        <div className="text-sm font-medium">${coin.support.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((coin.price - coin.support) / coin.support * 100).toFixed(1)}% away
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Resistance</Label>
                        <div className="text-sm font-medium">${coin.resistance.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((coin.resistance - coin.price) / coin.price * 100).toFixed(1)}% away
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="liquidation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liquidation Heatmap</CardTitle>
                <CardDescription>
                  Monitor liquidation levels for trading opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCoins.map((coin) => {
                    const totalLiq = coin.liquidationData.long + coin.liquidationData.short;
                    const longPct = (coin.liquidationData.long / totalLiq) * 100;
                    const shortPct = (coin.liquidationData.short / totalLiq) * 100;
                    
                    return (
                      <div key={coin.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {coin.symbol.substring(0, 1)}
                            </div>
                            <span className="font-medium">{coin.symbol}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: ${formatNumber(totalLiq)}
                          </div>
                        </div>
                        <div className="flex h-4 rounded-md overflow-hidden bg-muted">
                          <div 
                            className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${longPct}%` }}
                          >
                            {longPct > 15 && 'Long'}
                          </div>
                          <div 
                            className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${shortPct}%` }}
                          >
                            {shortPct > 15 && 'Short'}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Long: ${formatNumber(coin.liquidationData.long)} ({longPct.toFixed(1)}%)</span>
                          <span>Short: ${formatNumber(coin.liquidationData.short)} ({shortPct.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    Excellent Opportunities
                  </CardTitle>
                  <CardDescription>High-confidence trading candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredCoins.filter(coin => coin.suitability === 'excellent').map(coin => (
                      <div key={coin.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                        <div className="flex items-center gap-2">
                          <Badge>{coin.symbol}</Badge>
                          <span className="text-sm">{coin.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          RSI: {coin.rsi.toFixed(1)} • Vol: {coin.volatility.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <TrendingUp className="h-5 w-5" />
                    Good Opportunities
                  </CardTitle>
                  <CardDescription>Solid trading candidates with good potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredCoins.filter(coin => coin.suitability === 'good').map(coin => (
                      <div key={coin.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{coin.symbol}</Badge>
                          <span className="text-sm">{coin.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          RSI: {coin.rsi.toFixed(1)} • Vol: {coin.volatility.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <AlertTriangle className="h-5 w-5" />
                    Caution Required
                  </CardTitle>
                  <CardDescription>Proceed with careful risk management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredCoins.filter(coin => coin.suitability === 'fair' || coin.suitability === 'poor').map(coin => (
                      <div key={coin.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{coin.symbol}</Badge>
                          <span className="text-sm">{coin.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {coin.suitability}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          High volatility: {coin.volatility.toFixed(1)}%
                        </div>
                      </div>
                    ))}
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