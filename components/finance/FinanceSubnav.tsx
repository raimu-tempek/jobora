"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  FileText,
  Tags,
} from "lucide-react";
import styles from "./FinanceSubnav.module.css";

const subnavItems = [
  { label: "Ringkasan", href: "/finance/overview", icon: LayoutDashboard },
  { label: "Transaksi", href: "/finance/transactions", icon: Receipt },
  { label: "Anggaran", href: "/finance/budgets", icon: PieChart },
  { label: "Laporan", href: "/finance/reports", icon: FileText },
  { label: "Kategori", href: "/finance/categories", icon: Tags },
];

export function FinanceSubnav() {
  const pathname = usePathname();

  return (
    <nav className={styles.subnavContainer} aria-label="Subnavigasi Keuangan">
      {subnavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.pill} ${
              isActive ? styles.pillActive : styles.pillInactive
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={16} strokeWidth={2.2} className={styles.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
