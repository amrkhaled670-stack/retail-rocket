import { getSales } from "@/lib/store";
import type { Sale } from "@/lib/store";

export function getTodaySales(): Sale[] {
  const today = new Date().toISOString().split("T")[0];
  return getSales().filter((s) => s.date.startsWith(today));
}

export function getDailyReportData() {
  const sales = getTodaySales();
  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalProfit = sales.reduce((s, sale) => s + sale.profit, 0);

  const items: { name: string; qty: number; revenue: number; profit: number }[] = [];
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = items.find((i) => i.name === item.name);
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += item.sellPrice * item.quantity;
        existing.profit += (item.sellPrice - item.buyPrice) * item.quantity;
      } else {
        items.push({
          name: item.name,
          qty: item.quantity,
          revenue: item.sellPrice * item.quantity,
          profit: (item.sellPrice - item.buyPrice) * item.quantity,
        });
      }
    });
  });

  return { sales, items, totalRevenue, totalProfit, date: new Date().toLocaleDateString() };
}

export async function exportToPDF() {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const data = getDailyReportData();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("SwiftPOS: Advanced Inventory System", 14, 20);
  doc.setFontSize(12);
  doc.text(`Daily Sales Report — ${data.date}`, 14, 30);
  doc.text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`, 14, 40);
  doc.text(`Total Profit: $${data.totalProfit.toFixed(2)}`, 14, 48);
  doc.text(`Transactions: ${data.sales.length}`, 14, 56);

  (doc as any).autoTable({
    startY: 65,
    head: [["Product", "Qty Sold", "Revenue ($)", "Profit ($)"]],
    body: data.items.map((i) => [i.name, i.qty, i.revenue.toFixed(2), i.profit.toFixed(2)]),
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(`SwiftPOS_DailyReport_${new Date().toISOString().split("T")[0]}.pdf`);
}

export async function exportToExcel() {
  const XLSX = await import("xlsx");
  const data = getDailyReportData();

  const wsData = [
    ["SwiftPOS: Advanced Inventory System - Daily Sales Report"],
    [`Date: ${data.date}`],
    [`Total Revenue: $${data.totalRevenue.toFixed(2)}`],
    [`Total Profit: $${data.totalProfit.toFixed(2)}`],
    [],
    ["Product", "Qty Sold", "Revenue ($)", "Profit ($)"],
    ...data.items.map((i) => [i.name, i.qty, i.revenue.toFixed(2), i.profit.toFixed(2)]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
  XLSX.writeFile(wb, `SwiftPOS_DailyReport_${new Date().toISOString().split("T")[0]}.xlsx`);
}
