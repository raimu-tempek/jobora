import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  title: string;
  children: ReactNode;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  hasNotification?: boolean;
  onLogout?: () => void;
  onNotificationClick?: () => void;
}

export function AppShell({
  children,
  userName,
  userAvatar,
  hasNotification = true,
  onLogout,
  onNotificationClick,
}: AppShellProps) {
  return (
    <div className={styles.container}>
      <TopNavigation
        userName={userName}
        userAvatar={userAvatar}
        hasNotification={hasNotification}
        onNotificationClick={onNotificationClick}
        onLogout={onLogout}
      />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
