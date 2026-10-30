"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  title: string;
  userName?: string;
  userAvatar?: string;
  hasNotification?: boolean;
  onNotificationClick?: () => void;
}

/**
 * Example usage:
 * ```tsx
 * <TopBar
 *   title="Dashboard"
 *   userName="Rian Pratama"
 *   userAvatar="https://example.com/avatar.jpg"
 *   hasNotification={true}
 *   onNotificationClick={() => console.log("Notification bell clicked")}
 * />
 * ```
 */
export function TopBar({
  title,
  userName,
  userAvatar,
  hasNotification = true,
  onNotificationClick,
}: TopBarProps) {
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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.notificationButton}
          onClick={onNotificationClick}
          aria-label="Lihat notifikasi"
          title="Notifikasi"
        >
          <Bell
            size={20}
            strokeWidth={2.5}
            className={styles.notificationIcon}
            aria-hidden="true"
          />
          {hasNotification && (
            <span
              className={styles.notificationDot}
              aria-hidden="true"
              role="presentation"
            />
          )}
          <span className={styles.srOnly}>Notifikasi</span>
        </button>

        <div className={styles.avatarContainer}>
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userAvatar}
              alt={resolvedName ? `Foto profil ${resolvedName}` : "Foto profil pengguna"}
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {getInitials(resolvedName)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
