"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { FinancialTransaction } from "@/types/finance";
import { formatIDR, formatIDRCompact } from "@/lib/finance/format";

interface CashFlowTrendChartProps {
  transactions: FinancialTransaction[];
}

export function CashFlowTrendChart({ transactions }: CashFlowTrendChartProps) {
  const data = useMemo(() => {
    const monthsMap = new Map<string, number>();

    for (const t of transactions) {
      const month = t.date ? t.date.substring(0, 7) : "Unknown";
      const amt = Math.round(t.amount);
      const prev = monthsMap.get(month) || 0;
      if (t.type === "income") {
        monthsMap.set(month, prev + amt);
      } else if (t.type === "expense") {
        monthsMap.set(month, prev - amt);
      }
    }

    const sorted = Array.from(monthsMap.keys()).sort();
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    return sorted.map((m) => {
      const parts = m.split("-");
      const monthNum = Number(parts[1]);
      const label = monthNum >= 1 && monthNum <= 12 ? `${monthNames[monthNum - 1]} ${parts[0].slice(2)}` : m;
      return {
        month: label,
        "Arus Kas Bersih": monthsMap.get(m) || 0,
      };
    });
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
        <p>Belum ada data arus kas untuk tren</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#107c74" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#107c74" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            formatter={(value: any) => [formatIDR(Number(value) || 0), "Arus Kas"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2eaf0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="Arus Kas Bersih"
            stroke="#107c74"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#cashflowGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
