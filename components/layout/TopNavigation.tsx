"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquarePlus,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import styles from "./TopNavigation.module.css";

export interface TopNavigationProps {
  userName?: string;
  userAvatar?: string;
  hasNotification?: boolean;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  onOpenFeedback?: () => void;
}

export function TopNavigation({
  userName,
  userAvatar,
  hasNotification = true,
  onNotificationClick,
  onLogout,
  onOpenFeedback,
}: TopNavigationProps) {
  const pathname = usePathname();
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const financeRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isFinanceRoute = pathname?.startsWith("/finance");

  // Hover handlers for Finance Tracker dropdown
  const handleFinanceMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsFinanceOpen(true);
  };

  const handleFinanceMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFinanceOpen(false);
    }, 180);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        financeRef.current &&
        !financeRef.current.contains(event.target as Node)
      ) {
        setIsFinanceOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on click
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsFinanceOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const financeSubmenu = [
    { label: "Ringkasan", href: "/finance/overview" },
    { label: "Transaksi", href: "/finance/transactions" },
    { label: "Anggaran", href: "/finance/budgets" },
    { label: "Laporan", href: "/finance/reports" },
    { label: "Kategori", href: "/finance/categories" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Left Section: Brand */}
        <div className={styles.leftSection}>
          <Link href="/dashboard" className={styles.brand}>
            <div className={styles.logoIcon}>J</div>
            <span className={styles.wordmark}>Jobora</span>
          </Link>
        </div>

        {/* Center Section: Navigation Links (No Icons, Centered) */}
        <nav className={styles.centerNav} aria-label="Navigasi Utama">
          <Link
            href="/dashboard"
            onClick={closeAllMenus}
            className={`${styles.navLink} ${
              pathname === "/dashboard" ? styles.navLinkActive : ""
            }`}
          >
            <span>Dashboard</span>
          </Link>

          <Link
            href="/applications"
            onClick={closeAllMenus}
            className={`${styles.navLink} ${
              pathname === "/applications" ? styles.navLinkActive : ""
            }`}
          >
            <span>Job Journey</span>
          </Link>

          {/* Finance Tracker Dropdown with Hover & Direct Click to Overview */}
          <div
            className={styles.dropdownContainer}
            ref={financeRef}
            onMouseEnter={handleFinanceMouseEnter}
            onMouseLeave={handleFinanceMouseLeave}
          >
            <Link
              href="/finance/overview"
              onClick={closeAllMenus}
              className={`${styles.dropdownTrigger} ${
                isFinanceRoute ? styles.dropdownTriggerActive : ""
              }`}
              aria-expanded={isFinanceOpen}
            >
              <span>Finance Tracker</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isFinanceOpen ? "rotate-180" : ""
                }`}
              />
            </Link>

            {isFinanceOpen && (
              <div
                className={styles.dropdownMenu}
                onMouseEnter={handleFinanceMouseEnter}
                onMouseLeave={handleFinanceMouseLeave}
              >
                {financeSubmenu.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`${styles.dropdownItem} ${
                        isSubActive ? styles.dropdownItemActive : ""
                      }`}
                      onClick={closeAllMenus}
                    >
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Notification & Profile */}
        <div className={styles.rightSection}>
          {/* Notification Icon */}
          <button
            type="button"
            onClick={onNotificationClick}
            className={styles.iconBtn}
            aria-label="Lihat notifikasi"
            title="Notifikasi"
          >
            <Bell size={18} />
            {hasNotification && <span className={styles.notificationDot} />}
          </button>

          {/* User Profile & Menu */}
          <div className={styles.userMenuContainer} ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={styles.userTrigger}
            >
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatar}
                  alt={userName || "Profil"}
                  className="w-7 h-7 rounded-lg object-cover"
                />
              ) : (
                <div className={styles.avatar}>{getInitials(userName)}</div>
              )}
              <span className={styles.userNameText}>{userName || "Pengguna"}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className={styles.userMenuDropdown}>
                <div className="px-3 py-2 border-b border-gray-100 text-[11px] text-gray-500">
                  Login sebagai <strong className="text-gray-800 block truncate">{userName || "Pengguna"}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenFeedback?.();
                  }}
                  className={styles.menuItemBtn}
                >
                  <MessageSquarePlus size={14} className="text-[#107c74]" />
                  <span>Kritik & Saran</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  <LogOut size={14} />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={styles.mobileMenuBtn}
            aria-label="Menu navigasi"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e2eaf0] px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={closeAllMenus}
              className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold ${
                pathname === "/dashboard"
                  ? "bg-[#e6faf7] text-[#107c74]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/applications"
              onClick={closeAllMenus}
              className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold ${
                pathname === "/applications"
                  ? "bg-[#e6faf7] text-[#107c74]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>Job Journey</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 block mb-1">
              Finance Tracker
            </span>
            <div className="grid grid-cols-2 gap-1">
              {financeSubmenu.map((sub) => {
                const isSubActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={closeAllMenus}
                    className={`flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      isSubActive
                        ? "bg-[#e6faf7] text-[#107c74]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                closeAllMenus();
                onOpenFeedback?.();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#107c74] text-left cursor-pointer transition"
            >
              <MessageSquarePlus size={15} className="text-[#107c74]" />
              <span>Kritik & Saran</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
