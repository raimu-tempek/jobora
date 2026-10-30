"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { FinancialTransaction } from "@/types/finance";
import { formatIDR, formatIDRCompact } from "@/lib/finance/format";

interface IncomeExpenseChartProps {
  transactions: FinancialTransaction[];
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month or day
    const monthsMap = new Map<string, { income: number; expense: number }>();

    // Generate last 6 months or group by existing transaction months
    for (const t of transactions) {
      const monthKey = t.date ? t.date.substring(0, 7) : "Unknown";
      const current = monthsMap.get(monthKey) || { income: 0, expense: 0 };
      if (t.type === "income") {
        current.income += Math.round(t.amount);
      } else if (t.type === "expense") {
        current.expense += Math.round(t.amount);
      }
      monthsMap.set(monthKey, current);
    }

    const sortedMonths = Array.from(monthsMap.keys()).sort();

    return sortedMonths.map((m) => {
      const parts = m.split("-");
      const monthNum = Number(parts[1]);
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];
      const label = monthNum >= 1 && monthNum <= 12 ? `${monthNames[monthNum - 1]} ${parts[0].slice(2)}` : m;
      const data = monthsMap.get(m)!;
      return {
        month: label,
        rawMonth: m,
        Pemasukan: data.income,
        Pengeluaran: data.expense,
      };
    });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
        <p>Belum ada data pemasukan & pengeluaran pada periode ini</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatIDRCompact(val)}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            formatter={(value: any) => [formatIDR(Number(value) || 0), ""]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2eaf0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: "13px",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "13px" }} />
          <Bar
            dataKey="Pemasukan"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="Pengeluaran"
            fill="#dc2626"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
