import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Server, 
  Cloud, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Monitor,
  Power,
  PowerOff,
  RefreshCw,
  Settings,
  Trash2,
  Terminal,
  Upload,
  Download,
  Shield,
  Key,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const vpsSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  provider: z.string().min(1, 'Provider is required'),
  region: z.string().min(1, 'Region is required'),
  plan: z.string().min(1, 'Plan is required'),
  host: z.string().min(1, 'Host/IP is required'),
  port: z.number().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  ssh_key: z.string().optional(),
  password: z.string().optional(),
  auto_deploy: z.boolean(),
  auto_backup: z.boolean(),
  monitoring: z.boolean(),
});

type VPSFormData = z.infer<typeof vpsSchema>;

interface VPSServer {
  id: string;
  name: string;
  provider: string;
  region: string;
  plan: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline' | 'deploying' | 'error' | 'maintenance';
  created_at: string;
  last_seen: string;
  
  // System specs
  specs: {
    cpu_cores: number;
    ram_gb: number;
    storage_gb: number;
    bandwidth_gb: number;
    monthly_cost: number;
  };
  
  // Performance metrics
  metrics: {
    cpu_usage: number;
    ram_usage: number;
    disk_usage: number;
    network_in: number;
    network_out: number;
    uptime: number;
  };
  
  // Deployed instances
  instances: Array<{
    id: string;
    name: string;
    symbol: string;
    status: 'running' | 'stopped' | 'error';
    cpu_usage: number;
    memory_usage: number;
  }>;
  
  // Configuration
  config: {
    auto_deploy: boolean;
    auto_backup: boolean;
    monitoring: boolean;
    ssh_key_auth: boolean;
  };
}

interface DeploymentJob {
  id: string;
  server_id: string;
  server_name: string;
  instance_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  logs: string[];
  error?: string;
}

// Mock data for VPS servers
const mockServers: VPSServer[] = [
  {
    id: 'vps_001',
    name: 'Production Server 1',
    provider: 'DigitalOcean',
    region: 'New York',
    plan: 'Premium Droplet',
    host: '134.209.185.234',
    port: 22,
    username: 'root',
    status: 'online',
    created_at: '2024-01-15T10:30:00Z',
    last_seen: new Date().toISOString(),
    specs: {
      cpu_cores: 4,
      ram_gb: 8,
      storage_gb: 160,
      bandwidth_gb: 5000,
      monthly_cost: 48.00
    },
    metrics: {
      cpu_usage: 35.2,
      ram_usage: 62.8,
      disk_usage: 45.1,
      network_in: 1.2,
      network_out: 0.8,
      uptime: 99.8
    },
    instances: [
      { id: 'inst_001', name: 'BTC Grid Bot', symbol: 'BTCUSDT', status: 'running', cpu_usage: 12.3, memory_usage: 1.2 },
      { id: 'inst_002', name: 'ETH DCA Bot', symbol: 'ETHUSDT', status: 'running', cpu_usage: 8.7, memory_usage: 0.9 }
    ],
    config: {
      auto_deploy: true,
      auto_backup: true,
      monitoring: true,
      ssh_key_auth: true
    }
  },
  {
    id: 'vps_002',
    name: 'Testing Server',
    provider: 'AWS',
    region: 'Frankfurt',
    plan: 't3.medium',
    host: '3.123.45.67',
    port: 22,
    username: 'ubuntu',
    status: 'deploying',
    created_at: '2024-02-20T14:15:00Z',
    last_seen: new Date(Date.now() - 120000).toISOString(),
    specs: {
      cpu_cores: 2,
      ram_gb: 4,
      storage_gb: 50,
      bandwidth_gb: 1000,
      monthly_cost: 32.50
    },
    metrics: {
      cpu_usage: 15.7,
      ram_usage: 28.4,
      disk_usage: 22.3,
      network_in: 0.3,
      network_out: 0.2,
      uptime: 97.2
    },
    instances: [
      { id: 'inst_003', name: 'SOL Test Bot', symbol: 'SOLUSDT', status: 'stopped', cpu_usage: 0, memory_usage: 0 }
    ],
    config: {
      auto_deploy: false,
      auto_backup: true,
      monitoring: true,
      ssh_key_auth: false
    }
  },
  {
    id: 'vps_003',
    name: 'Backup Server',
    provider: 'Vultr',
    region: 'Tokyo',
    plan: 'High Performance',
    host: '45.76.123.89',
    port: 22,
    username: 'admin',
    status: 'error',
    created_at: '2024-01-28T09:45:00Z',
    last_seen: new Date(Date.now() - 1800000).toISOString(),
    specs: {
      cpu_cores: 6,
      ram_gb: 16,
      storage_gb: 320,
      bandwidth_gb: 6000,
      monthly_cost: 96.00
    },
    metrics: {
      cpu_usage: 0,
      ram_usage: 0,
      disk_usage: 67.8,
      network_in: 0,
      network_out: 0,
      uptime: 85.3
    },
    instances: [],
    config: {
      auto_deploy: true,
      auto_backup: false,
      monitoring: true,
      ssh_key_auth: true
    }
  }
];

