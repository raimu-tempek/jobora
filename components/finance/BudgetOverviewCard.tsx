import Link from "next/link";
import { FinancialBudget } from "@/types/finance";
import { formatIDR } from "@/lib/finance/format";
import { ArrowRight } from "lucide-react";

interface BudgetOverviewCardProps {
  budgets: FinancialBudget[];
  currentMonth: string;
}

export function BudgetOverviewCard({
  budgets,
  currentMonth,
}: BudgetOverviewCardProps) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-gray-400 text-sm mb-3">
          Belum ada anggaran pengeluaran untuk bulan ini ({currentMonth})
        </p>
        <Link
          href="/finance/budgets"
          className="text-xs font-semibold text-[#107c74] hover:underline flex items-center gap-1"
        >
          Atur Anggaran Bulanan <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.slice(0, 4).map((b) => {
        const spent = b.spent_amount || 0;
        const total = b.amount;
        const percentage = total > 0 ? Math.round((spent / total) * 100) : 0;

        let statusColor = "#10b981"; // < 80% Normal
        let statusBadge = "Normal";

        if (percentage >= 100) {
          statusColor = "#dc2626"; // > 100% Overspending
          statusBadge = percentage > 100 ? "Over Budget!" : "100% Tercapai";
        } else if (percentage >= 80) {
          statusColor = "#d97706"; // 80-99% Approaching limit
          statusBadge = "Mendekati Batas";
        }

        return (
          <div key={b.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-gray-800">
                {b.category_name}
              </span>
              <span
                className="font-semibold px-2 py-0.5 rounded-full text-xs"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}15`,
                }}
              >
                {percentage}% ({statusBadge})
              </span>
            </div>

            {/* Progress bar track */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Terpakai: {formatIDR(spent)}</span>
              <span>Batas: {formatIDR(total)}</span>
            </div>
          </div>
        );
      })}

      <div className="pt-2 text-right">
        <Link
          href="/finance/budgets"
          className="text-sm font-semibold text-[#107c74] hover:underline inline-flex items-center gap-1"
        >
          Lihat Semua Anggaran <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
