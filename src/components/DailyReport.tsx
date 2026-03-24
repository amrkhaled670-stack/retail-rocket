import { useMemo } from "react";
import { getDailyReportData, exportToPDF, exportToExcel } from "@/lib/exportReport";
import { FileText, FileSpreadsheet, Receipt } from "lucide-react";

export default function DailyReport() {
  const data = useMemo(() => getDailyReportData(), []);

  return (
    <div className="glass-card rounded-xl p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Daily Sales Report — {data.date}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-bold font-mono">{data.sales.length}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-lg font-bold font-mono text-primary">${data.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Profit</p>
          <p className="text-lg font-bold font-mono text-profit">${data.totalProfit.toFixed(2)}</p>
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No sales recorded today yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left py-2 font-medium">Product</th>
                <th className="text-right py-2 font-medium">Qty</th>
                <th className="text-right py-2 font-medium">Revenue</th>
                <th className="text-right py-2 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.name} className="border-b border-border/50">
                  <td className="py-2">{item.name}</td>
                  <td className="text-right font-mono">{item.qty}</td>
                  <td className="text-right font-mono">${item.revenue.toFixed(2)}</td>
                  <td className="text-right font-mono text-profit">${item.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
