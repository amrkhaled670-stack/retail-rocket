import { useMemo } from "react";
import { getSales } from "@/lib/store";
import { Receipt, TrendingUp, Calendar } from "lucide-react";

export default function SalesHistory() {
  const sales = useMemo(() => getSales(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales History</h1>
        <p className="text-muted-foreground text-sm mt-1">{sales.length} transactions</p>
      </div>

      {sales.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No sales yet. Complete your first sale to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="glass-card rounded-xl p-4 md:p-5 animate-slide-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(sale.date).toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-profit text-sm font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +${sale.profit.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {sale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-mono">${(item.sellPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Tax: ${sale.tax.toFixed(2)}</span>
                <span className="font-bold font-mono">${sale.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
