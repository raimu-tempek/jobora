import { Application } from "@/types/application";
import { isActiveStatus } from "./format";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns true if an application requires follow-up:
 * 1. Has an active status (Submitted, Test, Task, Interview HR/User, LGD, FGD)
 * 2. Effective last activity date (either application date or real status update) is older than 7 days.
 */
export function isFollowUp(app: Application, now = Date.now()): boolean {
  if (!isActiveStatus(app.status)) {
    return false;
  }

  const updatedTime = app.updated_at ? new Date(app.updated_at).getTime() : NaN;
  const createdTime = app.created_at ? new Date(app.created_at).getTime() : NaN;
  const appliedTime = app.date ? new Date(app.date).getTime() : NaN;

  // Determine the effective last activity date:
  // If the record was modified significantly after creation, use updated_at.
  // Otherwise (e.g. bulk-imported, seeded, or unedited records), use the application date (app.date).
  let effectiveTime = updatedTime;

  const isFreshInsert =
    !isNaN(createdTime) &&
    !isNaN(updatedTime) &&
    Math.abs(updatedTime - createdTime) < 120_000; // within 2 minutes of insertion

  if (isFreshInsert && !isNaN(appliedTime)) {
    effectiveTime = appliedTime;
  } else if (isNaN(effectiveTime) && !isNaN(appliedTime)) {
    effectiveTime = appliedTime;
  }

  if (isNaN(effectiveTime)) {
    return false;
  }

  return now - effectiveTime > SEVEN_DAYS_MS;
}

/**
 * Filters applications that require a follow-up reminder.
 * Used for FollowUpReminderBanner count and table inline tag.
 */
export function getFollowUps(
  applications: Application[],
  now = Date.now()
): Application[] {
  return applications.filter((app) => isFollowUp(app, now));
}
