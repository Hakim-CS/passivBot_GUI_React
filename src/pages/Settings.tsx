import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Key, Folder, Bell, Shield, Database, Monitor, Palette } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface APIKeyConfig {
  id: string;
  name: string;
  exchange: string;
  key: string;
  secret: string;
  passphrase?: string;
  isActive: boolean;
  lastUsed: string;
}

interface SystemConfig {
  passivbotPath: string;
  dataDirectory: string;
  logsDirectory: string;
  backupDirectory: string;
  maxConcurrentJobs: number;
  autoBackup: boolean;
  logLevel: string;
  theme: string;
  language: string;
}

interface NotificationConfig {
  email: boolean;
  slack: boolean;
  discord: boolean;
  telegram: boolean;
  emailAddress: string;
  slackWebhook: string;
  discordWebhook: string;
  telegramBotToken: string;
  telegramChatId: string;
}

const mockAPIKeys: APIKeyConfig[] = [
  {
    id: "1",
    name: "Binance Main",
    exchange: "binance",
    key: "AKIA...4XYZ",
    secret: "masked",
    isActive: true,
    lastUsed: "2024-01-15 14:30:00"
  },
  {
    id: "2",
    name: "Bybit Testnet",
    exchange: "bybit",
    key: "BYB...789",
    secret: "masked",
    passphrase: "masked",
    isActive: false,
    lastUsed: "2024-01-10 09:15:00"
  },
  {
    id: "3",
    name: "OKX Production",
    exchange: "okx",
    key: "OKX...456",
    secret: "masked",
    passphrase: "masked",
    isActive: true,
    lastUsed: "2024-01-14 16:45:00"
  }
];

const mockSystemConfig: SystemConfig = {
  passivbotPath: "/home/user/passivbot",
  dataDirectory: "/home/user/passivbot/data",
  logsDirectory: "/home/user/passivbot/logs",
  backupDirectory: "/home/user/passivbot/backups",
  maxConcurrentJobs: 4,
  autoBackup: true,
  logLevel: "INFO",
  theme: "dark",
  language: "en"
};

