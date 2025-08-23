import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cloud, 
  Server, 
  Download, 
  Upload, 
  RefreshCcw, 
  Terminal, 
  Folder, 
  Key,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  FileText,
  Database,
  RefreshCw,
  Play,
  Square,
  MonitorSpeaker
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RemoteServer {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync: string;
  syncEnabled: boolean;
  passivbotPath: string;
  configPath: string;
  dataPath: string;
  cpu: number;
  memory: number;
  disk: number;
  instances: number;
  version: string;
}

interface SyncOperation {
  id: string;
  type: 'upload' | 'download' | 'sync';
  source: string;
  destination: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  fileCount: number;
  totalSize: number;
  startTime: string;
  endTime?: string;
  error?: string;
}

interface SSHSession {
  id: string;
  serverId: string;
  serverName: string;
  status: 'active' | 'inactive';
  startTime: string;
  lastActivity: string;
  commands: number;
}

const mockServers: RemoteServer[] = [
  {
    id: "1",
    name: "Production VPS",
    host: "192.168.1.100",
    port: 22,
    username: "trader",
    status: "connected",
    lastSync: "2024-01-15 14:30:00",
    syncEnabled: true,
    passivbotPath: "/home/trader/passivbot",
    configPath: "/home/trader/passivbot/configs",
    dataPath: "/home/trader/passivbot/data",
    cpu: 45,
    memory: 68,
    disk: 23,
    instances: 5,
    version: "v6.1.2"
  },
  {
    id: "2", 
    name: "Backup Server",
    host: "backup.trading.com",
    port: 2222,
    username: "backup",
    status: "disconnected",
    lastSync: "2024-01-14 09:15:00",
    syncEnabled: false,
    passivbotPath: "/opt/passivbot",
    configPath: "/opt/passivbot/configs",
    dataPath: "/opt/passivbot/data",
    cpu: 0,
    memory: 0,
    disk: 45,
    instances: 0,
    version: "v6.0.8"
  },
  {
    id: "3",
    name: "Test Environment",
    host: "test.local",
    port: 22,
    username: "testuser",
    status: "error",
    lastSync: "2024-01-12 16:45:00",
    syncEnabled: true,
    passivbotPath: "/home/testuser/passivbot",
    configPath: "/home/testuser/passivbot/configs",
    dataPath: "/home/testuser/passivbot/data",
    cpu: 0,
    memory: 0,
    disk: 0,
    instances: 0,
    version: "unknown"
  }
];

const mockSyncOperations: SyncOperation[] = [
  {
    id: "1",
    type: "download",
    source: "/home/trader/passivbot/logs",
    destination: "./local/logs",
    status: "completed",
    progress: 100,
    fileCount: 25,
    totalSize: 1250000,
    startTime: "2024-01-15 14:25:00",
    endTime: "2024-01-15 14:28:00"
  },
  {
    id: "2",
    type: "upload",
    source: "./configs/new_strategy.json",
    destination: "/home/trader/passivbot/configs",
    status: "running",
    progress: 67,
    fileCount: 1,
    totalSize: 15000,
    startTime: "2024-01-15 14:30:00"
  },
  {
    id: "3",
    type: "sync",
    source: "./data",
    destination: "/home/trader/passivbot/data",
    status: "pending",
    progress: 0,
    fileCount: 150,
    totalSize: 50000000,
    startTime: "2024-01-15 14:35:00"
  }
];

const mockSSHSessions: SSHSession[] = [
  {
    id: "1",
    serverId: "1",
    serverName: "Production VPS",
    status: "active",
    startTime: "2024-01-15 13:45:00",
    lastActivity: "2024-01-15 14:32:00",
    commands: 23
  },
  {
    id: "2",
    serverId: "1",
    serverName: "Production VPS",
    status: "inactive",
    startTime: "2024-01-15 09:15:00",
    lastActivity: "2024-01-15 12:30:00",
    commands: 45
  }
];

