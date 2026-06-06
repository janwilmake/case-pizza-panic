// Domain types and the order state machine.

export const STATUSES = [
  "received",
  "oven",
  "transit",
  "delivered",
  "burned",
] as const;

export type Status = (typeof STATUSES)[number];

// Statuses an order can still move out of. Terminal statuses never "get stuck".
export const TERMINAL_STATUSES: Status[] = ["delivered", "burned"];

// Allowed forward transitions. The happy path is
// received -> oven -> transit -> delivered, with oven -> burned as the sad path.
export const TRANSITIONS: Record<Status, Status[]> = {
  received: ["oven"],
  oven: ["transit", "burned"],
  transit: ["delivered"],
  delivered: [],
  burned: [],
};

// Which "<role>_by" column records who performed a given transition.
// received_by is filled at creation; the rest when the status is changed.
export const STATUS_ACTOR_COLUMN: Partial<
  Record<Status, "oven_by" | "delivery_by">
> = {
  oven: "oven_by",
  burned: "oven_by", // it burns in the oven, so the oven operator owns it
  transit: "delivery_by",
  delivered: "delivery_by",
};

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  items: OrderItem[];
  note: string | null;
  address: string;
  status: Status;
  created_at: string; // ISO timestamp
  status_updated_at: string; // ISO timestamp
  received_by: string | null;
  oven_by: string | null;
  delivery_by: string | null;
}

// An order turns red when it sits in a non-terminal status for longer than this.
export const STUCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export function isStuck(order: Order, now: number = Date.now()): boolean {
  if (TERMINAL_STATUSES.includes(order.status)) return false;
  return now - new Date(order.status_updated_at).getTime() > STUCK_THRESHOLD_MS;
}

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
