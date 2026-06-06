import { ORDERS_TABLE, getSupabaseAdmin } from "@/lib/supabase";
import {
  businessDayWindow,
  currentBusinessDate,
  isValidDateString,
} from "@/lib/date";

// GET /api/overview?date=YYYY-MM-DD — all orders for one business day
// (06:00 on `date` to 06:00 the next day). Defaults to the current business day.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (dateParam && !isValidDateString(dateParam)) {
    return Response.json(
      { error: "Invalid date, expected YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const date = dateParam ?? currentBusinessDate();
  const { startISO, endISO } = businessDayWindow(date);

  const { data, error } = await getSupabaseAdmin()
    .from(ORDERS_TABLE)
    .select("*")
    .gte("created_at", startISO)
    .lt("created_at", endISO)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ date, orders: data });
}
