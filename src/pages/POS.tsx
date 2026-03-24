import { useState, useMemo, useCallback } from "react";
import { getProducts, saveSale, CartItem, Product } from "@/lib/store";
import { Search, Plus, Minus, Trash2, CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TAX_RATE = 0.1;

export default function POS() {
  const [products, setProducts] = useState(getProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [cashGiven, setCashGiven] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);

  const refresh = useCallback(() => setProducts(getProducts()), []);

  const filtered = products.filter(
    (p) => p.stock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.product.sellPrice * i.quantity, 0), [cart]);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const change = Math.max(0, cashGiven - total);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > i.product.stock) return i;
          return { ...i, quantity: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function completeSale() {
    if (cart.length === 0) return;
    if (cashGiven < total) {
      toast.error("Insufficient cash given");
      return;
    }
    saveSale(cart, TAX_RATE);
    setShowReceipt(true);
    toast.success("Sale completed!");
  }

  function newSale() {
    setCart([]);
    setCashGiven(0);
    setShowReceipt(false);
    refresh();
  }

  if (showReceipt) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-slide-in">
        <div className="glass-card rounded-2xl p-6 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold">Sale Complete!</h2>
          <p className="text-muted-foreground text-sm mt-1">Transaction saved successfully</p>
          <div className="mt-6 space-y-2 text-sm text-left">
            {cart.map((i) => (
              <div key={i.product.id} className="flex justify-between">
                <span>{i.product.name} × {i.quantity}</span>
                <span className="font-mono">${(i.product.sellPrice * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-3 space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (10%)</span><span className="font-mono">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-primary"><span>Change</span><span className="font-mono font-bold">${change.toFixed(2)}</span></div>
            </div>
          </div>
          <button onClick={newSale} className="w-full mt-6 gradient-emerald py-3 rounded-lg text-primary-foreground font-semibold">
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Point of Sale</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Product list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="glass-card rounded-xl p-4 text-left hover:ring-2 hover:ring-primary/50 transition-all group"
              >
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                <div className="flex justify-between items-end mt-3">
                  <span className="text-lg font-bold font-mono text-primary">${p.sellPrice.toFixed(2)}</span>
                  <Badge className={`text-xs ${p.stock < 5 ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-primary/20 text-primary border-primary/30"}`}>
                    {p.stock}
                  </Badge>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                No products available. Add products in Inventory first.
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-5 space-y-4 sticky top-4">
            <h2 className="font-semibold text-base">Current Cart</h2>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">Add products to start a sale</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">${item.product.sellPrice.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.product.id, -1)} className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-semibold w-16 text-right">${(item.product.sellPrice * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span className="font-mono">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>

                <div className="pt-2">
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Cash Given</label>
                  <input
                    type="number"
                    value={cashGiven || ""}
                    onChange={(e) => setCashGiven(+e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {cashGiven >= total && cashGiven > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Change</span>
                    <span className="font-mono">${change.toFixed(2)}</span>
                  </div>
                )}

                <button
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  className="w-full mt-2 gradient-emerald py-3 rounded-lg text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> Complete Sale
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
