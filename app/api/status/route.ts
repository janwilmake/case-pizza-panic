import { ORDERS_TABLE, getSupabaseAdmin } from "@/lib/supabase";
import { statusSchema } from "@/lib/schemas";
import { canTransition, STATUS_ACTOR_COLUMN, type Order } from "@/lib/types";
import { z } from "zod";

// POST /api/status — move an order to a new status, recording who did it.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { id, status, username } = parsed.data;
  const supabase = getSupabaseAdmin();

  // Read the current status so we can enforce the state machine server-side.
  const { data: current, error: readError } = await supabase
    .from(ORDERS_TABLE)
    .select("status")
    .eq("id", id)
    .maybeSingle<Pick<Order, "status">>();

  if (readError) {
    return Response.json({ error: readError.message }, { status: 500 });
  }
  if (!current) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (!canTransition(current.status, status)) {
    return Response.json(
      {
        error: `Cannot move an order from "${current.status}" to "${status}".`,
      },
      { status: 409 },
    );
  }

  const update: Record<string, unknown> = {
    status,
    status_updated_at: new Date().toISOString(),
  };
  const actorColumn = STATUS_ACTOR_COLUMN[status];
  if (actorColumn) update[actorColumn] = username;

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ order: data });
}
