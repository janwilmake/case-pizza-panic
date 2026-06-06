"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { fetcher, postJSON } from "@/lib/api";
import { currentBusinessDate } from "@/lib/date";
import {
  STATUS_ACTOR_COLUMN,
  isStuck,
  type Order,
  type Status,
} from "@/lib/types";
import { FILTERABLE_STATUSES, STATUS_META } from "@/lib/status-meta";
import { useUsername } from "@/lib/use-username";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OverviewResponse = { date: string; orders: Order[] };
type Filter = Status | "all";

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export default function OverviewPage() {
  const { username } = useUsername();
  const [date, setDate] = useState(() => currentBusinessDate());
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Keep "x minutes in status" / stuck state ticking between data refetches.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const today = currentBusinessDate();
  const { data, isLoading, mutate } = useSWR<OverviewResponse>(
    `/api/overview?date=${date}`,
    fetcher,
    { refreshInterval: 2000, keepPreviousData: true },
  );

  const orders = useMemo(() => data?.orders ?? [], [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of FILTERABLE_STATUSES) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const stuckCount = useMemo(
    () => orders.filter((o) => isStuck(o, now)).length,
    [orders, now],
  );

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function changeStatus(order: Order, to: Status) {
    if (!username) {
      toast.error(
        "Set your name first (top right) so we can record who did this.",
      );
      return;
    }
    setBusyId(order.id);

    const actorCol = STATUS_ACTOR_COLUMN[to];
    const optimistic: OverviewResponse | undefined = data && {
      ...data,
      orders: data.orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: to,
              status_updated_at: new Date().toISOString(),
              ...(actorCol ? { [actorCol]: username } : {}),
            }
          : o,
      ),
    };

    try {
      await mutate(
        async () => {
          await postJSON("/api/status", { id: order.id, status: to, username });
          return undefined; // fall through to a fresh revalidation
        },
        {
          optimisticData: optimistic,
          rollbackOnError: true,
          revalidate: true,
          populateCache: false,
        },
      );
      if (to === "burned") {
        toast("🔥 Another one bites the crust. Pour one out.");
      } else {
        toast.success(`Moved to “${STATUS_META[to].label}”`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update status",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Date controls */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold">Orders</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDate((d) => shiftDate(d, -1))}
          aria-label="Previous day"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          disabled={date >= today}
          onClick={() => setDate((d) => shiftDate(d, 1))}
          aria-label="Next day"
        >
          <ChevronRight className="size-4" />
        </Button>
        {date !== today && (
          <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
            Today
          </Button>
        )}
        {isLoading && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Stuck banner */}
      {stuckCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          <AlertTriangle className="size-4" />
          {stuckCount} order{stuckCount > 1 ? "s" : ""} stuck for more than 30
          minutes — needs attention.
        </div>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={counts.all}
        />
        {FILTERABLE_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={STATUS_META[s].label}
            count={counts[s] ?? 0}
          />
        ))}
      </div>

      {/* Orders */}
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-card py-12 text-center text-sm text-muted-foreground">
          {orders.length === 0
            ? "No orders for this day yet."
            : "No orders match this filter."}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              busy={busyId === order.id}
              onChangeStatus={changeStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:bg-accent",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-xs",
          active ? "bg-background/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
