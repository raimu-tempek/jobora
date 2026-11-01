"use client";

import { useState, useEffect, ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";
import { Footer } from "./Footer";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  title?: string;
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Allow custom window events to open feedback modal from any component as well
  useEffect(() => {
    const handleOpenFeedbackEvent = () => setIsFeedbackOpen(true);
    window.addEventListener("jobora:open-feedback", handleOpenFeedbackEvent);
    return () => {
      window.removeEventListener("jobora:open-feedback", handleOpenFeedbackEvent);
    };
  }, []);

  return (
    <div className={styles.container}>
      <TopNavigation
        userName={userName}
        userAvatar={userAvatar}
        hasNotification={hasNotification}
        onNotificationClick={onNotificationClick}
        onLogout={onLogout}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
      <Footer onOpenFeedback={() => setIsFeedbackOpen(true)} />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
