"use client";

import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FinancialTransaction } from "@/types/finance";
import { formatIDR } from "@/lib/finance/format";

interface ExpenseCategoryPieProps {
  transactions: FinancialTransaction[];
}

const PALETTE = [
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#eab308", // Yellow
  "#a855f7", // Purple
  "#ef4444", // Red
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#84cc16", // Lime
  "#64748b", // Slate
];

export function ExpenseCategoryPie({ transactions }: ExpenseCategoryPieProps) {
  const { categoryData, totalExpense } = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === "expense");
    const catMap = new Map<string, number>();
    let total = 0;

    for (const t of expenseTx) {
      const name = t.category_name || "Lainnya";
      const amt = Math.round(t.amount);
      total += amt;
      catMap.set(name, (catMap.get(name) || 0) + amt);
    }

    const sorted = Array.from(catMap.entries())
      .map(([name, value], idx) => ({
        name,
        value,
        color: PALETTE[idx % PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions]);

  if (categoryData.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
        <p>Belum ada transaksi pengeluaran pada periode ini</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="w-full md:w-1/2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatIDR(Number(value) || 0), "Pengeluaran"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2eaf0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
        {categoryData.slice(0, 6).map((cat) => {
          const pct = Math.round((cat.value / totalExpense) * 100);
          return (
            <div
              key={cat.name}
              className="flex items-center justify-between text-[13px] py-1.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate text-gray-800 font-semibold">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-medium">
                <span className="text-gray-900 font-semibold">{formatIDR(cat.value)}</span>
                <span className="text-gray-400 w-8 text-right text-xs">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
