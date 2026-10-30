import styles from "./StatusBadge.module.css";

/** Maps DB enum values to display labels + CSS Module class names. */
const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  Submitted: { label: "Submitted", className: "submitted" },
  Test: { label: "Technical Test", className: "test" },
  Task: { label: "Take Home Task", className: "task" },
  "Test & Task": { label: "Test & Task", className: "test" },
  Interview: { label: "Interview", className: "interview" },
  "Interview HR": { label: "Interview HR", className: "interview" },
  "Interview User": { label: "Interview User", className: "interview" },
  LGD: { label: "LGD", className: "interview" },
  FGD: { label: "FGD", className: "interview" },
  Offering: { label: "Offering Received", className: "offering" },
  "Offering Received": { label: "Offering Received", className: "offering" },
  Rejected: { label: "Rejected", className: "rejected" },
};

export interface StatusBadgeProps {
  /** DB enum value, e.g. "Submitted", "Test", "Offering" */
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const resolved = STATUS_MAP[status] ?? {
    label: status,
    className: "default",
  };

  return (
    <span className={`${styles.badge} ${styles[resolved.className]}`}>
      {resolved.label}
    </span>
  );
}

export default StatusBadge;