// Mock deployment jobs
const mockDeployments: DeploymentJob[] = [
  {
    id: 'deploy_001',
    server_id: 'vps_002',
    server_name: 'Testing Server',
    instance_name: 'SOL Test Bot',
    status: 'running',
    progress: 67,
    started_at: new Date(Date.now() - 300000).toISOString(),
    logs: [
      '[10:30:15] Connecting to server...',
      '[10:30:16] SSH connection established',
      '[10:30:17] Updating system packages...',
      '[10:30:45] Installing Python dependencies...',
      '[10:32:12] Configuring Passivbot environment...',
      '[10:33:28] Setting up trading instance...'
    ]
  },
  {
    id: 'deploy_002',
    server_id: 'vps_001',
    server_name: 'Production Server 1',
    instance_name: 'ADA Grid Bot',
    status: 'completed',
    progress: 100,
    started_at: new Date(Date.now() - 900000).toISOString(),
    completed_at: new Date(Date.now() - 600000).toISOString(),
    logs: [
      '[10:15:22] Deployment completed successfully',
      '[10:15:23] Instance started and running',
      '[10:15:24] Health check passed'
    ]
  }
];

const providers = [
  { value: 'digitalocean', label: 'DigitalOcean' },
  { value: 'aws', label: 'Amazon AWS' },
  { value: 'vultr', label: 'Vultr' },
  { value: 'linode', label: 'Linode' },
  { value: 'hetzner', label: 'Hetzner' },
  { value: 'google', label: 'Google Cloud' }
];

const regions = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
];

const plans = [
  { value: 'basic', label: 'Basic (2 vCPU, 2GB RAM)' },
  { value: 'standard', label: 'Standard (2 vCPU, 4GB RAM)' },
  { value: 'premium', label: 'Premium (4 vCPU, 8GB RAM)' },
  { value: 'enterprise', label: 'Enterprise (8 vCPU, 16GB RAM)' }
];

