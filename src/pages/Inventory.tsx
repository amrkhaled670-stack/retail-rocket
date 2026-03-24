import { useState, useCallback } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from "@/lib/store";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
  if (stock < 5)
    return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">Low Stock</Badge>;
  return <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">In Stock</Badge>;
}

const emptyForm = { name: "", category: "", buyPrice: 0, sellPrice: 0, stock: 0 };

export default function Inventory() {
  const [products, setProducts] = useState(getProducts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = useCallback(() => setProducts(getProducts()), []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, form);
    } else {
      addProduct(form);
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    refresh();
  }

  function startEdit(p: Product) {
    setForm({ name: p.name, category: p.category, buyPrice: p.buyPrice, sellPrice: p.sellPrice, stock: p.stock });
    setEditingId(p.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    deleteProduct(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="gradient-emerald px-4 py-2 rounded-lg text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search */}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4 animate-slide-in"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Product</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {[
              { label: "Name", key: "name", type: "text" },
              { label: "Category", key: "category", type: "text" },
              { label: "Buy Price", key: "buyPrice", type: "number" },
              { label: "Sell Price", key: "sellPrice", type: "number" },
              { label: "Stock Qty", key: "stock", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">{label}</label>
                <input
                  type={type}
                  required
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: type === "number" ? +e.target.value : e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  step={type === "number" ? "0.01" : undefined}
                  min={type === "number" ? "0" : undefined}
                />
              </div>
            ))}
            <button type="submit" className="w-full gradient-emerald py-2.5 rounded-lg text-primary-foreground font-semibold text-sm">
              {editingId ? "Update" : "Add"} Product
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Buy</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sell</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-right font-mono">${p.buyPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">${p.sellPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><StockBadge stock={p.stock} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
