# Pizza Panic

Take orders, follow them through the kitchen, and track delivery before the pizza
goes cold. Built with Next.js (App Router) + Supabase Postgres + TypeScript.

## Running locally

You need Node.js 20.9+ and a Supabase project (the free tier is fine).

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create the database table.** In the Supabase dashboard open the **SQL Editor**
   and run [`supabase/schema.sql`](supabase/schema.sql). Optionally also run
   [`supabase/seed.sql`](supabase/seed.sql) for demo orders (including some that
   are already "stuck" and one that's burned, so the signals are visible).

3. **Configure environment.** Copy the example and fill in your project values
   (Supabase dashboard → Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to find it |
   | --- | --- |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service-role / secret key (server-side only) |
   | `NEXT_PUBLIC_APP_TIMEZONE` | Optional, defaults to `Europe/Amsterdam` |

4. **Run it**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. Set your name (top right) — it's stored on the
   device and recorded on every order you take or move. Create an order, then
   walk it through the statuses on the overview; open a second tab to see updates
   arrive within ~2s.

## Tech stack

- **Next.js 16 (App Router) + React + TypeScript** — frontend, serverless API
  routes, and end-to-end types.
- **Supabase Postgres** — persistence, accessed server-side only via the
  service-role key (the browser never touches the DB).
- **SWR** — 2-second polling on the overview plus optimistic status updates.
- **Zod** — request validation in the API routes (shared schemas).
- **react-hook-form** — the create-order form.
- **Tailwind CSS + shadcn/ui** — styling and accessible components (dialog, etc.).

## How it's structured

- `app/page.tsx` — overview (polling, date + status filter, inline status changes).
- `app/create/page.tsx` — create-order form.
- `app/api/{create,status,overview}/route.ts` — the three endpoints.
- `lib/` — domain types + state machine (`types.ts`), Zod schemas, the 06:00
  business-day date math (`date.ts`), and the Supabase client.
- The status state machine is enforced **server-side** in `/api/status`: an order
  can only move `received → oven → transit → delivered` or `oven → burned`.

---

**Choices**:

- We are using a full stack architecture with database using supabase postgres. This is chosen because we assume the user wants to manage the same data from several devices (computers, phones). Also, the assignment instructs us to have a backend. If this were not the case we could've done everything in the front-end and use localStorage to store the orders locally.

- We are using Next.js with React and Typescript. This gives us a front-end and a severless backend and type-safety.

- Our datastructure can be something like: `orders: {id, customer_name, customer_phone, items:{name,quantity,price}[], note, address, status:"received"|"oven"|"burned"|"transit"|"delivered",created_at,status_updated_at,received_by,oven_by,delivery_by}`.

- I added 'note' so customers can provide a note for the order (e.g. extra pineapple). I added 'customer_phone' so we can call them if something goes wrong. I added 'received_by', 'oven_by' and 'delivery_by' so we can keep track of who's responsible for the different steps in the process so management can know who to talk to when things go wrong.

- We need the following pages with functionality:
  - **create order**: form to create a new order. received_by is auto-filled using the username.
  - **overview**: showing all orders of today (day starts at 6AM) with an ability to easily edit the status from here. When editing the status, it needs to go through `received -> oven -> transit -> delivered` or `received -> oven -> burned` and the `_by` colums are automatically filled using the username of the person who altered the status (I assume here that that person is the person doing that task). Orders are sorted at `created_at` reverse chronologically, and when an order is on a given status for more than 30m, it should turn red, except for terminal statuses (`delivered` or `burned`). Only the orders of a certain date are shown (defaults to today) and you should easily be able to change the date by clicking on it. There should be a filter on top for the status so you can easily see all orders for a given status. It's important that the data is fresh without refresh, so let's fetch the data from the backend every two seconds (polling) as this is by far the simplest solution. On the top-right the "username" is shown and clicking it allows editing it using a dialog. The "username" is stored in localStorage. The form or editing the status cannot be submitted without it.

- **What I left out and why**: I decided we don't need a detail page; having the ability to alter the status in the overview itself makes it easy enough. All details can be retrieved in the overview and shown on expansion, no extra page is needed for this.

- The backend needs a few endpoints:
  - `/api/create`: create a new order
  - `/api/status`: set the status for an order
  - `/api/overview?date=YYYY-MM-DD`: retrieve all orders for a given date (defaults to today, and it retrieves all orders from 6AM to 6AM on the next date).

- How I would've done auth: supabase has built-in authentication and authorization, with multiple 2FA methods (google, apple, sms, etc) making it very easy to set up. For more details, see: https://supabase.com/docs/guides/auth

- **Scaling**: How this would break if it were to process 10k orders a day: assuming they come in within a window of 6 hours (5-11pm) we receive on average 0.46 orders per second. Writing to the database doesn't give us a bottleneck (see: https://supabase.com/docs/guides/realtime/limits). However, storing a large amount of historic rows could make the table very large. After 10 years, 10k orders per day means a whopping 36.500.000 orders would be stored. This is theoretically still possible: with an average of 1KB per order, this would mean roughly 37GB is stored in the table. We'd need an index on `created_at` though so we can quickly receive the latest orders for a given date. With dozens (lets say 24) of overviews open and a query every 2 seconds per device, we could expect to have to handle 12 queries of the overview per second. This wouldn't break, but is inefficient. To overcome this, we could add a caching layer in between to reduce the amount of DB queries to once per 2 seconds, or we could use supabase realtime (https://supabase.com/docs/guides/realtime).