export default function VPS() {
  const [servers, setServers] = useState<VPSServer[]>(mockServers);
  const [deployments, setDeployments] = useState<DeploymentJob[]>(mockDeployments);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPSServer | null>(null);

  const form = useForm<VPSFormData>({
    resolver: zodResolver(vpsSchema),
    defaultValues: {
      name: '',
      provider: 'digitalocean',
      region: 'us-east-1',
      plan: 'standard',
      host: '',
      port: 22,
      username: 'root',
      auto_deploy: true,
      auto_backup: true,
      monitoring: true,
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'deploying': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'deploying': return 'secondary';
      case 'maintenance': return 'secondary';
      case 'offline': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCreateServer = async (data: VPSFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newServer: VPSServer = {
        id: `vps_${Date.now()}`,
        name: data.name,
        provider: data.provider,
        region: data.region,
        plan: data.plan,
        host: data.host,
        port: data.port,
        username: data.username,
        status: 'offline',
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        specs: {
          cpu_cores: 2,
          ram_gb: 4,
          storage_gb: 50,
          bandwidth_gb: 1000,
          monthly_cost: 25.00
        },
        metrics: {
          cpu_usage: 0,
          ram_usage: 0,
          disk_usage: 0,
          network_in: 0,
          network_out: 0,
          uptime: 0
        },
        instances: [],
        config: {
          auto_deploy: data.auto_deploy,
          auto_backup: data.auto_backup,
          monitoring: data.monitoring,
          ssh_key_auth: !!data.ssh_key
        }
      };
      
      setServers(prev => [newServer, ...prev]);
      setIsCreateDialogOpen(false);
      form.reset();
      
      toast({
        title: "Server Added",
        description: `VPS server "${data.name}" has been added successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'restart' | 'test') => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServers(prev => prev.map(server => {
        if (server.id === serverId) {
          let newStatus: VPSServer['status'];
          switch (action) {
            case 'start':
            case 'restart':
              newStatus = 'online';
              break;
            case 'stop':
              newStatus = 'offline';
              break;
            case 'test':
              newStatus = server.status; // Keep current status for test
              break;
            default:
              newStatus = server.status;
          }
          
          return {
            ...server,
            status: newStatus,
            last_seen: new Date().toISOString(),
          };
        }
        return server;
      }));
      
      toast({
        title: "Action Completed",
        description: `Server ${action} completed successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} server. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServers(prev => prev.filter(server => server.id !== serverId));
      
      toast({
        title: "Server Deleted",
        description: "VPS server has been deleted successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalServers = servers.length;
  const onlineServers = servers.filter(server => server.status === 'online').length;
  const totalInstances = servers.reduce((sum, server) => sum + server.instances.length, 0);
  const totalMonthlyCost = servers.reduce((sum, server) => sum + server.specs.monthly_cost, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VPS Management</h1>
            <p className="text-muted-foreground">
              Deploy and manage your trading bots on remote servers
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New VPS Server</DialogTitle>
                <DialogDescription>
                  Connect a new VPS server for deploying your trading bots.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateServer)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Production Server 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {providers.map(provider => (
                                <SelectItem key={provider.value} value={provider.value}>
                                  {provider.label}
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
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regions.map(region => (
                                <SelectItem key={region.value} value={region.value}>
                                  {region.label}
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
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plans.map(plan => (
                                <SelectItem key={plan.value} value={plan.value}>
                                  {plan.label}
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
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host/IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SSH Port</FormLabel>
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="root" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="ssh_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSH Private Key (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to use password authentication
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password (if not using SSH key)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="auto_deploy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Deploy</FormLabel>
                            <FormDescription>
                              Automatically deploy instances to this server
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
                      name="auto_backup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Backup</FormLabel>
                            <FormDescription>
                              Automatically backup configurations and data
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
                      name="monitoring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Monitoring</FormLabel>
                            <FormDescription>
                              Monitor server performance and health
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
                      Add Server
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
              <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServers}</div>
              <p className="text-xs text-muted-foreground">
                {onlineServers} online
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Instances</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstances}</div>
              <p className="text-xs text-muted-foreground">
                Across all servers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</div>
              <p className="text-xs text-muted-foreground">
                Infrastructure costs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {onlineServers > 0 ? formatUptime(servers.filter(s => s.status === 'online').reduce((sum, s) => sum + s.metrics.uptime, 0) / onlineServers) : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Average uptime
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="servers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="servers" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>VPS Servers</span>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servers.length > 0 ? (
                  <div className="space-y-4">
                    {servers.map((server) => (
                      <Card key={server.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {server.name}
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                                <Badge variant={getStatusVariant(server.status)}>
                                  {server.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {server.provider} • {server.region} • {server.host}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleServerAction(server.id, 'test')}
                              disabled={isLoading}
                            >
                              <Terminal className="h-3 w-3" />
                            </Button>
                            
                            {server.status === 'online' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleServerAction(server.id, 'stop')}
                                disabled={isLoading}
                              >
                                <PowerOff className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleServerAction(server.id, 'start')}
                                disabled={isLoading}
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button size="sm" variant="outline">
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
                                  <AlertDialogTitle>Delete Server</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "{server.name}"? This will stop all running instances.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteServer(server.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-3">
                          {/* System Resources */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">System Resources</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                  <Cpu className="h-3 w-3" />
                                  CPU
                                </span>
                                <span className="text-sm font-mono">{server.metrics.cpu_usage.toFixed(1)}%</span>
                              </div>
                              <Progress value={server.metrics.cpu_usage} className="h-1" />
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                  <Monitor className="h-3 w-3" />
                                  RAM
                                </span>
                                <span className="text-sm font-mono">{server.metrics.ram_usage.toFixed(1)}%</span>
                              </div>
                              <Progress value={server.metrics.ram_usage} className="h-1" />
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                  <HardDrive className="h-3 w-3" />
                                  Disk
                                </span>
                                <span className="text-sm font-mono">{server.metrics.disk_usage.toFixed(1)}%</span>
                              </div>
                              <Progress value={server.metrics.disk_usage} className="h-1" />
                            </div>
                          </div>
                          
                          {/* Server Specs */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Specifications</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CPU Cores:</span>
                                <span>{server.specs.cpu_cores}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">RAM:</span>
                                <span>{server.specs.ram_gb} GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Storage:</span>
                                <span>{server.specs.storage_gb} GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Monthly Cost:</span>
                                <span>{formatCurrency(server.specs.monthly_cost)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Running Instances */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Running Instances ({server.instances.length})</h4>
                            <div className="space-y-2">
                              {server.instances.length > 0 ? (
                                server.instances.map((instance) => (
                                  <div key={instance.id} className="flex items-center justify-between text-sm">
                                    <div>
                                      <div className="font-medium">{instance.name}</div>
                                      <div className="text-xs text-muted-foreground">{instance.symbol}</div>
                                    </div>
                                    <Badge variant={instance.status === 'running' ? 'default' : 'secondary'}>
                                      {instance.status}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No instances running</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Server className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">No Servers</h3>
                        <p className="text-muted-foreground">Add your first VPS server to get started.</p>
                      </div>
                      <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Server
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment History</CardTitle>
                <CardDescription>Recent and ongoing deployments to VPS servers</CardDescription>
              </CardHeader>
              <CardContent>
                {deployments.length > 0 ? (
                  <div className="space-y-4">
                    {deployments.map((deployment) => (
                      <Card key={deployment.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{deployment.instance_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {deployment.server_name} • Started {new Date(deployment.started_at).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={
                            deployment.status === 'completed' ? 'default' :
                            deployment.status === 'running' ? 'secondary' :
                            deployment.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {deployment.status}
                          </Badge>
                        </div>
                        
                        {deployment.status === 'running' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{deployment.progress}%</span>
                            </div>
                            <Progress value={deployment.progress} className="h-2" />
                          </div>
                        )}
                        
                        <div className="bg-muted p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                          {deployment.logs.map((log, index) => (
                            <div key={index}>{log}</div>
                          ))}
                        </div>
                        
                        {deployment.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            Error: {deployment.error}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">No Deployments</h3>
                        <p className="text-muted-foreground">Deployment history will appear here.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Server Performance</CardTitle>
                  <CardDescription>Real-time performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Performance charts would render here</p>
                      <p className="text-sm mt-2">CPU, RAM, Network usage over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Activity</CardTitle>
                  <CardDescription>Bandwidth usage across servers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Network charts would render here</p>
                      <p className="text-sm mt-2">Inbound/outbound traffic monitoring</p>
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