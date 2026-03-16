import type { PortraitJobStatus } from "@/types/domain";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getJobStatusTone(status: PortraitJobStatus) {
  switch (status) {
    case "done":
      return "success" as const;
    case "failed":
      return "danger" as const;
    default:
      return "admin" as const;
  }
}
