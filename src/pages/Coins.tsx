import { AppLayout } from "@/components/layout/AppLayout";

export default function Coins() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coin Picker</h1>
          <p className="text-muted-foreground">
            Browse and analyze cryptocurrencies for trading
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Coin picker interface coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
}