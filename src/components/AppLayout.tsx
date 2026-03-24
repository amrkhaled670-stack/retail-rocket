import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Store,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/pos", icon: ShoppingCart, label: "POS" },
  { to: "/history", icon: History, label: "History" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 shrink-0 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-emerald flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">SwiftPOS</h1>
              <p className="text-xs text-muted-foreground">Advanced Inventory System</p>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 mx-3 mb-4 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Offline Ready</p>
            <p>Data saved locally. Works without internet.</p>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 flex justify-around py-2 safe-area-pb">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
