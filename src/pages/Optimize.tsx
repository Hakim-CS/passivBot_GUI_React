import { AppLayout } from "@/components/layout/AppLayout";

export default function Optimize() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Optimization</h1>
          <p className="text-muted-foreground">
            Find optimal parameters for your trading strategies
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Optimization tools coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}