const mockNotificationConfig: NotificationConfig = {
  email: true,
  slack: false,
  discord: true,
  telegram: false,
  emailAddress: "user@example.com",
  slackWebhook: "",
  discordWebhook: "https://discord.com/api/webhooks/...",
  telegramBotToken: "",
  telegramChatId: ""
};

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>(mockAPIKeys);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(mockSystemConfig);
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(mockNotificationConfig);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    exchange: "",
    key: "",
    secret: "",
    passphrase: ""
  });
  const { toast } = useToast();

  const handleSaveSystemConfig = () => {
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated successfully."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Notification settings have been saved."
    });
  };

  const handleAddAPIKey = () => {
    if (!newKeyData.name || !newKeyData.exchange || !newKeyData.key || !newKeyData.secret) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKeyConfig = {
      id: Date.now().toString(),
      name: newKeyData.name,
      exchange: newKeyData.exchange,
      key: newKeyData.key.substring(0, 8) + "..." + newKeyData.key.slice(-4),
      secret: "masked",
      passphrase: newKeyData.passphrase ? "masked" : undefined,
      isActive: false,
      lastUsed: "Never"
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyData({ name: "", exchange: "", key: "", secret: "", passphrase: "" });
    setShowNewKeyForm(false);
    
    toast({
      title: "API Key Added",
      description: `${newKeyData.name} has been added successfully.`
    });
  };

  const toggleAPIKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const deleteAPIKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "API Key Deleted",
      description: "API key has been removed successfully."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure paths, API keys, and preferences
          </p>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Paths Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure directories and file paths for Passivbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="passivbot-path">Passivbot Installation Path</Label>
                    <Input
                      id="passivbot-path"
                      value={systemConfig.passivbotPath}
                      onChange={(e) => setSystemConfig({ ...systemConfig, passivbotPath: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="data-dir">Data Directory</Label>
                    <Input
                      id="data-dir"
                      value={systemConfig.dataDirectory}
                      onChange={(e) => setSystemConfig({ ...systemConfig, dataDirectory: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="logs-dir">Logs Directory</Label>
                    <Input
                      id="logs-dir"
                      value={systemConfig.logsDirectory}
                      onChange={(e) => setSystemConfig({ ...systemConfig, logsDirectory: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="backup-dir">Backup Directory</Label>
                    <Input
                      id="backup-dir"
                      value={systemConfig.backupDirectory}
                      onChange={(e) => setSystemConfig({ ...systemConfig, backupDirectory: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Performance Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system performance and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max-jobs">Maximum Concurrent Jobs</Label>
                    <Input
                      id="max-jobs"
                      type="number"
                      value={systemConfig.maxConcurrentJobs}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maxConcurrentJobs: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="log-level">Log Level</Label>
                    <Select value={systemConfig.logLevel} onValueChange={(value) => setSystemConfig({ ...systemConfig, logLevel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEBUG">DEBUG</SelectItem>
                        <SelectItem value="INFO">INFO</SelectItem>
                        <SelectItem value="WARNING">WARNING</SelectItem>
                        <SelectItem value="ERROR">ERROR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup configurations and data
                      </p>
                    </div>
                    <Switch
                      checked={systemConfig.autoBackup}
                      onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, autoBackup: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the interface appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={systemConfig.theme} onValueChange={(value) => setSystemConfig({ ...systemConfig, theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={systemConfig.language} onValueChange={(value) => setSystemConfig({ ...systemConfig, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveSystemConfig}>Save System Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Exchange API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your exchange API credentials
                </p>
              </div>
              <Button onClick={() => setShowNewKeyForm(true)}>Add API Key</Button>
            </div>

            {showNewKeyForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New API Key</CardTitle>
                  <CardDescription>
                    Enter your exchange API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key-name">Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Binance Main"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exchange">Exchange</Label>
                    <Select value={newKeyData.exchange} onValueChange={(value) => setNewKeyData({ ...newKeyData, exchange: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">Binance</SelectItem>
                        <SelectItem value="bybit">Bybit</SelectItem>
                        <SelectItem value="okx">OKX</SelectItem>
                        <SelectItem value="kucoin">KuCoin</SelectItem>
                        <SelectItem value="gateio">Gate.io</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      value={newKeyData.key}
                      onChange={(e) => setNewKeyData({ ...newKeyData, key: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-secret">API Secret</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="Enter API secret"
                      value={newKeyData.secret}
                      onChange={(e) => setNewKeyData({ ...newKeyData, secret: e.target.value })}
                    />
                  </div>
                  {(newKeyData.exchange === "okx" || newKeyData.exchange === "kucoin") && (
                    <div className="grid gap-2">
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        placeholder="Enter passphrase"
                        value={newKeyData.passphrase}
                        onChange={(e) => setNewKeyData({ ...newKeyData, passphrase: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleAddAPIKey}>Add Key</Button>
                    <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                            {apiKey.exchange.toUpperCase()}
                          </Badge>
                          {apiKey.isActive && <Badge variant="outline">Active</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Key: {apiKey.key} • Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={apiKey.isActive}
                          onCheckedChange={() => toggleAPIKey(apiKey.id)}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAPIKey(apiKey.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Configure how you want to receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.email}
                    onCheckedChange={(checked) => setNotificationConfig({ ...notificationConfig, email: checked })}
                  />
                </div>

                {notificationConfig.email && (
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={notificationConfig.emailAddress}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, emailAddress: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channel
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.slack}
                    onCheckedChange={(checked) => setNotificationConfig({ ...notificationConfig, slack: checked })}
                  />
                </div>

                {notificationConfig.slack && (
                  <div className="grid gap-2">
                    <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      placeholder="https://hooks.slack.com/services/..."
                      value={notificationConfig.slackWebhook}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, slackWebhook: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Discord Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Discord channel
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.discord}
                    onCheckedChange={(checked) => setNotificationConfig({ ...notificationConfig, discord: checked })}
                  />
                </div>

                {notificationConfig.discord && (
                  <div className="grid gap-2">
                    <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                    <Input
                      id="discord-webhook"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={notificationConfig.discordWebhook}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, discordWebhook: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Telegram Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via Telegram bot
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.telegram}
                    onCheckedChange={(checked) => setNotificationConfig({ ...notificationConfig, telegram: checked })}
                  />
                </div>

                {notificationConfig.telegram && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="telegram-token">Bot Token</Label>
                      <Input
                        id="telegram-token"
                        type="password"
                        placeholder="Enter bot token"
                        value={notificationConfig.telegramBotToken}
                        onChange={(e) => setNotificationConfig({ ...notificationConfig, telegramBotToken: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telegram-chat">Chat ID</Label>
                      <Input
                        id="telegram-chat"
                        placeholder="Enter chat ID"
                        value={notificationConfig.telegramChatId}
                        onChange={(e) => setNotificationConfig({ ...notificationConfig, telegramChatId: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security and access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">Security Recommendations</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use read-only API keys when possible</li>
                    <li>• Enable IP whitelisting on exchange accounts</li>
                    <li>• Regularly rotate API keys</li>
                    <li>• Enable 2FA on all exchange accounts</li>
                    <li>• Monitor API usage regularly</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="encryption">Data Encryption</Label>
                    <div className="flex items-center gap-2">
                      <Switch id="encryption" defaultChecked />
                      <span className="text-sm text-muted-foreground">
                        Encrypt sensitive data at rest
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      defaultValue={30}
                      min={5}
                      max={480}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="backup-encryption">Backup Encryption Key</Label>
                    <Textarea
                      id="backup-encryption"
                      placeholder="Enter or generate encryption key for backups"
                      rows={3}
                    />
                    <Button variant="outline" size="sm" className="w-fit">
                      Generate New Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Logs</CardTitle>
                <CardDescription>
                  Recent security events and access attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { time: "2024-01-15 14:30", event: "Successful login", ip: "192.168.1.100" },
                    { time: "2024-01-15 09:15", event: "API key accessed", ip: "192.168.1.100" },
                    { time: "2024-01-14 16:45", event: "Settings modified", ip: "192.168.1.100" },
                    { time: "2024-01-14 12:20", event: "Backup created", ip: "192.168.1.100" }
                  ].map((log, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <span className="font-medium">{log.event}</span>
                        <span className="text-sm text-muted-foreground ml-2">from {log.ip}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}