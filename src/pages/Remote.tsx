import { AppLayout } from "@/components/layout/AppLayout";

export default function Remote() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Remote Sync</h1>
          <p className="text-muted-foreground">
            Synchronize with remote VPS and manage PBRemote
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Remote sync interface coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}