export default function Remote() {
  const [servers, setServers] = useState<RemoteServer[]>(mockServers);
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>(mockSyncOperations);
  const [sshSessions, setSSHSessions] = useState<SSHSession[]>(mockSSHSessions);
  const [selectedServerId, setSelectedServerId] = useState<string>("1");
  const [showAddServer, setShowAddServer] = useState(false);
  const [newServerData, setNewServerData] = useState({
    name: "",
    host: "",
    port: 22,
    username: "",
    passivbotPath: "/home/user/passivbot"
  });
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "$ ps aux | grep passivbot",
    "trader   12345  0.1  2.3 123456 67890 ?        S    14:30   0:00 python main.py BTC/USDT",
    "trader   12346  0.1  1.8 98765  43210 ?        S    14:30   0:00 python main.py ETH/USDT",
    "$ tail -f logs/passivbot.log",
    "[2024-01-15 14:32:15] INFO: Position updated for BTC/USDT",
    "[2024-01-15 14:32:18] INFO: Order filled: 0.001 BTC at $43,250"
  ]);
  const { toast } = useToast();

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const connectToServer = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: 'connecting' }
        : server
    ));

    // Simulate connection
    setTimeout(() => {
      setServers(servers.map(server => 
        server.id === serverId 
          ? { ...server, status: 'connected', lastSync: new Date().toLocaleString() }
          : server
      ));
      toast({
        title: "Connected",
        description: "Successfully connected to remote server"
      });
    }, 2000);
  };

  const disconnectFromServer = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: 'disconnected' }
        : server
    ));
    toast({
      title: "Disconnected",
      description: "Disconnected from remote server"
    });
  };

  const startSync = (type: 'upload' | 'download' | 'sync') => {
    const newOperation: SyncOperation = {
      id: Date.now().toString(),
      type,
      source: type === 'upload' ? './local/configs' : '/remote/configs',
      destination: type === 'upload' ? '/remote/configs' : './local/configs',
      status: 'running',
      progress: 0,
      fileCount: 10,
      totalSize: 1000000,
      startTime: new Date().toLocaleString()
    };

    setSyncOperations([newOperation, ...syncOperations]);
    
    // Simulate progress
    const interval = setInterval(() => {
      setSyncOperations(prev => prev.map(op => 
        op.id === newOperation.id && op.progress < 100
          ? { ...op, progress: Math.min(100, op.progress + 10) }
          : op
      ));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setSyncOperations(prev => prev.map(op => 
        op.id === newOperation.id
          ? { ...op, status: 'completed', progress: 100, endTime: new Date().toLocaleString() }
          : op
      ));
    }, 5000);

    toast({
      title: "Sync Started",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} operation initiated`
    });
  };

  const executeCommand = () => {
    if (!commandInput.trim()) return;

    const newHistory = [...commandHistory, `$ ${commandInput}`, "Command executed successfully"];
    setCommandHistory(newHistory);
    setCommandInput("");

    toast({
      title: "Command Executed",
      description: commandInput
    });
  };

  const addServer = () => {
    if (!newServerData.name || !newServerData.host || !newServerData.username) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newServer: RemoteServer = {
      id: Date.now().toString(),
      ...newServerData,
      status: 'disconnected',
      lastSync: 'Never',
      syncEnabled: false,
      configPath: `${newServerData.passivbotPath}/configs`,
      dataPath: `${newServerData.passivbotPath}/data`,
      cpu: 0,
      memory: 0,
      disk: 0,
      instances: 0,
      version: 'unknown'
    };

    setServers([...servers, newServer]);
    setNewServerData({ name: "", host: "", port: 22, username: "", passivbotPath: "/home/user/passivbot" });
    setShowAddServer(false);

    toast({
      title: "Server Added",
      description: `${newServerData.name} has been added successfully`
    });
  };

  const getStatusIcon = (status: RemoteServer['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'connecting': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: RemoteServer['status']) => {
    switch (status) {
      case 'connected': return "bg-green-500";
      case 'disconnected': return "bg-red-500";
      case 'connecting': return "bg-blue-500";
      case 'error': return "bg-yellow-500";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Remote Operations</h1>
            <p className="text-muted-foreground">
              Synchronize with remote VPS and manage distributed operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddServer(true)}>
              <Server className="h-4 w-4 mr-2" />
              Add Server
            </Button>
            <Button onClick={() => startSync('sync')}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Servers</p>
                  <p className="text-2xl font-bold">{servers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Connected</p>
                  <p className="text-2xl font-bold">{servers.filter(s => s.status === 'connected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Syncs</p>
                  <p className="text-2xl font-bold">{syncOperations.filter(s => s.status === 'running').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">SSH Sessions</p>
                  <p className="text-2xl font-bold">{sshSessions.filter(s => s.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="servers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="sync">File Sync</TabsTrigger>
            <TabsTrigger value="terminal">Remote Terminal</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="space-y-4">
            {showAddServer && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Remote Server</CardTitle>
                  <CardDescription>Configure a new remote server connection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="server-name">Server Name</Label>
                      <Input
                        id="server-name"
                        placeholder="Production VPS"
                        value={newServerData.name}
                        onChange={(e) => setNewServerData({ ...newServerData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="server-host">Host/IP Address</Label>
                      <Input
                        id="server-host"
                        placeholder="192.168.1.100"
                        value={newServerData.host}
                        onChange={(e) => setNewServerData({ ...newServerData, host: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="server-port">SSH Port</Label>
                      <Input
                        id="server-port"
                        type="number"
                        value={newServerData.port}
                        onChange={(e) => setNewServerData({ ...newServerData, port: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="server-username">Username</Label>
                      <Input
                        id="server-username"
                        placeholder="trader"
                        value={newServerData.username}
                        onChange={(e) => setNewServerData({ ...newServerData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passivbot-path">Passivbot Path</Label>
                    <Input
                      id="passivbot-path"
                      value={newServerData.passivbotPath}
                      onChange={(e) => setNewServerData({ ...newServerData, passivbotPath: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addServer}>Add Server</Button>
                    <Button variant="outline" onClick={() => setShowAddServer(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {servers.map((server) => (
                <Card key={server.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`} />
                        <div>
                          <h3 className="font-semibold">{server.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {server.username}@{server.host}:{server.port}
                          </p>
                        </div>
                        {getStatusIcon(server.status)}
                        <Badge variant="outline">{server.version}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {servers.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {server.status === 'connected' ? (
                          <Button variant="outline" onClick={() => disconnectFromServer(server.id)}>
                            Disconnect
                          </Button>
                        ) : (
                          <Button onClick={() => connectToServer(server.id)}>
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>

                    {server.status === 'connected' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">CPU Usage</Label>
                            <div className="flex items-center gap-2">
                              <Progress value={server.cpu} className="flex-1" />
                              <span className="text-sm">{server.cpu}%</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Memory</Label>
                            <div className="flex items-center gap-2">
                              <Progress value={server.memory} className="flex-1" />
                              <span className="text-sm">{server.memory}%</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Disk Usage</Label>
                            <div className="flex items-center gap-2">
                              <Progress value={server.disk} className="flex-1" />
                              <span className="text-sm">{server.disk}%</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Instances</Label>
                            <div className="text-lg font-semibold">{server.instances}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Last sync: {server.lastSync}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Auto-sync</Label>
                            <Switch 
                              checked={server.syncEnabled}
                              onCheckedChange={(checked) => 
                                setServers(servers.map(s => 
                                  s.id === server.id ? { ...s, syncEnabled: checked } : s
                                ))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => startSync('upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Remote
              </Button>
              <Button onClick={() => startSync('download')}>
                <Download className="h-4 w-4 mr-2" />
                Download from Remote
              </Button>
              <Button onClick={() => startSync('sync')}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Bidirectional Sync
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sync Operations</CardTitle>
                <CardDescription>Monitor file synchronization progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operation</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncOperations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {operation.type === 'upload' && <Upload className="h-4 w-4 text-blue-500" />}
                            {operation.type === 'download' && <Download className="h-4 w-4 text-green-500" />}
                            {operation.type === 'sync' && <RefreshCcw className="h-4 w-4 text-purple-500" />}
                            <span className="capitalize">{operation.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{operation.source}</TableCell>
                        <TableCell className="font-mono text-sm">{operation.destination}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={operation.progress} className="w-20" />
                            <span className="text-sm">{operation.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            operation.status === 'completed' ? 'default' :
                            operation.status === 'failed' ? 'destructive' :
                            operation.status === 'running' ? 'secondary' : 'outline'
                          }>
                            {operation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{operation.fileCount}</TableCell>
                        <TableCell>{formatFileSize(operation.totalSize)}</TableCell>
                        <TableCell className="text-sm">
                          <div>{operation.startTime}</div>
                          {operation.endTime && (
                            <div className="text-muted-foreground">{operation.endTime}</div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminal" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Remote Terminal
                    {selectedServer && (
                      <Badge variant="outline">{selectedServer.name}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Execute commands on remote servers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ScrollArea className="h-64 w-full border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
                      {commandHistory.map((line, index) => (
                        <div key={index} className={line.startsWith('$') ? 'text-blue-400' : 'text-green-400'}>
                          {line}
                        </div>
                      ))}
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter command..."
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                        className="font-mono"
                      />
                      <Button onClick={executeCommand}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => setCommandInput('ps aux | grep passivbot')}>
                        Check Processes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCommandInput('tail -f logs/passivbot.log')}>
                        View Logs
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCommandInput('df -h')}>
                        Disk Usage
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCommandInput('htop')}>
                        System Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active SSH Sessions</CardTitle>
                  <CardDescription>Manage remote terminal sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Server</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Commands</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sshSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.serverName}</TableCell>
                          <TableCell>
                            <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{session.startTime}</TableCell>
                          <TableCell className="text-sm">{session.lastActivity}</TableCell>
                          <TableCell>{session.commands}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <MonitorSpeaker className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid gap-4">
              {servers.filter(s => s.status === 'connected').map((server) => (
                <Card key={server.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`} />
                        {server.name}
                      </div>
                      <Badge variant="outline">{server.instances} instances running</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">CPU Usage</Label>
                        <div className="space-y-1">
                          <Progress value={server.cpu} />
                          <div className="text-sm">{server.cpu}% / 100%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Memory Usage</Label>
                        <div className="space-y-1">
                          <Progress value={server.memory} />
                          <div className="text-sm">{server.memory}% / 100%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Disk Usage</Label>
                        <div className="space-y-1">
                          <Progress value={server.disk} />
                          <div className="text-sm">{server.disk}% / 100%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Network I/O</Label>
                        <div className="space-y-1">
                          <Progress value={35} />
                          <div className="text-sm">↑ 2.3 MB/s ↓ 1.8 MB/s</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Uptime:</span> 15d 7h 32m
                        </div>
                        <div>
                          <span className="text-muted-foreground">Load Avg:</span> 0.85, 0.92, 1.01
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processes:</span> 156 total, 3 running
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}