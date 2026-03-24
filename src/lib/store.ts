export interface Product {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: { productId: string; name: string; quantity: number; sellPrice: number; buyPrice: number }[];
  total: number;
  tax: number;
  profit: number;
  date: string;
}

const PRODUCTS_KEY = "pos_products";
const SALES_KEY = "pos_sales";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Products
export function getProducts(): Product[] {
  return read<Product[]>(PRODUCTS_KEY, []);
}

export function saveProducts(products: Product[]) {
  write(PRODUCTS_KEY, products);
}

export function addProduct(p: Omit<Product, "id">): Product {
  const products = getProducts();
  const product: Product = { ...p, id: crypto.randomUUID() };
  products.push(product);
  saveProducts(products);
  return product;
}

export function updateProduct(id: string, updates: Partial<Product>) {
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProducts(products);
}

export function deleteProduct(id: string) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

// Sales
export function getSales(): Sale[] {
  return read<Sale[]>(SALES_KEY, []);
}

export function saveSale(items: CartItem[], taxRate: number): Sale {
  const subtotal = items.reduce((s, i) => s + i.product.sellPrice * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const profit = items.reduce((s, i) => s + (i.product.sellPrice - i.product.buyPrice) * i.quantity, 0);

  const sale: Sale = {
    id: crypto.randomUUID(),
    items: items.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      sellPrice: i.product.sellPrice,
      buyPrice: i.product.buyPrice,
    })),
    total,
    tax,
    profit,
    date: new Date().toISOString(),
  };

  // Deduct stock
  const products = getProducts();
  items.forEach(ci => {
    const p = products.find(pr => pr.id === ci.product.id);
    if (p) p.stock = Math.max(0, p.stock - ci.quantity);
  });
  saveProducts(products);

  const sales = getSales();
  sales.unshift(sale);
  write(SALES_KEY, sales);

  return sale;
}

// Stats
export function getStats() {
  const sales = getSales();
  const products = getProducts();
  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const totalProfit = sales.reduce((s, sale) => s + sale.profit, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter(p => p.stock === 0);

  // Last 7 days sales trend
  const now = new Date();
  const trend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const daySales = sales.filter(s => s.date.startsWith(dayStr));
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      sales: daySales.reduce((s, sale) => s + sale.total, 0),
      profit: daySales.reduce((s, sale) => s + sale.profit, 0),
    };
  });

  return { totalSales, totalProfit, lowStock, outOfStock, trend, totalProducts: products.length };
}
