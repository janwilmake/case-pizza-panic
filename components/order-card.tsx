"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSITIONS,
  isStuck,
  type Order,
  type Status,
} from "@/lib/types";
import { STATUS_META } from "@/lib/status-meta";
import { APP_TIMEZONE } from "@/lib/date";
import { Button } from "@/components/ui/button";

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIMEZONE,
  });
}

function minutesSince(iso: string, now: number): number {
  // Clamp at 0: a freshly-set timestamp can be slightly ahead of our ticking
  // `now` (and of any small client/server clock skew), which would otherwise
  // briefly render as -1m.
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

function itemsSummary(order: Order): string {
  const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
  return `${count} ${count === 1 ? "pizza" : "pizzas"}`;
}

function orderTotal(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
}

export function OrderCard({
  order,
  now,
  busy,
  onChangeStatus,
}: {
  order: Order;
  now: number;
  busy: boolean;
  onChangeStatus: (order: Order, to: Status) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stuck = isStuck(order, now);
  const meta = STATUS_META[order.status];
  const nextStatuses = TRANSITIONS[order.status];
  const minsInStatus = minutesSince(order.status_updated_at, now);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-colors",
        stuck && "border-red-300 bg-red-50",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{order.customer_name}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                meta.badgeClass,
              )}
            >
              {meta.label}
            </span>
            {stuck && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                <AlertTriangle className="size-3" /> Stuck {minsInStatus}m
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{timeOfDay(order.created_at)}</span>
            <span>·</span>
            <span>{itemsSummary(order)}</span>
            <span>·</span>
            <span className="truncate">{order.address}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!stuck && !["delivered", "burned"].includes(order.status) && (
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Clock className="size-3" /> {minsInStatus}m
            </span>
          )}
          {nextStatuses.map((to) => (
            <Button
              key={to}
              size="sm"
              variant={to === "burned" ? "destructive" : "default"}
              disabled={busy}
              onClick={() => onChangeStatus(order, to)}
            >
              {STATUS_META[to].actionLabel}
            </Button>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t px-10 py-3 text-sm sm:grid-cols-2">
          <div>
            <h4 className="mb-1 font-medium">Items</h4>
            <ul className="space-y-0.5 text-muted-foreground">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>€{(item.quantity * item.price).toFixed(2)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 border-t pt-0.5 font-medium text-foreground">
                <span>Total</span>
                <span>€{orderTotal(order).toFixed(2)}</span>
              </li>
            </ul>
            {order.note && (
              <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-amber-800">
                📝 {order.note}
              </p>
            )}
          </div>

          <div className="space-y-1 text-muted-foreground">
            {order.customer_phone && (
              <p className="flex items-center gap-1">
                <Phone className="size-3" />
                <a
                  className="hover:underline"
                  href={`tel:${order.customer_phone}`}
                >
                  {order.customer_phone}
                </a>
              </p>
            )}
            <p>Address: {order.address}</p>
            <div className="mt-2 space-y-0.5">
              <p>Received by: {order.received_by ?? "—"}</p>
              <p>Oven by: {order.oven_by ?? "—"}</p>
              <p>Delivery by: {order.delivery_by ?? "—"}</p>
            </div>
            <p className="mt-2 text-xs">
              In “{meta.label}” for {minsInStatus}m (since{" "}
              {timeOfDay(order.status_updated_at)})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
