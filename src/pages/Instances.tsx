import { AppLayout } from "@/components/layout/AppLayout";

export default function Instances() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instance Manager</h1>
          <p className="text-muted-foreground">
            Manage your Passivbot trading instances
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Instance management coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}