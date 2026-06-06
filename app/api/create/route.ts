import { ORDERS_TABLE, getSupabaseAdmin } from "@/lib/supabase";
import { createOrderSchema } from "@/lib/schemas";
import { z } from "zod";

// POST /api/create — create a new order in the "received" status.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { received_by, ...order } = parsed.data;

  const { data, error } = await getSupabaseAdmin()
    .from(ORDERS_TABLE)
    .insert({ ...order, status: "received", received_by })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ order: data }, { status: 201 });
}
