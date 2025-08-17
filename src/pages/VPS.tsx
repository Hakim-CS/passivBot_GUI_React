import { AppLayout } from "@/components/layout/AppLayout";

export default function VPS() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VPS Management</h1>
          <p className="text-muted-foreground">
            Deploy and manage your trading bots on remote servers
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">VPS management coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}