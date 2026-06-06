import type { Status } from "./types";

// Presentation + the action that advances an order TO a given status.
export const STATUS_META: Record<
  Status,
  { label: string; badgeClass: string; actionLabel: string }
> = {
  received: {
    label: "Received",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    actionLabel: "Mark received",
  },
  oven: {
    label: "In oven",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    actionLabel: "Put in oven",
  },
  transit: {
    label: "Out for delivery",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    actionLabel: "Send out",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    actionLabel: "Mark delivered",
  },
  burned: {
    label: "Burned",
    badgeClass: "bg-neutral-800 text-neutral-100 border-neutral-700",
    actionLabel: "Burned 🔥",
  },
};

export const FILTERABLE_STATUSES: Status[] = [
  "received",
  "oven",
  "transit",
  "delivered",
  "burned",
];
