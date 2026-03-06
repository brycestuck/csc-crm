import { activityTypes, type ActivityType } from "@/lib/types/domain";

const activityTypeLabels: Record<ActivityType, string> = {
  email_sent: "Email sent",
  email_received: "Email received",
  call: "Call",
  meeting: "Meeting",
  sample_shipped: "Sample shipped",
  sample_received: "Sample received",
  internal_note: "Internal note",
  follow_up: "Follow up",
  commission_report_received: "Commission report received",
  invoice_sent: "Invoice sent",
  payment_received: "Payment received",
  payment_sent: "Payment sent",
  data_requested: "Data requested",
  data_received: "Data received",
  financial_note: "Financial note",
  budget_update: "Budget update",
};

function humanizeToken(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      return index === 0 ? `${lower[0]?.toUpperCase() || ""}${lower.slice(1)}` : lower;
    })
    .join(" ");
}

export function isKnownActivityType(value: string): value is ActivityType {
  return (activityTypes as readonly string[]).includes(value);
}

export function formatActivityTypeLabel(value: string) {
  if (isKnownActivityType(value)) {
    return activityTypeLabels[value];
  }

  return humanizeToken(value);
}
