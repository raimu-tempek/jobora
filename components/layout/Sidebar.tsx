"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Briefcase, Wallet, ChevronDown, LogOut } from "lucide-react";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  onLogout?: () => void;
}

/**
 * Example usage:
 * ```tsx
 * <Sidebar
 *   userName="Rian Pratama"
 *   userAvatar="https://example.com/avatar.jpg"
 *   userRole="User"
 *   onLogout={() => console.log("Logout triggered")}
 * />
 * ```
 */
export function Sidebar({
  userName,
  userAvatar,
  userRole = "User",
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const [clientFetchedName, setClientFetchedName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!userName) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const name = (data?.user?.user_metadata?.full_name as string) || data?.user?.email;
        if (name) {
          setClientFetchedName(name);
        }
      });
    }
  }, [userName]);

  const resolvedName = userName || clientFetchedName;

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };

  const isFinanceRoute = pathname?.startsWith("/finance");
  const [financeExpanded, setFinanceExpanded] = useState<boolean>(true);
  const isExpanded = financeExpanded || isFinanceRoute;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Lamaran",
      href: "/applications",
      icon: Briefcase,
    },
  ];

  const financeSubmenu = [
    { label: "Overview", href: "/finance/overview" },
    { label: "Transactions", href: "/finance/transactions" },
    { label: "Scan Receipt", href: "/finance/scan" },
    { label: "Budgets", href: "/finance/budgets" },
    { label: "Reports", href: "/finance/reports" },
    { label: "Categories", href: "/finance/categories" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className={styles.sidebar} aria-label="Main Navigation">
      <div className={styles.topSection}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.wordmark}>
            Jobora
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Navigasi Utama">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : styles.navItemInactive
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  size={20}
                  strokeWidth={2.5}
                  className={styles.navIcon}
                  aria-hidden="true"
                />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}

          {/* Finance Tracker Primary Navigation */}
          <div className={styles.navGroup}>
            <Link
              href="/finance/overview"
              onClick={() => {
                if (isFinanceRoute) {
                  setFinanceExpanded(!financeExpanded);
                }
              }}
              className={`${styles.navItem} ${
                isFinanceRoute ? styles.navItemActive : styles.navItemInactive
              }`}
              aria-current={isFinanceRoute ? "page" : undefined}
            >
              <Wallet
                size={20}
                strokeWidth={2.5}
                className={styles.navIcon}
                aria-hidden="true"
              />
              <span className={styles.navLabel}>Finance Tracker</span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`${styles.navChevron} ${
                  isExpanded ? styles.navChevronOpen : ""
                }`}
                aria-hidden="true"
              />
            </Link>

            {isExpanded && (
              <div className={styles.submenu} aria-label="Submenu Finance Tracker">
                {financeSubmenu.map((sub) => {
                  const isSubActive =
                    pathname === sub.href || pathname?.startsWith(`${sub.href}/`);
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`${styles.submenuItem} ${
                        isSubActive
                          ? styles.submenuItemActive
                          : styles.submenuItemInactive
                      }`}
                      aria-current={isSubActive ? "page" : undefined}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={resolvedName ? `Foto profil ${resolvedName}` : "Foto profil pengguna"}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback} aria-hidden="true">
                {getInitials(resolvedName)}
              </div>
            )}
            <div className={styles.userMeta}>
              <span className={styles.userName} title={resolvedName}>
                {resolvedName || "Pengguna"}
              </span>
              <span className={styles.userRole}>{userRole}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            title="Keluar"
            aria-label="Keluar dari akun"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className={styles.srOnly}>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
