import { AppLayout } from "@/components/layout/AppLayout";

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure paths, API keys, and preferences
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Settings interface coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}