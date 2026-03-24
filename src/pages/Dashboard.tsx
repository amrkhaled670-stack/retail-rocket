import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getStats } from "@/lib/store";
import { DollarSign, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const stats = useMemo(() => getStats(), []);

  const cards = [
    { label: "Total Sales", value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, accent: "text-primary" },
    { label: "Total Profit", value: `$${stats.totalProfit.toFixed(2)}`, icon: TrendingUp, accent: "text-profit" },
    { label: "Low Stock Items", value: stats.lowStock.length, icon: AlertTriangle, accent: "text-loss" },
    { label: "Total Products", value: stats.totalProducts, icon: ShoppingCart, accent: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's your overview.</p>
        </div>
        <Link
          to="/pos"
          className="gradient-emerald px-5 py-2.5 rounded-lg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity animate-pulse-glow flex items-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Quick Sell
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-xl p-4 md:p-5 animate-slide-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.accent}`} />
            </div>
            <p className={`text-xl md:text-2xl font-bold font-mono ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Trend */}
      <div className="glass-card rounded-xl p-5 md:p-6">
        <h2 className="text-base font-semibold mb-4">Sales Trend (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 14% 18%)" />
              <XAxis dataKey="day" stroke="hsl(220 10% 54%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 54%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(224 18% 10%)",
                  border: "1px solid hsl(224 14% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={{ fill: "hsl(160 84% 39%)", r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="hsl(160 84% 29%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStock.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-loss" />
            Low Stock Alerts
          </h2>
          <div className="space-y-2">
            {stats.lowStock.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 px-3 rounded-lg bg-destructive/10 text-sm">
                <span>{p.name}</span>
                <span className="text-loss font-mono font-semibold">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
